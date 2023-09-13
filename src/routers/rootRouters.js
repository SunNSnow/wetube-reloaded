import express from "express";
import {
  getJoin,
  postJoin,
  getLogIn,
  postLogIn,
} from "../controllers/userController";
import { home, search } from "../controllers/videoController";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.route("/login").get(getLogIn).post(postLogIn);
rootRouter.get("/search", search);

export default rootRouter;
