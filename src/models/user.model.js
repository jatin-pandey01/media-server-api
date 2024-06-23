import { Schema,model } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
config();

const userSchema = new Schema(
  {
    username:{
      type:String,
      required:true,
      unique:[true,"User name must be unique"],
      trim:true,
      lowercase:[true,"User name must be in lowercase only."],
      index:true,
    },
    email:{
      type:String,
      required:true,
      unique:[true,"Already email exist"],
      trim:true,
      lowercase:true,
    },
    fullname:{
      type:String,
      required:true,
      trim:true,
      index:true,
    },
    avatar:{
      type:String,
    },
    coverImage:{
      type:String,
    },
    watchHistory:[{
      type:Schema.Types.ObjectId,
      ref:"Video",
    }],
    password:{
      type:String,
      required:true,
    },
    refreshToken:{
      type:String,
    },
  },
  {
    timestamps:true,
  }
);

userSchema.pre("save",async function(next) {
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password,10);
  next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = async function(){
  return await jwt.sign(
    {
      _id:this._id,
      email:this.email,
      username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = async function(){
  return await jwt.sign(
    {
      _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = model('User',userSchema);