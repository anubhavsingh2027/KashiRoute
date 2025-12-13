// ===== Core modules =====
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");

// ===== External modules =====
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// ===== Local modules =====
const fetchRouter = require('./router/fetchdata');
const bookRouter = require('./router/bookRouter');
const authRouter = require('./router/AuthRouter');
const adminSetRouter = require('./router/adminResourcesSet');


// ===== App & DB setup =====
const app = express();
const mongoUrl = process.env.MONGO_URI;
const port = process.env.PORT || 8000;

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ===== CORS setup (CRITICAL) =====
app.use(cors({
  origin: ["https://kashiroute.nav-code.com"],
  credentials: true,
}));


//test server

app.get('/',(req,res,next)=>{
  res.send('server is running');
});


// ===== ROUTES =====
app.use("/kashikaTravel", fetchRouter);
app.use("/kashikaTravel/admin", adminSetRouter);
app.use("/kashikaTravel", authRouter);
app.use("/kashikaTravel", bookRouter);

// ===== Session (JWT) check =====
app.get("/kashikaTravel/session-user", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ loggedIn: false, user: { userType: "guest" } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      loggedIn: decoded.isLogged,
      user: decoded.user, // full user data
    });
  } catch (err) {
    return res.json({ loggedIn: false, user: { userType: "guest" } });
  }
});


// ===== Start server =====
mongoose.connect(mongoUrl)
  .then(() => {
    console.log("<======== MongoDB Connected Successfully =======>");
    app.listen(port, () => {
      console.log(`Server Running At http://localhost:${port}`);
    });
  })
  .catch(err => console.log("Error connecting MongoDB", err));
