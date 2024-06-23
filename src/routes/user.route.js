import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateCoverImage, updateUserAvatar } from "../controllers/user.controller.js";
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

router.post("/get-user",verifyJWT,getCurrentUser);

router.post("/update-avatar",upload.single("avatar"),verifyJWT,updateUserAvatar);

router.route("/update-cover-image",upload.single("coverImage"),verifyJWT,updateCoverImage);

export default router;