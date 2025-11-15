import multer from "multer";
import path from "path";
import { ErrorClass } from "../utils/errorClass.util.js";

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp.extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.authUser._id}-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new ErrorClass(
        "Only image files are allowed (jpeg, jpg, png, gif, webp)",
        400,
        "Invalid file type"
      )
    );
  }
};

// Multer upload configuration
export const uploadProfilePhoto = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
}).single("photo"); // 'photo' is the field name in form-data

// Middleware to handle multer errors
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ErrorClass(
          "File size too large. Maximum size is 5MB",
          400,
          "File size error"
        )
      );
    }
    return next(new ErrorClass(err.message, 400, "Upload error"));
  }
  next(err);
};
