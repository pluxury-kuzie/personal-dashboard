const mongoose = require("mongoose");
const uri = "mongodb+srv://liskuza_db_user:JcXCLpgOEXyavbL2@dodepp.k96gsv9.mongodb.net/?retryWrites=true&w=majority&appName=dodepp";


async function connectDB(uri) {
  if (!uri) throw new Error("MONGODB_URI is not set");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const { host, name } = mongoose.connection;
  console.log(`✅ MongoDB connected: ${host}/${name}`);
}

module.exports = { connectDB };
