import express from "express";
import * as controllers from "../controllers/blogFeedback.controller";
// import type { Request, Response,NextFunction } from "express";
// import { isUserAuthenticated } from "../middlewares/auth.middleware";
//const upload=require('../controllers/blog.controller')
const router = express.Router();

//create blog by user id
router.post("/likeBlog",controllers.likeBlog);//---------------------------executed
router.post("/dislikeBlog",controllers.disLikeBlog); //--------------------executed
router.post("/commentOnBlog",controllers.commentOnBlog);//-------
router.delete("/deleteComment/:feedbackId",controllers.deleteComment);// for users only
router.get("/readFeedbackByBlogId/:blogId",controllers.readFeedbackByBlogId);
router.post("/saveBlog",controllers.saveBlog);
router.post("/report",controllers.reportBlog);
// For User Profile
router.get("/save",controllers.getSavedBlogsByUserId);
router.get("/report",controllers.getReportedBlogsByUserId);
router.get("/like",controllers.getLikedBlogsByUserId);
router.get("/dislike",controllers.getDislikedBlogsByUserId);
router.get("/comment",controllers.getCommentedBlogsByUserId);
export default router;
