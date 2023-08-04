import mongoose from "mongoose";

const blogFeedbackSchema = new mongoose.Schema(
  {
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    like: {
      type: Boolean,
      default: false,
    },
    saveBlog: {
      type: Boolean,
      default: false,
    },
    dislike: {
      type: Boolean,
      default: false,
    },
    comment: {
      type: String,
      default: "",
    },
    share: {
      type: Boolean,
      default: false,
    },
    report: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const BlogFeedback = mongoose.model("BlogFeedback", blogFeedbackSchema);
export default BlogFeedback;
