import { config } from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

config({path:'./env'});

const PORT = process.env.PORT || 4000;

connectDB()
.then(()=>{
  app.on("error",(err)=>{
    console.log("Error in connection : ", err);
  });

  app.listen(PORT,()=>{
    console.log(`Server is listening at ${PORT} port`);
  });
})
.catch((err)=>{
  console.log("Error in DB : ",err);
});