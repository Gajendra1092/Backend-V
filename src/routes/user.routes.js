import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logOutUser, refreshAccessToken, registerUser, updateAccountDetails, getUserChannelProfile, updateUserAvatar, updateUserCoverImage, getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]), 
    registerUser);
// router.route("/login").post(loginUser);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/Current_user").post(verifyJWT, getCurrentUser);
router.route("/update_account_detail").patch(updateAccountDetails); // patch to update only selected details not full account detail.
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage); // cover image is also avatar in the database. So, we can use the same function to update the cover image.
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watchHistory").patch(verifyJWT, getWatchHistory);
export default router;