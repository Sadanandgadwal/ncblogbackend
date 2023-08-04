import { MulterError } from "multer";
import { Response } from "express";

export const handleMulterError = (error: MulterError, res: Response) => {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      res.status(400).json({
        message: "File is too large",
      });
      break;
    case "LIMIT_FILE_COUNT":
      res.status(400).json({
        message: "File limit reached",
      });
      break;
    case "LIMIT_UNEXPECTED_FILE":
      res.status(400).json({
        message: "File must be an image",
      });
      break;
    default:
      res.status(400).json({
        message: "Bad request",
      });
  }
};