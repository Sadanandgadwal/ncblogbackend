import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    mobile: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      require: true,
    },
    date: {
      type: Date,
      default: new Date()
    },
    status:{
      type:String,
      default:"unblocked",
      require:true
    },
    profilePic:{
      type:String,
      default:'https://drive.google.com/file/d/1JXkvesO9EgphbvvQv4Qw6wNi_HFEVjJs/view?usp=sharing'
    },
    web_link:{
      type:String,
    },
    gender:{
      type:String,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("Users", UserSchema);
export default User;
