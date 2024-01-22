import dotenv from 'dotenv'
dotenv.config({ path: "./.env" })
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")

        if (!user) {
            // NEXT_VIDEO : discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }

        // if we have user for sure then

        req.user = user

        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})
