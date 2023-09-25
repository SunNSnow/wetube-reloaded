import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumbnail: "thumbnail.jpg",
};

const downloadFile = (fileURL, fileName) => {
  const a = document.createElement("a");
  a.href = fileURL;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = new FFmpeg();

  ffmpeg.on("log", ({ message }) => console.log(message));

  const toBlobURL = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobURL = URL.createObjectURL(blob);
    return blobURL;
  };
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`),
  });

  await ffmpeg.writeFile(files.input, await fetchFile(videoFile));

  await ffmpeg.exec(["-i", files.input, "-r", "60", files.output]);
  await ffmpeg.exec([
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumbnail,
  ]);

  const mp4File = await ffmpeg.readFile(files.output);
  const thumbFile = await ffmpeg.readFile(files.thumbnail);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4URL = URL.createObjectURL(mp4Blob);
  const thumbURL = URL.createObjectURL(thumbBlob);

  downloadFile(mp4URL, "MyRecording.mp4");
  downloadFile(thumbURL, "MyThumbnail.jpg");

  for (let file in files) {
    await ffmpeg.deleteFile(files[file]);
    console.log(files[file]);
  }

  URL.revokeObjectURL(mp4URL);
  URL.revokeObjectURL(thumbURL);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record";
  actionBtn.addEventListener("click", handleRecord);
};

const handleRecord = () => {
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleRecord);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionBtn.disabled = false;
    actionBtn.innerText = "Download";
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(recorder.stop(), 5000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 960,
      height: 540,
    },
  });
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener("click", handleRecord);
