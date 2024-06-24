import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    console.log(userId);
    const user = await User.findById(userId);
    console.log(user);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});

    return {accessToken,refreshToken};

  } catch (e) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token");
  }
}

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
      new ApiResponse(true,200, {user:createdUser}, "User registered successfully")
    )

  }
);

export const loginUser = asyncHandler(
  async (req,res)=>{
    const {username,password} = req.body;

    if(!username){
      throw new ApiError(400,"Username or email is required");
    }

    const user = await User.findOne({$or:[{username:username},{email:username}]});

    if(!user){
      throw new ApiError(404,"User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
      throw new ApiError(401,"Invalid user credentials");
    }
    
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const accessOptions = {
      httpOnly:true,
      secure:true,
    };

    const refreshOptions = {
      httpOnly:true,
      secure:true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,accessOptions)
    .cookie("refreshToken",refreshToken,refreshOptions)
    .json(
      new ApiResponse(true,200,{user:loggedInUser,accessToken,refreshToken},"Logged in successful")
    );

  }
);

export const logoutUser = asyncHandler(
  async (req,res)=>{
    console.log(req.user);
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined,
        }
      },
      {
        new:true,
      }
    );

    const options={
      httpOnly:true,
      secure:true,
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(true,200,{},"User logged out successfully")
    );
  }
);

export const refreshAccessToken = asyncHandler(
  async(req,res) => {
    
    try {
      const token = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ","");
  
      if(!token){
        throw new ApiError(401,"Unauthorized request");
      }
  
      const decodeToken = await jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
  
      const user = await User.findById(decodeToken?._id);
  
      if(!user){
        throw new ApiError(401,"Invalid refresh Token");
      }
  
      if(token !== user.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used");
      }
  
      const options = {
        httpOnly:true,
        secure:true,
      };
  
      const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
  
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
        new ApiResponse(true,200,{accessToken,refreshToken},"Access token refreshed")
      );
    } catch (error) {
      throw new ApiError(500,error?.message || "Something went wrong while refreshing access token");
    }
  }
);

export const changeCurrentPassword = asyncHandler(
  async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    
    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    
    if(!isPasswordCorrect){
      throw new ApiError(401,"Wrong old password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
      new ApiResponse(true,200,{},"Password changed successful")
    );
  }
);

export const getCurrentUser = asyncHandler(
  async(req,res)=>{
    return res.status(200).json(
      new ApiResponse(true,200,req.user,"Current user fetched successfully")
    );
  }
);

export const updateUserAvatar = asyncHandler(
  async(req,res)=>{
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.secure_url){
      throw new ApiError(400,"Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          avatar:avatar.secure_url,
        }
      },
      {
        new:true
      }
    ).select("-password");

    return res.status(200).json(
      new ApiResponse(true,200,user,"Avatar image updated successfully")
    );
  }
);

export const updateCoverImage = asyncHandler(
  async(req,res)=>{
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
      throw new ApiError(400,"Cover image file is missing");
    }

    const avatar = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar.secure_url){
      throw new ApiError(400,"Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          coverImage:avatar.secure_url,
        }
      },
      {
        new:true
      }
    ).select("-password");

    return res.status(200).json(
      new ApiResponse(true,200,user,"Cover image updated successfully")
    );
    
  }
);

export const getUserChannelProfile = asyncHandler(
  async(req,res) => {
    const {username} = req.params;

    if(!username?.trim()){
      throw new ApiError(400,"Username is mission in the parameter");
    }

    const channel = await User.aggregate([
      {
        $match:{
          username : username.toLowerCase()
        }
      },
      {
        $lookup:{
          from:"subscriptions",
          localField:"_id",
          foreignField:"channel",
          as:"subscribers"
        }
      },
      {
        $lookup:{
          from:"subscriptions",
          localField:"_id",
          foreignField:"subscriber",
          as:"subscribedTo"
        }
      },
      {
        $addFields:{
          subscribersCount:{
            $size:"$subscribers"
          },
          channelsSubscribedToCount:{
            $size:"$subscribedTo"
          },
          isSubscribed:{
            $cond:{
              if:{$in:[req.user?._id,"$subscribers.subscriber"]},
              then:true,
              else:false
            }
          }
        }
      },
      {
        $project:{
          fullname:1,
          username:1,
          avatar:1,
          coverImage:1,
          email:1,
          subscribersCount:1,
          channelsSubscribedToCount:1,
          isSubscribed:1,
        }
      }
    ]);

    console.log(channel);

    if(!channel?.length){
      throw new ApiError(404,"Channel does not exists.")
    }

    return res.status(200).json(
      new ApiResponse(true,200,channel,"User channel fetched successfully")
    );
  }
);