import multer from "multer";
import fs from "fs";
import path from "path";
import { ErrorClass } from "../utils/errorClass.util.js";

export const multerMiddleware = (filePath = "general", allowExtensions) => {
  // Configure storage
  const destinationPath = path.resolve(`src/uploads/${filePath}`);
  console.log(destinationPath);
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destinationPath); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
      // Generate unique filename: userId-timestamp.extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `profile-${req.authUser._id}-${uniqueSuffix}${ext}`);
    },
  });
  const fileFilter = (req, file, cb) => {
    // Accept images only
    if (allowExtensions?.includes(file.mimetype.split("/")[1])) {
      return cb(null, true);
    }
    return cb(new ErrorClass("Invalid file type", 400), false);
  };

  return multer({ fileFilter, storage });
};

// multer for host

export const multerHostMiddleware = (filePath = "general", allowExtensions) => {
  const storage = multer.diskStorage({});
  const fileFilter = (req, file, cb) => {
    // Accept images only
    if (allowExtensions?.includes(file.mimetype.split("/")[1])) {
      return cb(null, true);
    }
    return cb(new ErrorClass("Invalid file type", 400), false);
  };
  return multer({ fileFilter, storage });
};
