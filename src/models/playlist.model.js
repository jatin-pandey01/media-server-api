import mongoose, { Schema,model } from "mongoose";

const playlistSchema = new Schema(
  {
    name:{
      type:String,
      required:true
    },
    description:{
      type:String,
      required:true,
    },
    videos:[{
      type:mongoose.Types.ObjectId,
      ref:"Video"
    }],
    owner:{
      type:mongoose.Types.ObjectId,
      ref:"User"
    }
  },
  {
    timestamps:true,
  }
);

export const Playlist = model("Playlist",playlistSchema);