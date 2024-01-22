import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        // console.log('user:', user)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()



        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, error || "Something went wrong while generating refresh token and access token")
    }
}


const getJokes = asyncHandler(async (req, res) => {
    let jokesBe = [
        {
            "joke": "A programmer puts two glasses on his bedside table before going to sleep. A full one, in case he gets thirsty, and an empty one, in case he doesn’t."
        },
        {
            "joke": "If doctors were like software engineers, they would say things like “Have you tried killing yourself and being reborn?"
        },
        {
            "joke": "I would love to change the world, but they won’t give me the source code."
        },
        {
            "joke": "There are 10 types of people in the world: those who understand binary, and those who don’t."
        },
        {
            "joke": "Debugging is like being the detective in a crime drama where you are also the murderer."
        },
        {
            "joke": "Linux is only free if your time has no value."
        },
        {
            "joke": "There are only two kinds of programming languages: those people always bitch about and those nobody uses."
        },
        {
            "joke": "Programming today is a race between software engineers striving to build bigger and better idiot-proof programs, and the Universe trying to produce bigger and better idiots. So far, the Universe is winning."
        },
        {
            "joke": "If Java had true garbage collection, most programs would delete themselves upon execution."
        },
        {
            "joke": "C++ : Where friends have access to your private members."
        },
        {
            "joke": "Perl – The only language that looks the same before and after RSA encryption."
        },
        {
            "joke": "If debugging is the process of removing software bugs, then programming must be the process of putting them in."
        },
        {
            "joke": "I don’t care if it works on your machine! We are not shipping your machine!"
        },
        {
            "joke": "Some people, when confronted with a problem, think “I know, I’ll use regular expressions.” Now they have two problems."
        },
        {
            "joke": "A user interface is like a joke. if you have to explain it, it's not that good"
        },
        {
            "joke": "Why did the database administrator leave his wife? She had one-to-many relationships."
        },
        {
            "joke": "What did the array say after it  was extended? Stop objectifying me."
        },
        {
            "joke": "Why are keyboards always working so hard? Cause they have two shifts!"
        },
        {
            "joke": "What did the proud React component say to its child? I've got to give you props."
        },
        {
            "joke": "Lisp programmers don't make prank calls. They make FUNCALLs."
        },
        {
            "joke": "Have you heard the one about the Corduroy pillow? It's making HEADLINES!"
        },
        {
            "joke": "Hey officer! How did the hackers escape? No idea. They just ransomware."
        },
        {
            "joke": "Why did the programmer quit his job? Because he didn't get arrays."
        },
        {
            "joke": "There are 10 types of people in this world, those who understand binary and those who dont."
        },
        {
            "joke": "!false, It's funny 'cause it's true."
        },
        {
            "joke": "A programmer was arrested for writing unreadable code. They refused to comment"
        },
        {
            "joke": "The next time you're using Safari or Firefox and it's running slowly, you can say to yourself, I could've had a V8"
        },
        {
            "joke": "If Google matched people up by their browsing history,it could be the greatest online dating website of all the time."
        },
        {
            "joke": "How do you tell an introverted programmer from an extroverted programmer? An extroverted programmer looks at the other person's shoes while talking to them"
        },
        {
            "joke": "Save your sass for CSS. Everywhere else be kind."
        }
    ]
    return res.status(200).json(
        new ApiResponse(200,
            {
                jokes: jokesBe
            }, "User logged in seccessfully.")
    )
    res.send(jokesBe)
})
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation eg: empty, email format etc
    // chech if user already exists: username and email both
    // check for images, check for avatar
    // uload them to cloudinary, avatar
    // create user object- create entry in db
    // remove password and refresh token fielf from response
    // check for user creation 
    // return res

    const { username, email, password, fullName } = req.body
    // console.log('req.body:', req.body)
    if (
        [fullName, username, email, password].some((field) => { return field?.trim() === undefined })
    ) {
        throw new ApiError(400, "All fields are required.")
    }
    let ifUserExists = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (ifUserExists) {
        throw new ApiError(409, "Username/email already in use.")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    // console.log('req.files:', req.files.avatar[0].path)
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required.")
    }

    const user = await User.create({
        fullName, email, username: username.toLowerCase(), avatar: avatar.url, coverImage: coverImage?.url || "", password
    })

    const checkIfUserWasCreated = await User.findById(user._id).select("-password -refreshToken")

    if (!checkIfUserWasCreated) {
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(new ApiResponse(200, checkIfUserWasCreated, "User registeration successful."))
})

const loginUser = asyncHandler(async (req, res) => {
    // get data from user req body
    // validate data- if there is a empty field sent
    // authenticate and check for errors
    // check if user exists
    // check if password is correct
    // if right credentials, give refresh token and access token in cookie
    // send cookie
    // save refresh token in database 
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required.")
    }
    // if (!(username || email)) {
    //     throw new ApiError(400, "Username or Email is required.")
    // }

    // check if user exists with username or email

    const userExists = await User.findOne({ $or: [{ username }, { email }] })

    if (!userExists) {
        throw new ApiError(404, "User not found. Please register.")
    }

    // check for password correctness

    const isPasswordValid = await userExists.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password")
    }

    // if password is correct, generate access token and refresh token

    // console.log('userExists:', userExists)
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(userExists._id)

    const loggeInUser = await User.findById(userExists._id).select("-password -refreshToken")

    const options = {
        httpOnly: true, secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggeInUser, accessToken, refreshToken
                }, "User logged in seccessfully.")
        )
})

const logoutUser = async (req, res) => {
    // clear refresh token and access token
    // clear all cookies 


    // clears refresh token
    const userId = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
    )

    // clearing cookie
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {},
                "User logged out seccessfully.")
        )
}

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request.")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid request token.")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token expired or used..")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed."))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    if (!(newPassword === confirmPassword)) {
        throw new ApiError(400, "Passwords don't match.")
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid or wrong password..")
    }

    user.password = newPassword

    const updatedUser = await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(
            new ApiResponse(200, updatedUser, "Password changed successfully..")
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {

    const currentUser = await req.user
    return res
        .status(200).json(new ApiResponse(200, currentUser, "Current user fetched."))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required..")
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id, {
        $set: {
            fullName: fullName, email: email
        }
    }, { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Account details updated successfully..")
        )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading..")
    }

    const updatedAvatarUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:
            {
                avatar: avatar.url
            }
        }, { new: true }).select("-password")
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedAvatarUser, "Avatar updated successfully..")
        )
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing.")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading..")
    }

    const updatedCoverImageUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:
            {
                coverImage: coverImage.url
            }
        }, { new: true }).select("-password")
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedCoverImageUser, "cover Image updated successfully..")
        )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing.")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                ChannelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                subscribersCount: 1,
                ChannelsSubscribedToCount: 1,
            }
        }
    ])

    console.log('channel:', channel)

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist.")

    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully.")
        )
})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getJokes
}


