import mongoose from "mongoose";

const categorySchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
        max:32,
        lowercase:true
    }
});

const Category=mongoose.model("Category",categorySchema);
export default Category;