import nodemailer from 'nodemailer';
import Blog from "../models/blog.model";
import user from "../models/user.model";
import {Request, Response} from "express";
import BlogFeedback from "../models/blogFeedback.model";
import User from '../models/user.model';
import * as dotenv from "dotenv";
dotenv.config();
export const likeBlog = async (req: Request, res: Response) => {
  try {
    const { blogId, userId } = req.body;
    let count;
    let blogFeeds = await BlogFeedback.findOne({ blog_id: blogId, user_id: userId });
    if (blogFeeds) {
      if (blogFeeds.like)
        blogFeeds.like = false;
      else
        blogFeeds.like = true;
    } else {
      blogFeeds = new BlogFeedback({
        blog_id: blogId,
        user_id: userId,
        like: true,
      });
    }
    // Save the updated or new blog feedback entry
    await blogFeeds.save();
    count = await BlogFeedback.countDocuments({ blog_id: blogId, like: true }); //---------no of Likes
    if(blogFeeds.like==true){
    const ReaderDetails = await user.findById(userId); //--------------------------------------ReaderDetails
    // Fetch the blog details
    const blogDetails = await Blog.findById(blogId); //--------------------------------------BlogAll Details
    console.log('Blog details', blogDetails?.user_id);

    // Fetch the author details
    const authorDetails = await User.findById(blogDetails?.user_id); //-----------------------Author Of Blog
    if (authorDetails)
      console.log(authorDetails);

    // Send mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: authorDetails?.email,
      subject: `Congratulation ${authorDetails?.name}! ${ReaderDetails?.name} React on your posted Blog`,
      text: `You got a like on this post`,
      html: `<div class="animated-div bg-gray-100 border border-gray-300 shadow-md p-4 mx-auto max-w-sm">
      <img src="${blogDetails?.images}" alt="Image" class="w-full" />
      <h2 class="text-lg font-bold mb-4">${blogDetails?.title}</h2>
      <p class="text-gray-600 mb-4">${blogDetails?.content}</p>
    </div>
    `
    };
    await transporter.sendMail(mailOptions);
    }
    return res.status(200).json({ success: true, message: 'Reacted successfully for Like', count });
  } 
  catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

