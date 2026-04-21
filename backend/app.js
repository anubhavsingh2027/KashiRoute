// ===== Core modules =====
const dotenv = require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// ===== External modules =====
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// ===== Local modules =====
const fetchRouter = require("./router/fetchdata");
const bookRouter = require("./router/bookRouter");
const authRouter = require("./router/AuthRouter");
const adminSetRouter = require("./router/adminResourcesSet");
const paymentRouter = require("./router/paymentRouter");
const startRouter = require("./router/startRouter");
const mongoDb = require("./config/db");

// ===== App & DB setup =====
const app = express();
const port = process.env.PORT || 8000;

// ===== Middleware =====
const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ verify: rawBodySaver }));
app.use(cookieParser());

// ===== CORS setup (CRITICAL) =====
const development_url=process.env.development_url;
const production_url=process.env.production_url;
const state=process.env.NODE_ENV;
app.use(
  cors({
    origin: [
 state=="production"?production_url:development_url
    ],
    credentials: true,
  }),
);

// ===== ROUTES =====
app.use("/", startRouter);
app.use("/KashiRoute", fetchRouter);
app.use("/KashiRoute/admin", adminSetRouter);
app.use("/KashiRoute", authRouter);
app.use("/KashiRoute", bookRouter);
app.use("/KashiRoute/payment", paymentRouter);

// ===== Start server =====

app.listen(port, async() => {
  await mongoDb();
  console.log(`Server Running`);
});
