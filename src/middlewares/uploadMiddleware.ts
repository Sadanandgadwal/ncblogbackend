import { Callback } from "mongoose";
import { v4 as uuid } from "uuid";
import { Request} from "express";
import multer, { MulterError } from "multer";
import { Express } from "express";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});

const fileFilter = (req:Request, file:Express.Multer.File, cb:Callback) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    console.log("File type is not image");
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

export const uploadMiddleware = multer({
  storage,
//   fileFilter,
  limits: { fileSize: 100, files: 2 },
}).array("file");