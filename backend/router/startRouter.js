const express = require("express");
const mongoose = require("mongoose");
const redisClient = require("../config/redis");

const startRouter = express.Router();

startRouter.get("/", (req, res) => {
  res.send("server is running");
});

startRouter.get("/health", async (req, res) => {
  const checks = {
    mongodb: { status: "down" },
    redis: { status: "down" },
  };

  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      checks.mongodb.status = "up";
    }
  } catch (error) {
    checks.mongodb.status = "down";
  }

  try {
    if (redisClient.isReady) {
      await redisClient.ping();
      checks.redis.status = "up";
    }
  } catch (error) {
    checks.redis.status = "down";
  }

  const healthy = Object.values(checks).every((check) => check.status === "up");

  return res.status(healthy ? 200 : 503).json({
    status: healthy,
    service: "KashiRoute API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  });
});

module.exports = startRouter;
