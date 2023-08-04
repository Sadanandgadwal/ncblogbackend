import { number } from "joi";
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
    },
    otp: {
      type: String,
      require: true,
    },
    verify:{
      type:Boolean
    }
  },

  { timestamps: true }
);

const otpSchemaModel = mongoose.model("otpModels", otpSchema);
export default otpSchemaModel;
