import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import Category from "../models/category.model";
import User from "../models/user.model";
import Blog from "../models/blog.model";
import * as dotenv from "dotenv";
const { v4: uuidv4 } = require('uuid');
// import nodemailer from "nodemailer"; 
import responses from "../utils/responses";
import Axios from "axios";
import { Callback } from "mongoose";
import { any } from "joi";
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder for file uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});
// Create multer upload instance
const upload = multer({ storage: storage });
async function uploadFile(filePath:string) {
  try {
    const result = await cloudinary.uploader.upload(filePath, { tags: 'sample_upload' });
    console.log('Upload Successful:');
    console.log(result);
    return result.secure_url; // Return the secure URL of the uploaded file
  } catch (error) {
    console.error('Upload Error:');
    console.error(error);
    throw error; // Throw the error for the calling function to handle
  }
}

export const create = async (req:Request, res:Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return responses.unauthorizedResponse(res, null, 'Invalid user');
    }
    if (await Blog.findOne({ title: req.body.title })) {
      return responses.allreadyExistResponse(res, 'Blog already exists');
    }
    let isCategory = await Category.findOne({ name: req.body.categories });
    if (!isCategory) {
      return responses.badRequestResponse(res, { error: 'Category does not exist' });
    } else {
      const { title, content } = req.body;
      let fileAddress = '';
      if (req.file) {
        const fileToUpload = req.file.path;
        fileAddress = await uploadFile(fileToUpload);
      }
      const newBlog = new Blog({
        title,
        // content: JSON.parse(content),
        content: content,
        categories: isCategory.id,
        user_id: user,
        images: fileAddress
      });
      const savedBlog = await newBlog.save();
      return responses.successResponse(res, savedBlog);
    }
  } catch (error) {
    console.log(error);
    return (error);
    // return responses.serverErrorResponse(res);
  }
};
export const uploadFileMiddleware = upload.single('file'); // Set up multer middleware for file upload
export const readAllBlogs = async (req:Request, res:Response) => {
  try {
    let author,blogCategory;
    const blogs = await Blog.find().populate({
      path: 'user_id',
      select: 'name profilePic'
    }).populate('categories','name'); // Find all blogs
    // Access the fields of each blog object
    blogs.forEach((blog) => {
      author = blog.user_id;
      // Do something with the fields
      blogCategory=blog.categories
    });
    // const userDetails=
    if (blogs.length === 0) {
      return responses.badRequestResponse(res, {}, 'No blogs exist');
    }
    return responses.successResponse(res, blogs, author);
  } catch (error) {
    return responses.serverErrorResponse(res);
  }
};

// cloudinary.config({ 
//   cloud_name:process.env.CLOUD_NAME, 
//   api_key: process.env.API_KEY, 
//   api_secret: process.env.API_SECRET 
//  });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {

//     cb(null, 'uploads/'); // Specify the destination folder for file uploads
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
//   }
// });

// // Create multer upload instance
// const upload = multer({ storage: storage });

// async function uploadFile(filePath: string): Promise<string> {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, { tags: 'sample_upload' });
//     console.log('Upload Successful:');
//     console.log(result);
//     return result.secure_url; // Return the secure URL of the uploaded file
//   } catch (error) {
//     console.error('Upload Error:');
//     console.error(error);
//     throw error; // Throw the error for the calling function to handle
//   }
// }

// export const create = async (req: Request, res: Response) => {
//   try {
//     const userId = req.params.id;
//     const user = await User.findById(userId);

//     if (!user) {
//       return responses.unauthorizedResponse(res, null, 'Invalid user');
//     }

//     if (await Blog.findOne({ title: req.body.title })) {
//       return responses.allreadyExistResponse(res, 'Blog already exists');
//     }

//     let isCategory = await Category.findOne({ name: req.body.categories });
//     if (!isCategory) {
//       return responses.badRequestResponse(res, { error: 'Category does not exist' });
//     } else {
//       const { title, content } = req.body;

//       let fileAddress = '';
//       if (req.file) {
//         const fileToUpload = req.file.path;
//         fileAddress = await uploadFile(fileToUpload);
//       }

//       const newBlog = new Blog({
//         title,
//         // content: JSON.parse(content),
//         content:content,
//         categories: isCategory.id,
//         user_id: user,
//         images: fileAddress
//       });

//       const savedBlog = await newBlog.save();
//       return responses.successResponse(res, savedBlog);
//     }
//   } catch (error) {
//     console.log(error);
//     return responses.serverErrorResponse(res);
//   }
// };

