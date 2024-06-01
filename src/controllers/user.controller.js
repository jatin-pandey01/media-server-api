import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const registerUser = asyncHandler(
  async(req,res)=>{
    
    const {username,fullname,email,password} = req.body;
    // console.log(req.body);

    if([username,fullname,email,password].some((field)=>field ?.trim() === "") || (!username || !fullname || !email || !password)){
      throw new ApiError(400  ,"All fields are required")
    }
    else if(!email.includes("@") || !email.includes('.')){
      throw new ApiError(400,"Please verify email address");
    }

    const existedUser = await User.findOne({
      $or:[{username},{email}]
    });

    if(existedUser){
      throw new ApiError(409,"User with current email or username exist");
    }

    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0].path;
    const coverImageLocalPath = req.files?.coverImage?.[0].path;

    if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is required");
    }

    // console.log(req.files?.avatar);

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
      throw new ApiError(400,"Avatar file is required");
    }

    const user = await User.create({
      fullname,
      email,
      username : username.toLowerCase(),
      password,
      avatar:avatar.url,
      coverImage : coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
      throw new ApiError(500,"Something went wrong while registering a user");
    }

    return res.status(201).json(
      new ApiResponse(true,200, createdUser, "User registered successfully")
    )

  }
);