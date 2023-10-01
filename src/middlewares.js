import multer from "multer";

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

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.floor(Math.random() * 1e9);
    const extension = "." + file.mimetype.slice("video/".length);
    cb(null, uniqueName + extension);
  },
});

export const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000,
  },
});
