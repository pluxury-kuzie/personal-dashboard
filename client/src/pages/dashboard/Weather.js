import { useState } from "react";
import { api } from "../../lib/api";

export default function Weather() {
  const [city, setCity] = useState("Riga");
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr(null); setLoading(true);
    try {
      const res = await api(`/weather?city=${encodeURIComponent(city)}`);
      setData(res);
    } catch (e) {
      setErr("Не удалось получить погоду (проверь город)");
      setData(null);
    } finally { setLoading(false); }
  }

  function getWeatherIcon(code) {
    // Простые эмодзи для погоды
    if (code >= 0 && code <= 3) return "☀️"; // ясно
    if (code >= 45 && code <= 48) return "🌫️"; // туман
    if (code >= 51 && code <= 67) return "🌧️"; // дождь
    if (code >= 71 && code <= 77) return "🌨️"; // снег
    if (code >= 80 && code <= 82) return "🌦️"; // ливень
    if (code >= 85 && code <= 86) return "🌨️"; // снегопад
    if (code >= 95 && code <= 99) return "⛈️"; // гроза
    return "🌤️"; // по умолчанию
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Погода
        </h1>
      </div>

      {/* Поиск города */}
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={city}
            onChange={(e)=>setCity(e.target.value)}
            placeholder="Введите город (например, Riga)"
            className="flex-1 rounded-xl bg-gray-900/50 border border-gray-600/50 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
          <button
            onClick={load}
            disabled={loading || !city.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Загрузка…
              </span>
            ) : "Показать"}
          </button>
        </div>
      </div>

      {err && (
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-200">
          <span className="text-red-400">⚠</span>
          {err}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Текущая погода */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-white mb-1">{data.location}</div>
                <div className="text-sm text-blue-200">
                  Координаты: {data.coords.lat.toFixed(2)}, {data.coords.lon.toFixed(2)}
                </div>
              </div>
              <div className="text-4xl">{getWeatherIcon(data.current.weathercode)}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-blue-600/20 border border-blue-500/30">
                <div className="text-3xl font-bold text-white">{data.current.temperature}°C</div>
                <div className="text-blue-200 text-sm">Температура</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-blue-600/20 border border-blue-500/30">
                <div className="text-3xl font-bold text-white">{data.current.windspeed} м/с</div>
                <div className="text-blue-200 text-sm">Ветер</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-blue-600/20 border border-blue-500/30">
                <div className="text-3xl font-bold text-white">{getWeatherIcon(data.current.weathercode)}</div>
                <div className="text-blue-200 text-sm">Погода</div>
              </div>
            </div>
          </div>

          {/* Прогноз на 7 дней */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Прогноз на неделю</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.daily.slice(0, 7).map((d) => (
                <div key={d.date} className="group bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-2">{getWeatherIcon(d.weathercode || 0)}</div>
                    <div className="font-semibold text-white text-sm mb-1">
                      {new Date(d.date).toLocaleDateString('ru-RU', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-center">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Макс</span>
                      <span className="text-white font-semibold">{d.tmax}°</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Мин</span>
                      <span className="text-white font-semibold">{d.tmin}°</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Ощущ.</span>
                      <span className="text-blue-300 text-sm">{d.feels_max}° / {d.feels_min}°</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Осадки</span>
                      <span className="text-cyan-300 text-sm">{d.rain ?? 0} мм</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Ветер</span>
                      <span className="text-gray-300 text-sm">{d.windmax ?? 0} м/с</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
