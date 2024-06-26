import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
})

const getVideoById = asyncHandler(
  async (req, res) => {
    const { videoId } = req.params;

    if(!videoId){
      throw new ApiError(401, "Video id is required")
    }

    const videoDetails = await Video.aggregate([
      {
        $match:{
          _id: new mongoose.Types.ObjectId(videoId)
        }
      },
      {
        $lookup:{
          from:"users",
          localField:"owner",
          foreignField:"_id",
          as:"owner"
        }
      },
      {
        $lookup:{
          from:"likes",
          localField:"_id",
          foreignField:"video",
          as:"likes"
        }
      },
      {
        $lookup:{
          from:"comments",
          localField:"_id",
          foreignField:"video",
          as:"comments",
          pipeline:[
            {
              $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"commentOwner",
                pipeline:[
                  {
                    $project:{
                      fullname:1,
                      avatar:1,
                    }
                  }
                ]
              },
            }
          ]
        }
      }
    ]);
  }
);

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}