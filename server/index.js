require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const Task = require("./models/Task");

const app = express();
app.use(cors());
app.use(express.json());

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const { auth } = require("./middleware/auth");

const Note = require("./models/Note");


// POST /api/auth/register { name?, email, password }
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name = "", email = "", password = "" } = req.body || {};
    const e = String(email).trim().toLowerCase();
    const p = String(password);

    if (!e || !p) return res.status(400).json({ error: "Email and password are required" });
    if (p.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email: e }).lean();
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(p, 10);
    const user = await User.create({ name: String(name).trim(), email: e, password: hash });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({ token, user });
  } catch (err) { next(err); }
});

// POST /api/auth/login { email, password }
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email = "", password = "" } = req.body || {};
    const e = String(email).trim().toLowerCase();
    const p = String(password);

    const user = await User.findOne({ email: e }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(p, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // вернём пользователя без пароля (toJSON-трансформ сработает)
    res.json({ token, user: user.toJSON() });
  } catch (err) { next(err); }
});

// health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ===== Tasks API (protected) =====
app.get("/api/tasks", auth, async (req, res, next) => {
  try {
    const items = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
});

app.post("/api/tasks", auth, async (req, res, next) => {
  try {
    const title = String(req.body?.title ?? "").trim();
    if (!title) return res.status(400).json({ error: "Title is required" });

    const created = await Task.create({ userId: req.user.id, title });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

app.patch("/api/tasks/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const patch = {};
    if (typeof req.body?.title !== "undefined") {
      const t = String(req.body.title).trim();
      if (!t) return res.status(400).json({ error: "Title cannot be empty" });
      patch.title = t;
    }
    if (typeof req.body?.done !== "undefined") {
      patch.done = !!req.body.done;
    }

    const updated = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      patch,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) { next(e); }
});

app.delete("/api/tasks/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.delete("/api/tasks", auth, async (req, res, next) => {
  try {
    if (req.query.done === "true") {
      const r = await Task.deleteMany({ userId: req.user.id, done: true });
      return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
    }
    res.status(400).json({ error: "Specify ?done=true to clear completed" });
  } catch (e) { next(e); }
});

// централизованный обработчик ошибок (лог + 500)
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err.stack || err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI || "mongodb+srv://liskuza_db_user:JcXCLpgOEXyavbL2@dodepp.k96gsv9.mongodb.net/?retryWrites=true&w=majority&appName=dodepp";

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  } catch (e) {
    console.error("❌ Failed to start server:", e.stack || e.message);
    process.exit(1);
  }
})();


// GET /api/notes?pinned=true|false (опционально)
app.get("/api/notes", auth, async (req, res, next) => {
  try {
    const q = { userId: req.user.id };
    if (typeof req.query.pinned !== "undefined") {
      q.pinned = req.query.pinned === "true";
    }
    const items = await Note.find(q).sort({ pinned: -1, updatedAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
});

// POST /api/notes { title, content? }
app.post("/api/notes", auth, async (req, res, next) => {
  try {
    const title = String(req.body?.title ?? "").trim();
    const content = String(req.body?.content ?? "").trim();
    if (!title) return res.status(400).json({ error: "Title is required" });

    const created = await Note.create({ userId: req.user.id, title, content });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// PATCH /api/notes/:id { title?, content?, pinned? }
app.patch("/api/notes/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const patch = {};
    if (typeof req.body?.title !== "undefined") {
      const t = String(req.body.title).trim();
      if (!t) return res.status(400).json({ error: "Title cannot be empty" });
      patch.title = t;
    }
    if (typeof req.body?.content !== "undefined") {
      patch.content = String(req.body.content).trim();
    }
    if (typeof req.body?.pinned !== "undefined") {
      patch.pinned = !!req.body.pinned;
    }
    const updated = await Note.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      patch,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /api/notes/:id
app.delete("/api/notes/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Note.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ===== Helpers: in-memory cache =====
const cache = new Map(); // key -> { expires: number, data: any }

function setCache(key, data, ttlMs) {
  cache.set(key, { expires: Date.now() + ttlMs, data });
}
function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) { cache.delete(key); return null; }
  return item.data;
}
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return await res.json();
}


// GET /api/weather?city=Riga
// Возвращает: { location, coords, current, daily[] }
app.get("/api/weather", async (req, res, next) => {
  try {
    const city = String(req.query.city || "").trim();
    if (!city) return res.status(400).json({ error: "city is required" });

    const cacheKey = `weather:${city.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    // 1) Геокодирование
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`;
    const geo = await fetchJSON(geoUrl);
    if (!geo.results || !geo.results.length) return res.status(404).json({ error: "city not found" });

    const g = geo.results[0];
    const { latitude, longitude, name, country } = g;

    // 2) Прогноз (текущая + 7 дней)
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,windspeed_10m_max&timezone=auto`;
    const fc = await fetchJSON(forecastUrl);

    const out = {
      location: `${name}${country ? ", " + country : ""}`,
      coords: { lat: latitude, lon: longitude },
      current: {
        temperature: fc.current?.temperature_2m ?? null,
        windspeed: fc.current?.wind_speed_10m ?? null,
        weathercode: fc.current?.weather_code ?? null,
        time: fc.current?.time ?? null,
      },
      daily: (fc.daily?.time || []).map((t, i) => ({
        date: t,
        tmax: fc.daily.temperature_2m_max?.[i] ?? null,
        tmin: fc.daily.temperature_2m_min?.[i] ?? null,
        feels_max: fc.daily.apparent_temperature_max?.[i] ?? null,
        feels_min: fc.daily.apparent_temperature_min?.[i] ?? null,
        rain: fc.daily.precipitation_sum?.[i] ?? null,
        windmax: fc.daily.windspeed_10m_max?.[i] ?? null,
      })),
    };

    // кэш на 15 минут
    setCache(cacheKey, out, 15 * 60 * 1000);
    res.json(out);
  } catch (e) { next(e); }
});

// ===== Currency API (Frankfurter.app) =====
// GET /api/currency/rates?base=USD
app.get("/api/currency/rates", async (req, res, next) => {
  try {
    const base = String(req.query.base || "USD").toUpperCase();
    const cacheKey = `rates:${base}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`;
    const data = await fetchJSON(url); // { amount, base, date, rates: {...} }

    // кэш на 12 часов
    setCache(cacheKey, data, 12 * 60 * 60 * 1000);
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/currency/convert?from=USD&to=EUR&amount=123.45
app.get("/api/currency/convert", async (req, res, next) => {
  try {
    const from = String(req.query.from || "USD").toUpperCase();
    const to = String(req.query.to || "EUR").toUpperCase();
    const amount = Number(req.query.amount || "1");
    if (!isFinite(amount) || amount < 0) return res.status(400).json({ error: "invalid amount" });

    // Можно конвертировать напрямую через API:
    // https://api.frankfurter.app/latest?amount=...&from=...&to=...
    const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const data = await fetchJSON(url); // { amount, base, date, rates: { [to]: value } }
    const rate = data.rates?.[to];
    if (typeof rate === "undefined") return res.status(400).json({ error: "conversion not available" });

    res.json({ from, to, amount, result: rate, date: data.date });
  } catch (e) { next(e); }
});
