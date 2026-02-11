import { FastifyRequest, FastifyReply } from "fastify";
import mongoose from "mongoose";
import { Blog } from "../models/Blog";
import { User } from "../models/user";
import { handleSuccess, handleError } from "./baseController";
import { calculateReadingTime } from "../utils/readingTime";

// Helper: Check if user is blog owner
const isOwner = (
  authorId: mongoose.Types.ObjectId | string,
  userId?: string | mongoose.Types.ObjectId,
) => {
  if (!userId) return false;
  return authorId.toString() === userId.toString();
};

// CREATE BLOG - Create new blog in draft state
export const createBlog = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = (request.user as any)?.userId;
    if (!userId) {
      return handleError(reply, { message: "Unauthorized" }, 401);
    }

    const { title, description, body, tags } = request.body as {
      title: string;
      description: string;
      body: string;
      tags?: string[];
    };

    // Validate required fields
    if (!title || !description || !body) {
      return handleError(
        reply,
        { message: "Title, description, and body are required" },
        400,
      );
    }

    // Validate field lengths
    if (title.trim().length < 5 || title.trim().length > 200) {
      return handleError(
        reply,
        { message: "Title must be between 5 and 200 characters" },
        400,
      );
    }

    if (description.trim().length < 10 || description.trim().length > 500) {
      return handleError(
        reply,
        { message: "Description must be between 10 and 500 characters" },
        400,
      );
    }

    if (body.trim().length < 50) {
      return handleError(
        reply,
        { message: "Body must be at least 50 characters" },
        400,
      );
    }

    // Check if title is unique
    const existingBlog = await Blog.findOne({ title: title.trim() });
    if (existingBlog) {
      return handleError(
        reply,
        { message: "Blog with this title already exists" },
        400,
      );
    }

    // Calculate reading time
    const reading_time = calculateReadingTime(body);

    // Create new blog (draft by default)
    const newBlog = await Blog.create({
      title: title.trim(),
      description: description.trim(),
      body: body.trim(),
      author: userId,
      state: "draft",
      reading_time,
      tags: tags ? tags.filter((tag) => tag.trim()).slice(0, 10) : [],
    }).then((blog) => blog.populate("author", "-password"));

    return handleSuccess(
      reply,
      {
        _id: newBlog._id,
        title: newBlog.title,
        description: newBlog.description,
        body: newBlog.body,
        author: newBlog.author,
        state: newBlog.state,
        read_count: newBlog.read_count,
        reading_time: newBlog.reading_time,
        tags: newBlog.tags,
        createdAt: newBlog.createdAt,
        updatedAt: newBlog.updatedAt,
      },
      201,
    );
  } catch (error) {
    return handleError(reply, error);
  }
};

// GET BLOG BY ID - Get single published blog (increments read_count)
export const getBlogById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleError(reply, { message: "Invalid blog ID" }, 400);
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { read_count: 1 } },
      { new: true },
    ).populate("author", "-password");

    if (!blog) {
      return handleError(reply, { message: "Blog not found" }, 404);
    }

    // Only allow viewing published blogs unless user is owner
    const userId = (request.user as any)?.userId;
    if (blog.state === "draft" && !isOwner(blog.author._id, userId)) {
      return handleError(reply, { message: "Blog not found" }, 404);
    }

    return handleSuccess(reply, blog);
  } catch (error) {
    return handleError(reply, error);
  }
};

// UPDATE BLOG - Edit blog (owner only)
export const updateBlog = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = (request.user as any)?.userId;
    if (!userId) {
      return handleError(reply, { message: "Unauthorized" }, 401);
    }

    const { id } = request.params as { id: string };
    const { title, description, body, tags } = request.body as {
      title?: string;
      description?: string;
      body?: string;
      tags?: string[];
    };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleError(reply, { message: "Invalid blog ID" }, 400);
    }

    // Find blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return handleError(reply, { message: "Blog not found" }, 404);
    }

    // Check ownership
    if (!isOwner(blog.author, userId)) {
      return handleError(
        reply,
        { message: "You can only edit your own blogs" },
        403,
      );
    }

    // Validate and update fields
    const updates: any = {};

    if (title) {
      if (title.trim().length < 5 || title.trim().length > 200) {
        return handleError(
          reply,
          { message: "Title must be between 5 and 200 characters" },
          400,
        );
      }

      // Check uniqueness
      const existingBlog = await Blog.findOne({
        title: title.trim(),
        _id: { $ne: id },
      });
      if (existingBlog) {
        return handleError(
          reply,
          { message: "Blog with this title already exists" },
          400,
        );
      }

      updates.title = title.trim();
    }

    if (description) {
      if (description.trim().length < 10 || description.trim().length > 500) {
        return handleError(
          reply,
          { message: "Description must be between 10 and 500 characters" },
          400,
        );
      }
      updates.description = description.trim();
    }

    if (body) {
      if (body.trim().length < 50) {
        return handleError(
          reply,
          { message: "Body must be at least 50 characters" },
          400,
        );
      }
      updates.body = body.trim();
      updates.reading_time = calculateReadingTime(body);
    }

    if (tags) {
      updates.tags = tags.filter((tag) => tag.trim()).slice(0, 10);
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate("author", "-password");

    return handleSuccess(reply, updatedBlog);
  } catch (error) {
    return handleError(reply, error);
  }
};

