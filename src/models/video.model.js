import { Schema,model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile:{
      type:String,
      required:true,
    },
    thumbnail:{
      type:String,
      required:true
    },
    title:{
      type:String,
      required:true,
    },
    description:{
      type:String,
      required:true,
    },
    duration:{
      type:Number,
      required:true,
    },
    views:{
      type:Number,
      default:0,
    },
    isPublished:{
      type:String,
      default:true,
    },
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User",
    },
    comments:[{
      userid:{
        type:Schema.Types.ObjectId,
        ref:"User"
      },
      comment:{
        type:String,
        required:true,
      }
    }],
  },
  {
    timestamps:true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = model('Video',videoSchema);