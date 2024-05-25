import express from "express";
import { config } from "dotenv";
import connectDB from "./db/index.js";

config({path:'./env'});

const app = express();

connectDB()
.then(()=>{
  app.on("error",(err)=>{
    console.log("Error in connection : ", err);
  });

  app.listen(process.env.PORT,()=>{
    console.log(`Server is listening at ${process.env.PORT} port`);
  });
})
.catch((err)=>{
  console.log("Error in DB : ",err);
});