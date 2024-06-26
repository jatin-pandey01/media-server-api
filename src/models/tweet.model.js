import mongoose,{Schema,model} from "mongoose";

const tweetSchema = new Schema(
  {
    owner:{
      type: mongoose.Types.ObjectId,
      ref: "User"
    },
    content:{
      type:String,
      required:true
    }
  },
  {
    timestamps:true
  }
);

export const Tweet = model("Tweet",tweetSchema);