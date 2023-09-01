import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouters";
import videoRouter from "./routers/videoRouters";
import userRouter from "./routers/userRouters";

const app = express();

const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", `${process.cwd()}/src/views`);
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/", globalRouter);

export default app;
