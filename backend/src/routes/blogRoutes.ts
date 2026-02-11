import { FastifyInstance } from "fastify";
import {
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogState,
  getPublishedBlogs,
  getUserBlogs,
} from "../controllers/blogController";
import { authMiddleware } from "../middleware/auth";

export async function registerBlogRoutes(app: FastifyInstance) {
  // PUBLIC ROUTES (No auth required)

  // GET all published blogs (paginated, searchable, orderable)
  app.get<{
    Querystring: {
      page?: string;
      limit?: string;
      search?: string;
      sortBy?: string;
      order?: string;
    };
  }>("/api/blogs", async (request, reply) => {
    await getPublishedBlogs(request, reply);
  });

  // GET single published blog by ID
  app.get<{ Params: { id: string } }>(
    "/api/blogs/:id",
    async (request, reply) => {
      await getBlogById(request, reply);
    },
  );

  // PROTECTED ROUTES (Auth required)

  // POST - Create new blog
  app.post<{
    Body: { title: string; description: string; body: string; tags?: string[] };
  }>("/api/blogs", { onRequest: [authMiddleware] }, async (request, reply) => {
    await createBlog(request, reply);
  });

  // GET - Get current user's blogs
  app.get<{ Querystring: { page?: string; limit?: string; state?: string } }>(
    "/api/blogs/user/my-blogs",
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      await getUserBlogs(request, reply);
    },
  );

  // PUT - Update blog (owner only)
  app.put<{
    Params: { id: string };
    Body: {
      title?: string;
      description?: string;
      body?: string;
      tags?: string[];
    };
  }>(
    "/api/blogs/:id",
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      await updateBlog(request, reply);
    },
  );

  // DELETE - Delete blog (owner only)
  app.delete<{ Params: { id: string } }>(
    "/api/blogs/:id",
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      await deleteBlog(request, reply);
    },
  );

  // PATCH - Update blog state (draft/published) (owner only)
  app.patch<{ Params: { id: string }; Body: { state: "draft" | "published" } }>(
    "/api/blogs/:id/state",
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      await updateBlogState(request, reply);
    },
  );
}
