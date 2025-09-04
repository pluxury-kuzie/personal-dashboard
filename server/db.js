const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI; // ← берём из окружения
  if (!uri) throw new Error("MONGODB_URI is not set");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const { host, name } = mongoose.connection;
  console.log(`✅ MongoDB connected: ${host}/${name}`);
}

module.exports = { connectDB };
