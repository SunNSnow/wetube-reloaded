import express from "express";
import {
  startGithubLogIn,
  finishGithubLogIn,
  logout,
  see,
  edit,
  remove,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/github/start", startGithubLogIn);
userRouter.get("/github/finish", finishGithubLogIn);
userRouter.get("/logout", logout);
userRouter.get("/:id", see);
userRouter.get("/:id/edit", edit);
userRouter.get("/:id/remove", remove);

export default userRouter;
