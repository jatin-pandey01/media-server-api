import mongoose,{ Schema,model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content:{
      type:String,
      required:true,
    },
    video:{
      type: mongoose.Types.ObjectId,
      ref:"Video",
      required:true,
    },
    owner:{
      type:mongoose.Types.ObjectId,
      ref:"User",
      required:true,
    }
  },
  {
    timestamps:true
  }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = model("Comment",commentSchema);