import express from "express";
import {
  startGithubLogIn,
  finishGithubLogIn,
  logout,
  see,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
  remove,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicInlyMiddleware,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/github/start", publicInlyMiddleware, startGithubLogIn);
userRouter.get("/github/finish", publicInlyMiddleware, finishGithubLogIn);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.get("/:id([0-9a-f]{24})", see);
userRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/:id([0-9a-f]{24})/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/:id([0-9a-f]{24})/remove", remove);

export default userRouter;