export const disLikeBlog = async (req:Request, res:Response) => {
  try {
    const { blogId, userId } = req.body;

    // Check if the blog feedback already exists
    let blogFeedback = await BlogFeedback.findOne({ blog_id: blogId, user_id: userId });

    if (blogFeedback) {
      // Update the existing blog feedback with the new like value
      if(blogFeedback.dislike)
        blogFeedback.dislike = false;  
      else
        blogFeedback.dislike = true;
    } else {
      // Create a new blog feedback entry with the like value
      blogFeedback = new BlogFeedback({
        blog_id: blogId,
        user_id: userId,
        dislike: true,
      });
    }
    // Save the updated or new blog feedback entry
    await blogFeedback.save();
    const count = await BlogFeedback.countDocuments({ blog_id: blogId, dislike: true });
    if(blogFeedback.dislike==true)
    {
      
    const ReaderDetails = await user.findById(userId); //--------------------------------------ReaderDetails
    console.log('-----------',ReaderDetails);
    // Fetch the blog details
    const blogDetails = await Blog.findById(blogId); //--------------------------------------BlogAll Details
    console.log('Blog details', blogDetails?.user_id);

    // Fetch the author details
    const authorDetails = await User.findById(blogDetails?.user_id); //-----------------------Author Of Blog
    if (authorDetails)
      console.log(authorDetails);

    // Send mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: authorDetails?.email,
      subject: `OOps ${authorDetails?.name}! ${ReaderDetails?.name} Dislike on your posted Blog`,
      text: `You got a  dislike on this post`,
      html: `<div class="animated-div bg-gray-100 border border-gray-300 shadow-md p-4 mx-auto max-w-sm">
      <img src="${blogDetails?.images}" alt="Image" class="w-full" />
      <h2 class="text-lg font-bold mb-4">${blogDetails?.title}</h2>
      <p class="text-gray-600 mb-4">${blogDetails?.content}</p>
    </div>
    `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    }
    res.status(200).json({ success: true, message: "Reacted successfully for disLike" ,count});
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
//save Blog
export const saveBlog = async (req:Request, res:Response) => {
  // let isAction:boolean =false;
  try {
    const { blogId, userId } = req.body;
    // Check if the blog feedback already exists
    let blogFeedback = await BlogFeedback.findOne({ blog_id: blogId, user_id: userId });
    if (blogFeedback) {
      if(blogFeedback.saveBlog)
        blogFeedback.saveBlog = false;  
      else
        blogFeedback.saveBlog = true;
    } else {
      blogFeedback = new BlogFeedback({
        blog_id: blogId,
        user_id: userId,
        saveBlog: true,
      });
    }
    await blogFeedback.save();
    res.status(200).json({ success: true, message: "done successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};


// Controller function to handle the comment operation
export const commentOnBlog = async (req: Request, res: Response) => {
  try {
    const { blogId, userId, comment } = req.body;

    // Check if the blog feedback already exists
    let blogFeedback = await BlogFeedback.findOne({ blog_id: blogId, user_id: userId });

    if (blogFeedback) {
      if (blogFeedback.comment === comment) {
        // Comment already exists, no need to update or send email
        return res.status(200).json({ success: true, message: "Comment already exists" });
      }

      // Update the existing blog feedback with the new comment
      blogFeedback.comment = comment;
    } else {
      // Create a new blog feedback entry with the comment
      blogFeedback = new BlogFeedback({
        blog_id: blogId,
        user_id: userId,
        comment,
      });
    }

    // Save the updated or new blog feedback entry
    await blogFeedback.save();

    if (blogFeedback.comment) {
      const ReaderDetails = await user.findById(userId);
      console.log('-----------', ReaderDetails);

      // Fetch the blog details
      const blogDetails = await Blog.findById(blogId);
      console.log('Blog details', blogDetails?.user_id);

      // Fetch the author details
      const authorDetails = await User.findById(blogDetails?.user_id);
      if (authorDetails)
        console.log(authorDetails);

      // Send mail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SENDER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: authorDetails?.email,
        subject: `Listen ${authorDetails?.name}! ${ReaderDetails?.name} commented on your posted Blog`,
        text: `You got a comment on this post`,
        html: `<div class="animated-div bg-gray-100 border border-gray-300 shadow-md p-4 mx-auto max-w-sm">
        <img src="${blogDetails?.images}" alt="Image" class="w-full" />
        <h2 class="text-lg font-bold mb-4">${blogDetails?.title}</h2>
        <p class="text-gray-600 mb-4">${blogDetails?.content}</p>
        <h3 class="text-lg font-bold mb-4">${blogFeedback?.comment}</h3>
        </div>
        `,
      };
      // Send the email
      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ success: true, message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
// Controller function to handle deleting a comment
export const deleteComment = async (req:Request, res:Response) => {
  try {
    const { feedbackId } = req.params;
    // Find the blog feedback entry by its ID
    const blogFeedback = await BlogFeedback.findById(feedbackId);

    if (!blogFeedback) {
      return res.status(404).json({ success: false, message: "Blog feedback not found" });
    }
    // Delete the comment from the blog feedback entry
    blogFeedback.comment = "";
    // Save the updated blog feedback entry 
    await blogFeedback.save();
    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error});
  }
};
// Controller function to read all comments for a blog
export const readFeedbackByBlogId = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    // Find all blog feedback entries with the given blog ID
    const blogFeedbacks = await BlogFeedback.find({ blog_id: blogId });
    let totalLikes = 0;
    let totalDislikes = 0;
    let totalReports = 0;

    // Count the total likes, dislikes, and reports
    blogFeedbacks.forEach((feedback) => {
      if (feedback.like) {
        totalLikes++;
      }
      if (feedback.dislike) {
        totalDislikes++;
      }
      if (feedback.report) {
        totalReports++;
      }
    });

    // Prepare the response object with the added fields
    const responseObj = {
      success: true,
      data: blogFeedbacks,
      totalLikes,
      totalDislikes,
      totalReports,
    };

    res.status(200).json(responseObj);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
//Controller to report blog
export const reportBlog = async (req:Request,res:Response) => {
  try {
    const { blogId, userId } = req.body;

    // Check if the blog feedback already exists
    let blogFeedback = await BlogFeedback.findOne({ blog_id: blogId, user_id: userId });

    if (blogFeedback) {
      // Update the existing blog feedback with the new like value
      if(blogFeedback.report)
        {
          blogFeedback.report = true;  
        }
      else
      {
        blogFeedback.report = true;
      }
      } 
      else {
      // Create a new blog feedback entry with the like value
        blogFeedback = new BlogFeedback({
        blog_id: blogId,
        user_id: userId,
        report: true,
      });
    }
    // Save the updated or new blog feedback entry
    await blogFeedback.save();
    if(blogFeedback.report)
    {
      
    const ReaderDetails = await user.findById(userId); //--------------------------------------ReaderDetails
    console.log('-----------',ReaderDetails);
    // Fetch the blog details
    const blogDetails = await Blog.findById(blogId); //--------------------------------------BlogAll Details
    console.log('Blog details', blogDetails?.user_id);

    // Fetch the author details
    const authorDetails = await User.findById(blogDetails?.user_id); //-----------------------Author Of Blog
    if (authorDetails)
      console.log(authorDetails);

    // Send mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: authorDetails?.email,
      subject: `Listen ${authorDetails?.name}! ${ReaderDetails?.name} comment on your posted Blog`,
      text: `You got a  comment on this post`,
      html: `<div class="animated-div bg-gray-100 border border-gray-300 shadow-md p-4 mx-auto max-w-sm">
      <img src="${blogDetails?.images}" alt="Image" class="w-full" />
      <h2 class="text-lg font-bold mb-4">${blogDetails?.title}</h2>
      <p class="text-gray-600 mb-4">${blogDetails?.content}</p>
      <h3 class="text-lg font-bold mb-4">Check Your blog once</h3>
    </div>
    `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    }
    res.status(200).json({ success: true, message: "Blog reports successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
export const getSavedBlogsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    // Find all blog feedback entries with the saveBlog field set to true and matching user_id
    const savedBlogFeedbacks = await BlogFeedback.find({ saveBlog: true, user_id: userId });
    res.status(200).json({ success: true, data: savedBlogFeedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
export const getReportedBlogsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Find all blog feedback entries with the report field set to true and matching user_id
    const reportedBlogFeedbacks = await BlogFeedback.find({ report: true, user_id: userId });

    res.status(200).json({ success: true, data: reportedBlogFeedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
export const getLikedBlogsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    // Find all blog feedback entries with the like field set to true and matching user_id
    const likedBlogFeedbacks = await BlogFeedback.find({ like: true, user_id: userId });
    res.status(200).json({ success: true, data: likedBlogFeedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
export const getDislikedBlogsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    // Find all blog feedback entries with the dislike field set to true and matching user_id
    const dislikedBlogFeedbacks = await BlogFeedback.find({ dislike: true, user_id: userId });

    res.status(200).json({ success: true, data: dislikedBlogFeedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
export const getCommentedBlogsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Find all blog feedback entries with a non-empty comment and matching user_id
    const commentedBlogFeedbacks = await BlogFeedback.find({ comment: { $ne: "" }, user_id: userId });

    res.status(200).json({ success: true, data: commentedBlogFeedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

