import express from "express";
import {
  getJoin,
  postJoin,
  getLogIn,
  postLogIn,
} from "../controllers/userController";
import { home, search } from "../controllers/videoController";
import { publicInlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicInlyMiddleware).get(getJoin).post(postJoin);
rootRouter
  .route("/login")
  .all(publicInlyMiddleware)
  .get(getLogIn)
  .post(postLogIn);
rootRouter.get("/search", search);

export default rootRouter;
