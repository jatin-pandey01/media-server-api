import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { config } from "dotenv";
config();

const connectDB = async() => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
    // console.log(process.env.DATABASE_URL);
    console.log(`\nMongoDB connected !! DB Host : ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`Error : ${error}`);
    process.exit(1);
  }
}

export default connectDB;