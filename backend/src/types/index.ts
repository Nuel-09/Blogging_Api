import { ObjectId } from "mongodb";

// User
export interface IUser {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  first_name: string;
  last_name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Blog/Article
export interface IBlog {
  _id?: ObjectId;
  title: string;
  description: string;
  body: string;
  author: ObjectId;
  state: "draft" | "published";
  read_count: number;
  reading_time: number;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response Types
// export interface   IUserResponse extends Omit<IUser, 'password'> {
//   _id: string;
// }

// export interface ITaskResponse extends ITodo {
//   _id: string;
//   userId: string;
// }
