import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {title, description} = req.body // here multer is not used that why not taking form data and parsing it.


    if (!title || title.trim() === "") {
        throw new ApiError(400, "Playlist title is required!");
    }

    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required!");
    }

    // check if playlist with same title already exists
    const existingPlaylist = await Playlist.findOne({
        title: title.trim(),
        owner: req.user._id
    })
    
    if (existingPlaylist) {
        throw new ApiError(400, "Playlist with this title already exists!");
    }

    const playlistDocument = await Playlist.create({
        title: title.trim(),
        description: description.trim(),
        owner: req.user._id,
        videos:[]
    })

    if(!playlistDocument){
        throw new ApiError(400, "Error in creating playlist!");
    }

    res.status(200).json(new ApiResponse(201, playlistDocument, "Playlist created successfully!"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId ){
        throw new ApiError(400, "User Id is required!");
    }

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId ){
        throw new ApiError(400, "Playlist Id is required!");
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id!");
    }
    const playlist = await Playlist.findById(playlistId).populate("videos")
    if(!playlist){
        throw new ApiError(404, "Playlist not found!");
    }
    res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully!"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!playlistId ){
        throw new ApiError(400, "Playlist Id is required!");
    }
    if(!videoId ){
        throw new ApiError(400, "Video Id is required!");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id!");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id!");
    }
    
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found!");
    }

    // check if video is already in playlist
    const videoExists = playlist.videos.includes(videoId);
    if(videoExists){
        throw new ApiError(400, "Video already exists in playlist!");
    }
    // add video to playlist    
    playlist.videos.push(videoId)
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully!"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId ){
        throw new ApiError(400, "Playlist Id is required!");
    }
    if(!videoId ){
        throw new ApiError(400, "Video Id is required!");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id!");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id!");
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found!");
    }
    
    const videoExists = playlist.videos.includes(videoId);
    if(!videoExists){
        throw new ApiError(400, "Video do not exists in playlist!");
    }

    // remove video from playlist
    playlist.videos.pull(videoId);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully!"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId ){
        throw new ApiError(400, "Playlist Id is required!");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id!");
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found!");
    }

    await playlist.deleteOne()
    res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully!"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!playlistId ){
        throw new ApiError(400, "Playlist Id is required!");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id!");
    }
    if(!name || name.trim() === "" || !description || description.trim() === ""){
        throw new ApiError(400, "Playlist name or description is required!");
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found!");
    }

    if(playlist.title === name.trim() && playlist.description === description.trim()){
        throw new ApiError(400, "Choose different ");
    }

    playlist.title = name.trim();
    playlist.description = description.trim();
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully!"));
    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}