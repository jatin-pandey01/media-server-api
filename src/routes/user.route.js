import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateCoverImage, updateUserAvatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxCount:1
    },
    {
      name:"coverImage",
      maxCount:1
    }
  ]), 
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.post("/change-password",verifyJWT,changeCurrentPassword);

router.get("/user",verifyJWT,getCurrentUser);

router.patch("/update-avatar",verifyJWT,upload.single("avatar"),updateUserAvatar);

router.patch("/update-cover-image",verifyJWT,upload.single("coverImage"),updateCoverImage);

router.route("/channel/:username").get(verifyJWT,getUserChannelProfile);

router.route("/watch-history").get(verifyJWT,getWatchHistory);

export default router;