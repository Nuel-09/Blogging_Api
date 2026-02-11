import mongoose, { Schema, Document } from "mongoose";

// Define what a Blog document looks like
export interface IBlogDocument extends Document {
  title: string;
  description: string;
  body: string;
  author: mongoose.Types.ObjectId; // Reference to User
  state: "draft" | "published";
  read_count: number;
  reading_time: number; // in minutes
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Create the Schema (blueprint)
const blogSchema = new Schema<IBlogDocument>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    body: {
      type: String,
      required: true,
      minlength: 50,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    state: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },
    read_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    reading_time: {
      type: Number,
      required: true,
      min: 1,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 10,
        message: "Maximum 10 tags allowed",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
blogSchema.index({ author: 1 });
blogSchema.index({ state: 1 });
blogSchema.index({ title: "text", description: "text", tags: "text" });
blogSchema.index({ read_count: -1 });
blogSchema.index({ createdAt: -1 });

// Create and export the model
export const Blog = mongoose.model<IBlogDocument>("Blog", blogSchema);
