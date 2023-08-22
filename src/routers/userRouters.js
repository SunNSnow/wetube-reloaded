import express from "express";
import { edit, remove, see, logout } from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/:id", see);
userRouter.get("/:id/edit", edit);
userRouter.get("/:id/remove", remove);

export default userRouter;
