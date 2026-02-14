import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import mongoose from "mongoose";
import { Blog } from "../models/Blog";
import { User } from "../models/user";
import { verifyJwt } from "../utils/jwt";

// Helper: Get user from request
const getUser = async (request: FastifyRequest) => {
  try {
    let token: string | null = null;

    // Check Authorization header first
    const auth = (request.headers["authorization"] || "") as string;
    if (auth.startsWith("Bearer ")) {
      token = auth.split(" ")[1];
    }

    // Fall back to cookie if no Authorization header
    if (!token) {
      token = (request.cookies.authToken || null) as string | null;
    }

    if (!token) return null;

    const payload = verifyJwt(token);
    if (!payload || typeof payload !== "object" || !payload.userId) return null;

    const user = await User.findById(payload.userId).select("-password");
    return user ? { ...user.toObject(), _id: user._id.toString() } : null;
  } catch {
    return null;
  }
};

export async function registerViewRoutes(app: FastifyInstance) {
  // Home page - List published blogs
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUser(request);
      const page = (request.query as any).page || "1";
      const search = (request.query as any).search || "";
      const sortBy = (request.query as any).sortBy || "createdAt";
      const order = (request.query as any).order || "desc";

      const pageNum = Math.max(1, parseInt(page));
      const skip = (pageNum - 1) * 20;
      const sortOrder = order === "asc" ? 1 : -1;

      const query: any = { state: "published" };

      // Search
      if (search) {
        const searchRegex = { $regex: search, $options: "i" };
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

      const total = await Blog.countDocuments(query);
      const blogs = await Blog.find(query)
        .populate("author", "-password")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(20);

      return reply.view("index.ejs", {
        user,
        blogs: {
          data: blogs,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / 20),
            totalBlogs: total,
            blogsPerPage: 20,
          },
        },
        query: { search, sortBy, order },
      });
    } catch (error) {
      return reply.view("index.ejs", {
        user: null,
        blogs: { data: [], pagination: {} },
        query: {},
        error: "Failed to load blogs",
      });
    }
  });

  // Single blog page
  app.get<{ Params: { id: string } }>(
    "/blogs/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const user = await getUser(request);

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return reply
            .status(404)
            .view("error.ejs", { error: "Blog not found" });
        }

        const blog = await Blog.findByIdAndUpdate(
          id,
          { $inc: { read_count: 1 } },
          { new: true },
        ).populate("author", "-password");

        if (
          !blog ||
          (blog.state === "draft" &&
            (!user || user._id !== blog.author._id.toString()))
        ) {
          return reply
            .status(404)
            .view("error.ejs", { error: "Blog not found" });
        }

        return reply.view("blog.ejs", {
          user,
          blog: blog.toObject(),
        });
      } catch (error) {
        return reply
          .status(500)
          .view("error.ejs", { error: "Failed to load blog" });
      }
    },
  );

  // Login page
  app.get("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUser(request);
      if (user) {
        return reply.redirect("/dashboard");
      }
      return reply.view("login.ejs", { error: null });
    } catch {
      return reply.view("login.ejs", { error: null });
    }
  });

  // Signup page
  app.get("/signup", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUser(request);
      if (user) {
        return reply.redirect("/dashboard");
      }
      return reply.view("signup.ejs", { error: null });
    } catch {
      return reply.view("signup.ejs", { error: null });
    }
  });

  // Create blog page (protected)
  app.get(
    "/blogs/new",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await getUser(request);
        if (!user) {
          return reply.redirect("/login");
        }
        return reply.view("create-blog.ejs", { user, error: null });
      } catch {
        return reply.redirect("/login");
      }
    },
  );

  // Edit blog page (protected)
  app.get<{ Params: { id: string } }>(
    "/blogs/:id/edit",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const user = await getUser(request);

        if (!user) {
          return reply.redirect("/login");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return reply
            .status(404)
            .view("error.ejs", { error: "Blog not found" });
        }

        const blog = await Blog.findById(id).populate("author", "-password");

        if (!blog || blog.author._id.toString() !== user._id) {
          return reply
            .status(403)
            .view("error.ejs", { error: "Access denied" });
        }

        return reply.view("edit-blog.ejs", {
          user,
          blog: blog.toObject(),
          error: null,
        });
      } catch {
        return reply
          .status(500)
          .view("error.ejs", { error: "Failed to load blog" });
      }
    },
  );

  // Dashboard - User's blogs (protected)
  app.get(
    "/dashboard",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await getUser(request);
        if (!user) {
          return reply.redirect("/login");
        }

        const page = (request.query as any).page || "1";
        const state = (request.query as any).state || "";

        const pageNum = Math.max(1, parseInt(page));
        const skip = (pageNum - 1) * 20;

        const query: any = { author: user._id };
        if (state && ["draft", "published"].includes(state)) {
          query.state = state;
        }

        const total = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
          .populate("author", "-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(20);

        return reply.view("dashboard.ejs", {
          user,
          blogs: {
            data: blogs,
            pagination: {
              currentPage: pageNum,
              totalPages: Math.ceil(total / 20),
              totalBlogs: total,
              blogsPerPage: 20,
            },
          },
          state,
        });
      } catch {
        return reply.redirect("/login");
      }
    },
  );
}
