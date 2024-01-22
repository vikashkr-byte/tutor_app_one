import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getJokes,
    getUserChannelProfile,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";
// import upload method  cloudinary middleware
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()


// test routes
router.route("/jokes").get(getJokes)

// register route
router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)

// login route
router.route("/login").post(loginUser)





// SECURED ROUTES***************************
// logout route
router.route("/logout").post(verifyJWT, logoutUser)

// refresh route
router.route("/refresh-token").post(refreshAccessToken)

// change password

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

// get current user
router.route("/current-user").get(verifyJWT, getCurrentUser)

// update account details
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

// change user avatar
router.route("/avatar")
    .patch(verifyJWT,
        upload.single("avatar"), updateUserAvatar)

// change coverimage
router.route("/coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// get channel profile
router.route('/channel/:username').get(verifyJWT, getUserChannelProfile)

export default router