import { Request, Response } from "express";
import responses from "../utils/responses";
import User  from '../models/user.model'; // Replace with the actual path to the UserRole model
import Role from '../models/role.model'; // Replace with the actual path to the Role model
import UserRole from '../models/role_user.model'; // Replace with the actual path to the User model

// import cloudinary from 'cloudinary';
import multer from 'multer';
import * as dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';
import Blog from '../models/blog.model';
import resposnes from "../utils/responses";
// Configure cloudinary
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'ProfileUploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  },
});

// Create multer upload instance
const ProfileUploads = multer({ storage: storage });

async function uploadFile(filePath:string) {
  try {
    const result = await cloudinary.uploader.upload(filePath, { tags: 'sample_upload' });
    console.log('Upload Successful:');
    console.log(result);
    return result.secure_url;
  } catch (error) {
    console.error('Upload Error:');
    console.error(error);
    throw error;
  }
}

export const update = async (req:Request, res:Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return responses.unauthorizedResponse(res, null, 'Invalid user');
    }

    const { name, mobile, gender, web_link } = req.body;

    // Update user fields
    user.name = name;
      user.mobile = mobile;
      user.gender=gender,
      user.web_link=web_link
    // user.email = email;

    // Handle image upload
    if (req.file) {
      const fileToUpload = req.file.path;
      const fileAddress = await uploadFile(fileToUpload);
      user.profilePic = fileAddress;
    }

    // Save the updated user
    const updatedUser = await user.save();
    return responses.successResponse(res, updatedUser);
  } catch (error) {
    console.log(error);
    return (error);
    return responses.serverErrorResponse(res);
  }
};
export const updateMiddleware = [ProfileUploads.single('file')];


export const get = async (req: Request, res: Response) => {
  try {
    if (!req.params.id)
      return responses.badRequestResponse(res, { error: "User ID required" });
    let user = await User.findById(req.params.id);
    if (!user) return responses.notFoundResponse(res, "User Not Found..");
    let user_role = await UserRole.find({ user_id: req.params.id }).populate(
      "role_id"
    );
    let response = { user, user_role };
    return responses.successResponse(res, response, "User Found..");
  } catch (error) {
    console.log(error);
    return responses.serverErrorResponse(res);
  }
};
export const getAllUsersWithRoles = async (req: Request, res: Response) => {
  console.log("userDetails:----------");
  try {
    // Find all users from the User model
    const users = await User.find({});
    const response:any = []; 
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }

    const userDetailsWithRoles = [];

    // Loop through all users and find their associated roles
    for (const user of users) {
      const userRole: any = await UserRole.findOne({ user_id: user._id });

      let roleName = 'No Role';
      let rolePriority = '';

      if (userRole) {
        const role: any = await Role.findById(userRole.role_id);
        if (role) {
          roleName = role.name;
          rolePriority = role.priority;
        }
      }

      // Create an object with user details and role info
      const userDetails = {
        _id: user._id,
        name: user.name,
        password: user.password,
        mobile: user.mobile,
        email: user.email,
        date: user.date,
        status: user.status,
        profilePic: user.profilePic,
        web_link: user.web_link,
        gender: user.gender,
        roleName: roleName,
        rolePriority: rolePriority,
      };

      response.push(userDetails);
    }
    return responses.successResponse(res, response, "User Found..");
    
  } catch (error) {
    return resposnes.serverErrorResponse(res);
    
  }
};










export const changeStatus= async (req:Request,res:Response)=>{
try{  
  const user_id=req.body;
  const filter={_id:req.body.user_id};
  if(user_id.status==="blocked")
    {
    const update={status:"unblocked"};
    const userUnblocked=await User.findOneAndUpdate(filter,update);
    return responses.successResponse(res, userUnblocked);
    }
  else
    {
      const update={status:"blocked"};
      const userBlocked=await User.findOneAndUpdate(filter,update);
      console.log('-----------',userBlocked);
      return responses.successResponse(res,userBlocked);
    }
  }
  catch(error)
  {
    console.log(error);
     return responses.serverErrorResponse(res);
  }
}
export const blockedUserList = async (req: Request, res: Response) => {
 // console.log("________________________");
  try {
    const blockedUsers = await User.aggregate([
      { $match: { status: "blocked" } },
    ]);

    if (blockedUsers.length === 0) {
      return responses.successResponse(res, 'No one is a blocked user');
    } else {
      return responses.successResponse(res, blockedUsers);
    }
  } catch (error) {
    console.log(error);
    return responses.serverErrorResponse(res);
  }
};
//to delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return responses.unauthorizedResponse(res, null, 'Invalid user');
    }

    // Check if any blogs exist for the user
    const blogs = await Blog.find({ userId }); // Assuming the user ID field in the Blog model is named 'userId'

    if (blogs.length > 0) {
      return responses.unauthorizedResponse(res, null, 'Cannot delete user. Blogs exist.');
    }

    // Delete the user
    await user.remove();

    return responses.successResponse(res, 'User deleted successfully');
  } catch (error) {
    console.log(error);
    return responses.serverErrorResponse(res);
  }
};











































// Function to get user details along with role name by user_id
// export const getUserDetailsWithRole = async (req: Request, res: Response) => {
//   const userId: string = req.params.user_id; // Assuming the user ID is passed as a route parameter named 'user_id'

//   try {
//     // Find the User document using the user_id
//     const user: any = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     // Find the UserRole document for the specified user_id
//     const userRole: any = await UserRole.findOne({ user_id: userId });

//     if (!userRole) {
//       return res.status(404).json({ error: 'User does not have a role.' });
//     }

//     // Find the Role document using the role_id from the userRole
//     const role: any = await Role.findById(userRole.role_id);

//     if (!role) {
//       return res.status(404).json({ error: 'Role not found.' });
//     }

//     // Return the user details and role name
//     const userDetailsWithRole = {
//       _id: user._id,
//       name: user.name,
//       password: user.password,
//       mobile: user.mobile,
//       email: user.email,
//       date: user.date,
//       status: user.status,
//       profilePic: user.profilePic,
//       web_link: user.web_link,
//       gender: user.gender,
//       roleName: role.name,
//       rolePriority: role.priority,
//     };

//     res.status(200).json(userDetailsWithRole);
//   } catch (error) {
//     res.status(500).json({ error: 'Error while fetching user details with role.' });
//   }
// };






// export const blockedUserList = async (req: Request, res: Response) => {
//   console.log("________________________");
//   try {
//     const blockedUsers = await User.aggregate([
//       { $match: { status: "blocked" } },
//     ]);

//     if (blockedUsers.length === 0) {
//       return responses.successResponse(res, 'No one is a blocked user');
//     } else {
//       return responses.successResponse(res, blockedUsers);
//     }
//   } catch (error) {
//     console.log(error);
//     return responses.serverErrorResponse(res);
//   }
// };
