import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateRefreshTokenandAccessToken = async (userId) => {
   try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save(validateBeforSave = false);

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
    
    if(!username || !email) {
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

    return res.status(200).cookie("accesstokens", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200,{ loggedInUser,refreshToken,accessToken}, "User logged in successfully")); // sending accesstoken and refresh token in api response as well because it is a good practice.

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

export {
    registerUser,
    loginUser,
    logOutUser,
} 