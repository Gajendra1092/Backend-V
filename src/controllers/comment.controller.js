import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
        throw new ApiError(400, "Video Id is required!")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                  video: new mongoose.Types.ObjectId(videoId)
            }
        },{
            $group:{
                _id:"$video",
                totalComments: {$sum:1},
            }
        }
    ])
    
    if (!comments) {
        throw new ApiError(404, "No comments found for this video!")
    }

    res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully!"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    if (!videoId) {
        throw new ApiError(400, "Video Id is required!")
    }

    const {text} = req.body

    if (!text) {
        throw new ApiError(400, "Comment text is required!")
    }

    const comment = await Comment.create({
        content:text,
        video: videoId,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(500, "Unable to add comment!")
    }

    res.status(201).json(new ApiResponse(201, comment, "Comment added successfully!"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {text} = req.body
    
    if(!commentId) {
        throw new ApiError(400, "Comment Id is required!")
    }

    if (!text.trim()) {
        throw new ApiError(400, "Comment text is required!")
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found!")
    }

    comment.content = text;
    const progress = await comment.save();

    res.status(200).json(new ApiResponse(200, progress, "Comment updated successfully!"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!commentId) {
        throw new ApiError(400, "Comment Id is required!")
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found!")
    }

    const isDeleted = await comment.deleteOne();
    if (!isDeleted) {
        throw new ApiError(500, "Unable to delete comment!")
    }

    res.status(200).json(new ApiResponse(200, isDeleted, "Comment deleted successfully!"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }