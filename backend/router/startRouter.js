const express = require("express");
const startRouter = express.Router();

startRouter.get("/",(req,res,next)=>{
  res.send("server is running");
})
startRouter.get('/health',(req,res)=>{
  return res.status(200).json({
        status: true
      });
});

module.exports = startRouter;