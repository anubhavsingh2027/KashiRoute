const express = require("express");
const startRouter = express.Router();

startRouter.get("/",(req,res,next)=>{
  res.send("server is running");
})


module.exports = startRouter;