// export const uploadFileMiddleware = upload.single('file'); // Set up multer middleware for file upload


// export const readAllBlogs = async (req: Request, res: Response) => {
//   try {
//     let author;
//     const blogs = await Blog.find().populate({path: "user_id",
//     select: "name"}); // Find all blogs
//       // Access the fields of each blog object
//     blogs.forEach(blog => {
//       author =  blog.user_id;
//       // Do something with the fields
//       });    
//     // const userDetails=
//     if (blogs.length === 0) {
//       return responses.badRequestResponse(
//         res,
//         {},
//         "No blogs exist"
//       );
//     }
//     return responses.successResponse(res, blogs,author);
//   } catch (error) {
//     return responses.serverErrorResponse(res);
//   }
// };
export const getSingleBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.params.id) {
      return responses.badRequestResponse(res, { error: "Provide Blog ID" });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return responses.notFoundResponse(res, "Blog Not Found");
    }

    const Author = await User.findById(blog.user_id);

    if (!Author) {
      return responses.notFoundResponse(res, "User Not Found");
    }

    const blogWithAuthor = {
      ...blog.toObject(),
      Author: Author.name,
    };

    return responses.successResponse(res, blogWithAuthor, "Blog Found");
  } catch (error) {
    console.log(error);
    return responses.serverErrorResponse(res);
  }
};

export const getBlogsByStatus = async (req:Request, res:Response) => {
  const { status } = req.params;
  //console.log(status,'------------');
  try {
    // Find blogs based on the provided status
    const blogs = await Blog.find({ blog_status: status });
    if (!blogs) {
      return responses.notFoundResponse(res, "no Blog exist along this category");
    }
    //const totalBlogs = blogs.length;
    // res.status(200).json({ blogs, totalBlogs });
    //have to add totalblogs with blogs
    return responses.successResponse(res, blogs, "Blog Found");
  } catch (error) {
    return responses.serverErrorResponse(res);
  }
};
export const blogStatusSummary = async (req:Request, res:Response) => {
  try {
    // Fetch all blog statuses
    const statuses = ['process', 'approved', 'reject'];

    // Create an empty array for the status summaries
    const statusSummaries = [];

    // Iterate through each status
    for (const status of statuses) {
      // Count the number of blogs with the current status
      const blogCount = await Blog.countDocuments({ blog_status: status });

      // Create a status summary object with the status name and blog count
      const statusSummary = {
        statusName: status,
        blogCount: blogCount,
      };
      console.log('----------',statusSummary);

      // Add the status summary to the array
      statusSummaries.push(statusSummary);
    }
    return responses.successResponse(res,statusSummaries,'summary getting sccessfully');
    //res.status(200).json({ statusSummaries });
  } catch (error) {
   return responses.serverErrorResponse(res);
  }
};











// export const delete_blog = async (req: Request, res: Response) => {
//   try {
//     let blog = await Blog.findByIdAndDelete(req.params.id);
//     if (!blog) {
//       return responses.badRequestResponse(
//         res,
//         {},
//         "Error while deleting blog.."
//       );
//     }
//     return responses.successResponse(res, blog, "deleted succesfully.");
//   } catch (error) {
//     return responses.serverErrorResponse(res);
//   }
// };

// export const getBlogStataus = async (req: Request, res: Response) => {
//   try {
//     console.log(req.params.id);
//     let blog_status = await Blog.findOne({ id: req.params.id })
//       .populate("user_id")
//       .populate("categories");
//     console.log(blog_status);
//   } catch (error) {
//     return responses.serverErrorResponse(res);
//   }
// };

// export const update = async (req: Request, res: Response) => {
//   try {
//     const userId = req.params.id;
//     const blogId = req.params.blog_id;
//     const user = await User.findById(userId);
//     if (!user) {
//       return responses.unauthorizedResponse(res, "Invalid user");
//     }

//     // const blogPath = await manageDirectory(req, res);
//     // let blog = await Blog.findByIdAndUpdate(
//     //   blogId,
//     //   {
//     //     title: req.body.title,
//     //     content: JSON.parse(req.body.content),
//     //     images: blogPath,
//     //   },
//     //   { new: true }
//     // );
//     if (!blog) {
//       return responses.notFoundResponse(res, "Blog not found");
//     }

//     return responses.successResponse(res, blog, "updated succesfully.");
//   } catch (error) {
//     return responses.serverErrorResponse(res);
//   }
// };

