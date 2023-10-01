import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not Authorized.");
    return res.redirect("/login");
  }
};

export const publicInlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not Authorized.");
    return res.redirect("/");
  }
};

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "wetube-sunnsnow/images",
  key: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.floor(Math.random() * 1e9);
    const extension = "." + file.mimetype.slice(file.mimetype.indexOf("/") + 1);
    cb(null, uniqueName + extension);
  },
  acl: "public-read",
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "wetube-sunnsnow/videos",
  key: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.floor(Math.random() * 1e9);
    const extension = "." + file.mimetype.slice(file.mimetype.indexOf("/") + 1);
    cb(null, uniqueName + extension);
  },
  acl: "public-read",
});

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
  storage: process.env.NODE_ENV ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 10000000,
  },
  storage: process.env.NODE_ENV ? s3VideoUploader : undefined,
});
