const mongoose = require("mongoose");
const mongoUrl =process.env.MONGO_URL ;

const mongoDb = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("<======== MongoDB Connected Successfully =======>");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

module.exports = mongoDb;