// DELETE BLOG - Delete blog (owner only)
export const deleteBlog = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = (request.user as any)?.userId;
    if (!userId) {
      return handleError(reply, { message: "Unauthorized" }, 401);
    }

    const { id } = request.params as { id: string };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleError(reply, { message: "Invalid blog ID" }, 400);
    }

    // Find blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return handleError(reply, { message: "Blog not found" }, 404);
    }

    // Check ownership
    if (!isOwner(blog.author, userId)) {
      return handleError(
        reply,
        { message: "You can only delete your own blogs" },
        403,
      );
    }

    // Delete blog
    await Blog.findByIdAndDelete(id);

    return handleSuccess(reply, { message: "Blog deleted successfully" });
  } catch (error) {
    return handleError(reply, error);
  }
};

// UPDATE BLOG STATE - Change between draft and published (owner only)
export const updateBlogState = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = (request.user as any)?.userId;
    if (!userId) {
      return handleError(reply, { message: "Unauthorized" }, 401);
    }

    const { id } = request.params as { id: string };
    const { state } = request.body as { state: "draft" | "published" };

    // Validate state
    if (!state || !["draft", "published"].includes(state)) {
      return handleError(
        reply,
        { message: "State must be 'draft' or 'published'" },
        400,
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleError(reply, { message: "Invalid blog ID" }, 400);
    }

    // Find blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return handleError(reply, { message: "Blog not found" }, 404);
    }

    // Check ownership
    if (!isOwner(blog.author, userId)) {
      return handleError(
        reply,
        { message: "You can only change state of your own blogs" },
        403,
      );
    }

    // Update state
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { state },
      { new: true },
    ).populate("author", "-password");

    return handleSuccess(reply, updatedBlog);
  } catch (error) {
    return handleError(reply, error);
  }
};

// GET PUBLISHED BLOGS - List all published blogs (public, with pagination, search, sorting)
export const getPublishedBlogs = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const {
      page = "1",
      limit = "20",
      search = "",
      sortBy = "createdAt",
      order = "desc",
    } = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      sortBy?: string;
      order?: string;
    };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Validate sort field
    const allowedSortFields = ["createdAt", "read_count", "reading_time"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;

    // Build query
    const query: any = { state: "published" };

    // Search across title, description, tags, and author first_name/last_name
    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      const authorMatches = await User.find({
        $or: [{ first_name: searchRegex }, { last_name: searchRegex }],
      }).select("_id");

      const authorIds = authorMatches.map((u) => u._id);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { author: { $in: authorIds } },
      ];
    }

    // Get total count for pagination
    const total = await Blog.countDocuments(query);

    // Get paginated results
    const blogs = await Blog.find(query)
      .populate("author", "-password")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .exec();

    const totalPages = Math.ceil(total / limitNum);

    return handleSuccess(reply, {
      data: blogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBlogs: total,
        blogsPerPage: limitNum,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
};

// GET USER'S BLOGS - Get current user's blogs (paginated, filterable by state)
export const getUserBlogs = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = (request.user as any)?.userId;
    if (!userId) {
      return handleError(reply, { message: "Unauthorized" }, 401);
    }

    const {
      page = "1",
      limit = "20",
      state = "",
    } = request.query as {
      page?: string;
      limit?: string;
      state?: string;
    };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { author: userId };

    // Filter by state if provided
    if (state && ["draft", "published"].includes(state)) {
      query.state = state;
    }

    // Get total count for pagination
    const total = await Blog.countDocuments(query);

    // Get paginated results
    const blogs = await Blog.find(query)
      .populate("author", "-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .exec();

    const totalPages = Math.ceil(total / limitNum);

    return handleSuccess(reply, {
      data: blogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBlogs: total,
        blogsPerPage: limitNum,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
};
