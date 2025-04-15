import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id.toString();


    if(!videoId && !userId){
        throw new ApiError(400,"Give video and user info!")
    }

    const existingLike = await Like.findOne({
        likedBy: userId,
        video: videoId,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Unliked successfully!")
        );
    }

    const likeDocument = await Like.create({
        likedBy:userId,
        video:videoId
    })

    if(!likeDocument){
        throw new ApiError(400, "Error in liking!");
    }

    res.status(200).json(new ApiResponse(200, likeDocument, "Like successful!"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id.toString();

    if(!commentId && !userId){
        throw new ApiError(400,"Give comment and user info!")
    }

    const existingLike = await Like.findOne({
        likedBy: userId,
        comment: commentId,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Unliked successfully!")
        );
    }

    const likeDocument = await Like.create({
        likedBy:userId,
        comment:commentId
    })

    if(!likeDocument){
        throw new ApiError(400, "Error in liking!");
    }
    
    res.status(200).json(new ApiResponse(200, likeDocument, "Like successful!"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id.toString();

    if(!tweetId && !userId){
        throw new ApiError(400,"Give tweet and user info!")
    }

    const existingLike = await Like.findOne({
        likedBy: userId,
        tweet:tweetId
    });
    
    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Unliked successfully!")
        );
    }

    const likeDocument = await Like.create({
        likedBy:userId,
        tweet:tweetId
    })

    if(!likeDocument){
        throw new ApiError(400, "Error in liking!");
    }

    res.status(200).json(new ApiResponse(200, likeDocument, "Like successful!"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    if(!userId){
        throw new ApiError(400,"Give user info!")
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
            }
        }
    ]);
    
    if(!likedVideos){
        throw new ApiError(400, "No liked videos found!");
    }
    
    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully!"));

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}