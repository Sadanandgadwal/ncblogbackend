import express from "express";
import * as controllers from "../controllers/blog.controller1";
import {isBlogAuthenticated} from "../middlewares/blog.middleware";
const router = express.Router();
// router.use(function (req, res, next) {
//   console.log("inside router");
//   isBlogAuthenticated(req, res, next);
//   next();
// });
router.get("/unique/:id", controllers.getSingleBlog);//---------------------- integrated
router.post('/:id/create',controllers.uploadFileMiddleware, controllers.create);
// router.get('/:status',controllers.getBlogsByStatus);
router.post('/summaryByStatus',controllers.blogStatusSummary);
router.get("/readAllBlogs", controllers.readAllBlogs);//-----------------integrated

export default router;


















































//For multiple image store

// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({ 
//   cloud_name: 'dlhb7c0gg', 
//   api_key: '477985445521753', 
//   api_secret: 'nNWKze5-0r2Cb3uXc7TU0gFprRs' 
// });

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

// async function uploadFiles(filePaths: string[]): Promise<string[]> {
//   try {
//     const uploadPromises = filePaths.map((filePath) =>
//       cloudinary.uploader.upload(filePath, { tags: 'sample_upload' })
//     );
//     const results = await Promise.all(uploadPromises);
//     console.log('Upload Successful:');
//     console.log(results);
//     return results.map((result) => result.secure_url); // Return the secure URLs of the uploaded files
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

//       let fileAddresses: string[] = [];
//       if (req.files && Array.isArray(req.files)) {
//         const filesToUpload = req.files.map((file: Express.Multer.File) => file.path);
//         fileAddresses = await uploadFiles(filesToUpload);
//       }

//       const newBlog = new Blog({
//         title,
//         content,
//         categories: isCategory.id,
//         user_id: user,
//         images: fileAddresses
//       });

//       const savedBlog = await newBlog.save();
//       return responses.successResponse(res, savedBlog);
//     }
//   } catch (error) {
//     console.log(error);
//     // return responses.serverErrorResponse(res);
//     return (error);
//   }
// };

// export const uploadFileMiddleware = upload.array('files'); // Use the appropriate field name used in the client's form data
















