import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    priority: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("Roles", RoleSchema);
export default Role;
