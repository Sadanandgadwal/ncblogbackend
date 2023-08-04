//import { error } from "console";
import Category from "../models/category.model";
import resposnes from "../utils/responses";
import Blog from "../models/blog.model";
import { Request,Response  } from "express";
import responses from "../utils/responses";

export const list=async(req:Request,res:Response)=>{
    try{
        let category=await Category.find();
        if(!category){
            return resposnes.notFoundResponse(res);
        }
        else
          res.json({ data: category });
    }catch(error)
    {
        console.log(error);
        return resposnes.serverErrorResponse(res);
    }
};
export const create =async (req:Request,res:Response)=>{
    try{
    let is_category = await Category.findOne({name: req.body.name});
    if (is_category) {
      return resposnes.badRequestResponse(res, { err: "Category Already Exist" });
    }
        let add_cateogry=await Category.create(req.body);
         res.send(add_cateogry);
    }
    catch (error) {
      return  resposnes.serverErrorResponse(res);
    }
};
export const remove = async (req: Request, res: Response) => {
    try {
      let delete_category = await Category.findByIdAndDelete(req.params.id);
      if (!delete_category) {
        return resposnes.badRequestResponse(
          res,
          {},
          "Error while deleting Category.."
        ); 
      }
      return resposnes.successResponse(res, delete_category, "deleted succesfully.");
    } catch (error) {
      return  resposnes.serverErrorResponse(res);
    }
  };
  export const update = async (req: Request, res: Response) => {
    try {
      console.log(req.params.id);
      let category_id = await Category.findById(req.params.id);
      console.log(category_id);
      if (!category_id) {
        return resposnes.unauthorizedResponse(res, "Such category not available");
      }
      try {
        await Category.findByIdAndUpdate(category_id, {
            name:req.body.name
            });
        }
        catch (err) {
            console.log(err)
        }
    }
    catch (error) {
        return  resposnes.serverErrorResponse(res);
    }
}
export const getBlogsByCategoryName = async (req:Request,res:Response) => {
  const { categoryName } = req.params;
  try {
    // Find the category by name
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return responses.notFoundResponse(res, "Category Not Found");
    }
    // Find blogs based on the category's ID
    const blogs = await Blog.find({ categories: category._id });
    return responses.successResponse(res, blogs,'successfully get');
  } catch (error) {
    return responses.serverErrorResponse(res);
  }
};
export const blogCategorySummary = async (req:Request, res:Response) => {
  try {
    // Fetch all categories
    const categories = await Category.find();
    console.log('-------',categories);
    // Create an empty array for the category summaries
    const categorySummaries = [];
    // Iterate through each category
    for (const category of categories) {
      // Count the number of blogs belonging to the current category
      const blogCount = await Blog.countDocuments({ categories: category._id });
      // Create a category summary object with the category name and blog count
      const categorySummary = {
        categoryName: category.name,
        blogCount: blogCount,
      };
      // Add the category summary to the array
      categorySummaries.push(categorySummary);

    }
    return responses.successResponse(res,'status get successfull');
    res.status(200).json({ categorySummaries });
  } catch (error) {
   return responses.serverErrorResponse(res);
  }
};
