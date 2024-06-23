import jwt from 'jsonwebtoken';
import { config } from "dotenv";
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';

config();

export const verifyJWT = asyncHandler(
  async (req,res,next)=>{
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
  
      if(!token){
        throw new ApiError(401,"Unauthorized user");
      }
  
      const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
  
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  
      if(!user){
        throw new ApiError(401,"Invalid Access Token");
      }
  
      req.user = user;
  
      next();
  
    } 
    catch (error) {
      throw new ApiError(401,error.message || "Invalid access token");  
    }
  }
);