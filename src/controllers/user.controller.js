import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { request } from "express";

function extractPublicId(url) {
    return url.match(/upload\/(?:v\d+\/)?(.+)\.\w+$/)[1];
}

const generateRefreshTokenandAccessToken = async (userId) => {
   try{
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return {accessToken, refreshToken};

}

catch(error){
        throw new ApiError(500, "Failed to generate tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get details from user.
    // validate the data - not empty.
    // check if user already exists from email and username.
    // check for images and avatar.
    // upload them to cloudinary.
    // create user object - create entry in db.
    // remove password and refresh token field from response.
    // check for user creation.
    // return response.

    const {fullName, email, username, password}  = req.body // from .body by express, we can have form data or other json datas as well. Data can be send through URl.
    // console.log("email:" ,email);
    
    if([fullName, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    
    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })

    // console.log(!existedUser);

    if(existedUser){
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;     // .files is given by multer.
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // if(req.files?.coverImage?.[0]?.path) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }


    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);


    if(!avatar){
        throw new ApiError(400, "Failed to upload avatar");
    }
    

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully")); // good approch to return status with .status.

})

const loginUser = asyncHandler(async (req, res) => {
     // get email and password from the user.
     // if email and password are correct then give them access token.
     // redirect them to home page.
     // return response.

    const {email, username,  password} = req.body;
    
    if(!(username || email)) {
        throw new ApiError(400, "Either username or email are required!");
    }

    if(!password){
        throw new ApiError(400, "Password is required!");
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    });
    
    
    if(!user){
        throw new ApiError(404, "User not found!");
    }
 
    const validUser = await user.isPasswordCorrect(password);

    if(!validUser){
        throw new ApiError(401, "Invalid creditials!");
    }


    const {accessToken, refreshToken} = await generateRefreshTokenandAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // as previously user do not have the refresh token.
 

    const options = {
        httpOnly: true,
        secure: true,
    } // making this cookie can only be modified only from server not from frontend.

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200,{ loggedInUser,refreshToken,accessToken}, "User logged in successfully")); // sending accesstoken and refresh token in api response as well because it is a good practice and can be used in mobile applications.

})

const logOutUser = asyncHandler(async (req, res) => {
    // remove the refresh token from the user.
    // remove the refresh token from the cookie.
    // return response.

    await User.findByIdAndUpdate(req.user._id,
        {
         $set: {
            refreshToken : undefined,
         }
    },{
        new: true, // set the refresh token to undefined otherwise old value will be there.
    }
);

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully"));
    
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;
    if(!incommingRefreshToken){
        throw new ApiError(401, "Unauthorized request!!");
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401, "User not found! Invalid refresh token!");
        }
        
        if(incommingRefreshToken != user?.refreshToken){
            throw new ApiError(401, "Invalid or expired refresh token! ");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken, new_refreshToken} = await generateRefreshTokenandAccessToken(user._id); 
    
        return response.status(200).cookie("accessToken",accessToken, options).cookie("refreshToken", new_refreshToken, options).json(new ApiResponse(200, {accessToken, refreshToken}, "Access token refreshed!"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token!");
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const {oldPassword, newPassword} = req.body;

    if(!(oldPassword && newPassword)){
        throw new ApiError(400, "All fields are required!");
    }

    const user = await User.findById(req.user?._id);
    const correctPassword = await user.isPasswordCorrect(oldPassword);

    if(!correctPassword){
        throw new ApiError(400, "Invalid old password!");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully!"));

    // return res.status(200).redirect('/register');  
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User found!"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;
    if(!fullName || !email){
        throw new ApiError(400, "Atleast one field is required!");
    }

    User.findByIdAndUpdate(req.user?._id, {$set: {
        fullName,
        email
     }
    },{new:true}).select("-password"); // by set we can save database calls.

    return res.status(200).json(new ApiResponse(200, req.user, "Account detail updated successfully!"));

}); // professionally we should have have different controllers for text and image uploads.

const updateUserAvatar = asyncHandler(async(req, res) => {
    const currentAvatar = req.file?.path; // here only one file is present not files so file is written.
    if(!currentAvatar){
        throw new ApiError(400, "Avatar is required!");
    }
    
    // deleting the avatar
    const url = req.user.avatar;
    console.log(url);
    publicId = extractPublicId(url);
    console.log(publicId);

    const delAvatar = await cloudinary.uploader.destroy(publicId);
    if(!delAvatar){
        console.log("Avatar not deleted!");
    }
    
    const avatar = await uploadOnCloudinary(currentAvatar);
    if(!avatar.url){
        throw new ApiError(400, "Failed to upload avatar!");
    }

    req.user.avatar = avatar.url;
    await req.user.save({validateBeforeSave: false});



    return res.status(200).json(new ApiResponse(200, req.user, "Avatar updated successfully!"));

});

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const currentCoverImage = req.file?.path; // here only one file is present not files so file is written.
    if(!currentCoverImage){
        throw new ApiError(400, "Cover Image is required!");
    }

    const coverImage = await uploadOnCloudinary(currentCoverImage);
    if(!coverImage.url){
        throw new ApiError(400, "Failed to upload Cover Image!");
    }

    req.user.coverImage = coverImage.url;
    await req.user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, req.user, "Cover Image updated successfully!"));

});

const getUserChannelProfile = asyncHandler(async (req, res) => {
      const {username} = req.params;
      if(!username){
            throw new ApiError(400, "Username is required!");
    }
    
    // aggregation pipeline to get the channel profile.
    const channel = await User.aggregate([{
        $match: {
            username: username?.toLowerCase()
        }
    },{
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },{
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscriberTo"
        },
    },{
        $addFields:{
            subscribersCount: {$size: "$subscribers"},
            subscriberToCount: {$size: "$subscriberTo"},
            isSuscribed: {
                $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                    then: true,
                    else: false
                }
            },
        }
    },{
        $project: {
            fullName: 1,
            username: 1,
            avatar: 1,
            coverImage: 1,
            subscribersCount: 1,
            subscriberToCount: 1,
            isSuscribed: 1,
        }
    }


]
);
   if(!channel?.length){
       throw new ApiError(404, "Channel not found!");
   }

   return res.status(200).json(new ApiResponse(200, channel[0], "Channel found!"));

});

const getWatchHistory = asyncHandler(async (req, res) => {
      const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            },
            $lookup:{
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as:"owner",
                            pipeline:[{
                                $project:{
                                    username:1,
                                    fullName:1,
                                    avatar:1,
                                }
                            },{
                                $addFields:{
                                    owner:{
                                        $first: "$owner"
                                    }
                                }
                            }]
                        }
            }]
        }}
      ])
      return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch history found!"));
});

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
 };
