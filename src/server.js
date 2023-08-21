import express from "express";
import morgan from "morgan";

const PORT = 4000;

const app = express();

const logger = morgan("dev");

const handleHome = (req, res) => {
  return res.send("I love middlewares!");
};

const handleProtected = (req, res) => {
  return res.send("Welcome to the private lounge");
};

app.use(logger);
app.get("/", handleHome);
app.get("/protected", handleProtected);

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} ✅`);

app.listen(PORT, handleListening);
