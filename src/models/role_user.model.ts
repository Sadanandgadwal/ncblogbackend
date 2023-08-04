import mongoose from "mongoose";

const UserRoleSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roles",
    },
  },
  { timestamps: true }
);

const UserRole = mongoose.model("UsersRoles", UserRoleSchema);
export default UserRole;
