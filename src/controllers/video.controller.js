import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import cloudinary from "cloudinary";
import { User } from "../models/user.models.js"

function extractPublicId(url) {
    return url.match(/upload\/(?:v\d+\/)?(.+)\.\w+$/)[1];
}

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    const matchFilter = {};
    if (userId) {
        matchFilter.owner = new mongoose.Types.ObjectId(userId);
    }
    if (query) {
        matchFilter.title = { $regex: query, $options: "i" }; // Case-insensitive search
    }

    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1;

    const video = await Video.aggregate([
        { $match: matchFilter},
        { $sort: sort },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
        ]);

        const totalVideos = await Video.countDocuments(matchFilter);    

        return res.status(200).json(new ApiResponse(200, {
            video,
            totalVideos,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalVideos / limit),
        }, "All videos fetched successfully!"));

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;

    // TODO: get video, upload to cloudinary, create video
    const videoFileLocalPath = req.files?.videoFile?.[0].path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;
    
    if(!videoFileLocalPath){
        throw new ApiError(400, "Video is required!");
    };

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required!");
    };

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new ApiError(400, "Failed to upload videoFile");
    }
    if(!thumbnail){
        throw new ApiError(400, "Failed to upload thumbnail");
    }

    const video = await Video.create({
         title,
         description,
         videoFile: videoFile?.url, // maybe here i will use public id sometime. 
         thumbnail: thumbnail?.url,
         duration: videoFile?.duration,
         owner: req.user._id,
    })
    // timestamps i will use later.
     
    if(!video){
        throw new ApiError(400, "Failed to create video");
    }
    
    return res.status(200).json(new ApiResponse(200, video, "Video Published successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id

    if(!videoId){
        throw new ApiError(400, "Enter video Id");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Video not found!");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully!"));

})

//TODO: update video details like title, description
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400, "Enter valid video Id");
    }

    const {newTitle, newDescription} = req.body;
    if(!(newTitle || newDescription)){
         throw new ApiError(400, "Fill atleast one section to update!");
    }
    
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400, "Video not found!");
    }

    video.title = newTitle;
    video.description = newDescription;
    const progress = await video.save({validateBeforeSave: false});

    if(!progress){
        throw new ApiError(400,"Updatation failed");
    }

    return res.status(200).json(new ApiResponse(200, progress, "Video details updated successfully!"));
})

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params // automatically extracted id from paramaters.
    //TODO: update video thumbnail

    if(!videoId){
        throw new ApiError(400, "Enter valid video Id");
    }

    const newThumbnailPath = req.file?.path

    if(!(newThumbnailPath)){
         throw new ApiError(400, "Thumbnail not found!");
    }
    
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Video object not found!");
    }

    const url = video.thumbnail;
    console.log(url);
    const publicId = extractPublicId(url);
    console.log(publicId);

    const result = await cloudinary.v2.uploader.upload(newThumbnailPath,{
      public_id: publicId, // this ensures it's uploaded to the same path
      overwrite: true,     // this replaces the old asset
      invalidate: true     // optional: forces CDN to update
    });

    if(!result || !result.secure_url){
        throw new ApiError(400, "Failed to update thumbnail!");
    }
    // asset id will change but public id will remain same when overwritten.
    return res.status(200).json(new ApiResponse(200, result, "Thumbnail updated successfully!"));

})

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(400, "Enter valid video Id");
    }
    
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400, "Video not found!");
    }

    const url_video = video.videoFile;
    console.log(url_video);
    const publicId_vid = extractPublicId(url_video);
    console.log(publicId_vid);

    const url_thumbnail = video.thumbnail;
    console.log(url_thumbnail);
    const publicId_thumb = extractPublicId(url_thumbnail);
    console.log(publicId_thumb);

    const delVideo = await cloudinary.v2.uploader.destroy(publicId_vid,{resource_type: 'video' });
    const delThumbnail = await cloudinary.v2.uploader.destroy(publicId_thumb);
    
    if (!delVideo || delVideo.result !== "ok") {
        throw new ApiError(400, `Error in deleting video from Cloudinary: ${delVideo.result}`);
    }

    if (!delThumbnail || delThumbnail.result !== "ok") {
        throw new ApiError(400, `Error in deleting thumbnail from Cloudinary: ${delThumbnail.result}`);
    }
    
    const deleted = await video.deleteOne();
    if(!deleted){
        throw new ApiError(400, "Video not deleted from database!");
    }

    return res.status(200).json(new ApiResponse(200, delVideo,delThumbnail, "Video deleted successfully!"));

}) 

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId);

    if(!videoId){
        throw new ApiError(400, "Enter valid video Id");
    }

    video.isPublished = true;
    await video.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, video, "Video is published!"));
    
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoThumbnail
}

