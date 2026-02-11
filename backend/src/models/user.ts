import mongoose, { Schema, Document } from "mongoose";

// Define what a User document looks like
export interface IUserDocument extends Document {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Schema (blueprint)
const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true, // No duplicate emails!
      lowercase: true, // Store as lowercase
      trim: true, // Remove whitespace
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum 6 characters
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt
  },
);
// create and export the model/collection
export const User = mongoose.model<IUserDocument>("User", userSchema);
