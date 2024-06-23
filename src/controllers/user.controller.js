import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    console.log(userId);
    const user = await User.findById(userId);
    console.log(user);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken;
    user.save({validateBeforeSave:false});

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