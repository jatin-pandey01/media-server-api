import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME ,
  api_key:process.env.CLOUD_API_KEY ,
  api_secret:process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
  try {
    if(!localFilePath) return null;

    //Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,{
      resource_type:"auto",
    });
    fs.unlinkSync(localFilePath); //Remove the locally saved temporary file as the upload operation got failed

    return response;  
  } catch (error) {
    fs.unlinkSync(localFilePath); 
    return null;
  }
}
export default uploadOnCloudinary;