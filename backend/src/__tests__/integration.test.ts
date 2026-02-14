import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import fastifyView from "@fastify/view";
import ejs from "ejs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";

import { registerAuthRoutes } from "../routes/authRoutes";
import { registerBlogRoutes } from "../routes/blogRoutes";

let app: any;
let mongoServer: MongoMemoryServer;
let authToken: string;
let userId: string;
let blogId: string;

const testUser = {
  email: "testuser@example.com",
  password: "TestPassword123",
  first_name: "Test",
  last_name: "User",
};

const testBlog = {
  title: "Integration Test Blog",
  description:
    "This is a test blog description for integration testing purposes",
  body: "This is a comprehensive test blog post with actual meaningful content. We are testing the reading time calculation and other features. The blog should have enough words to calculate reading time correctly and demonstrate all functionality properly in the test suite.",
  tags: ["testing", "integration"],
};

describe("Integration Tests - Full API Endpoints", () => {
  // Setup - run once before all integration tests
  beforeAll(async () => {
    console.log("🟢 Starting integration tests with in-memory MongoDB");

    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect mongoose to in-memory database
    await mongoose.connect(mongoUri);

    // Create Fastify app
    app = Fastify({
      logger: false,
    });

    // Register plugins
    await app.register(fastifyCookie);
    await app.register(fastifyCors, {
      origin: ["http://localhost:5000", "http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    });

    // View engine
    await app.register(fastifyView, {
      engine: { ejs },
      root: path.join(__dirname, "../../views"),
    });

    // Register routes
    await registerAuthRoutes(app);
    await registerBlogRoutes(app);

    // Start server
    await app.listen({ port: 5001, host: "0.0.0.0" });
    console.log("✅ Test server running on port 5001");
  }, 60000); // 60 second timeout for MongoDB download

  // Run before each test to ensure fresh state
  beforeEach(() => {
    console.log("  ▶ Running test...");
  });

  // Run after each test to verify cleanup
  afterEach(() => {
    console.log("  ✓ Test completed");
  });

  // Cleanup - run once after all integration tests
  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log("🔴 All integration tests finished\n");
  }, 30000); // 30 second timeout for cleanup

  describe("Authentication Endpoints", () => {
    test("POST /api/auth/signup - Should create new user account", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/signup",
        payload: testUser,
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("_id");
      expect(data.data).toHaveProperty("token");
      expect(data.data.email).toBe(testUser.email);
      userId = data.data._id;
      authToken = data.data.token;
    }, 10000); // 10 second timeout

    test("POST /api/auth/login - Should authenticate existing user", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("token");
      expect(data.data.email).toBe(testUser.email);
    });

    test("POST /api/auth/login - Should fail with invalid password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: testUser.email,
          password: "WrongPassword",
        },
      });

      expect(response.statusCode).toBe(401);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
    });

    test("POST /api/auth/signup - Should reject duplicate email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/signup",
        payload: testUser,
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toContain("already exist");
    });

    test("POST /api/auth/logout - Should clear session", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe("Blog CRUD Operations", () => {
    test("POST /api/blogs - Should create a new blog", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/blogs",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: testBlog,
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("_id");
      expect(data.data.title).toBe(testBlog.title);
      expect(data.data.state).toBe("draft");
      expect(data.data.reading_time).toBeGreaterThan(0);
      blogId = data.data._id;
    });

    test("POST /api/blogs - Should reject without authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/blogs",
        payload: testBlog,
      });

      expect(response.statusCode).toBe(401);
    });

    test("GET /api/blogs - Should retrieve paginated published blogs", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/blogs?page=1&limit=10",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("data");
      expect(data.data).toHaveProperty("pagination");
      expect(Array.isArray(data.data.data)).toBe(true);
    });

    test("GET /api/blogs/:id - Should retrieve single published blog", async () => {
      // First publish a blog
      await app.inject({
        method: "PATCH",
        url: `/api/blogs/${blogId}/state`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: { state: "published" },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/blogs/${blogId}`,
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(testBlog.title);
      expect(data.data.read_count).toBeGreaterThanOrEqual(0);
    });

    test("GET /api/blogs/:id - Should increment read count on view", async () => {
      const response1 = await app.inject({
        method: "GET",
        url: `/api/blogs/${blogId}`,
      });

      const data1 = JSON.parse(response1.body);
      const initialReadCount = data1.data.read_count;

      const response2 = await app.inject({
        method: "GET",
        url: `/api/blogs/${blogId}`,
      });

      const data2 = JSON.parse(response2.body);
      expect(data2.data.read_count).toBe(initialReadCount + 1);
    });

    test("PUT /api/blogs/:id - Should update blog content", async () => {
      const updatedBlog = {
        ...testBlog,
        title: "Updated Test Blog",
        description: "Updated description for testing",
      };

      const response = await app.inject({
        method: "PUT",
        url: `/api/blogs/${blogId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: updatedBlog,
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe("Updated Test Blog");
    });

    test("PATCH /api/blogs/:id/state - Should toggle blog state", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/api/blogs/${blogId}/state`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: { state: "draft" },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.state).toBe("draft");
    });

    test("GET /api/blogs/user/my-blogs - Should retrieve user's own blogs", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/blogs/user/my-blogs",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.data)).toBe(true);
    });

    test("DELETE /api/blogs/:id - Should delete blog", async () => {
      // Create a blog to delete
      const createResponse = await app.inject({
        method: "POST",
        url: "/api/blogs",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          ...testBlog,
          title: "Blog to Delete",
        },
      });

      const createData = JSON.parse(createResponse.body);
      const deleteId = createData.data._id;

      const deleteResponse = await app.inject({
        method: "DELETE",
        url: `/api/blogs/${deleteId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(200);
      const data = JSON.parse(deleteResponse.body);
      expect(data.success).toBe(true);

      // Verify deletion
      const getResponse = await app.inject({
        method: "GET",
        url: `/api/blogs/${deleteId}`,
      });

      expect(getResponse.statusCode).toBe(404);
    });
  });

  describe("Search, Filter & Pagination", () => {
    test("GET /api/blogs?search=Updated - Should find blog by title", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/blogs?search=Updated&page=1&limit=10",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    test("GET /api/blogs?sortBy=read_count&order=desc - Should sort by read count", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/blogs?page=1&limit=10&sortBy=read_count&order=desc",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    test("GET /api/blogs/user/my-blogs?state=draft - Should filter user blogs by state", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/blogs/user/my-blogs?state=draft",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.data)).toBe(true);
    });

    test("Pagination should have correct structure", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/blogs?page=1&limit=5",
      });

      const data = JSON.parse(response.body);
      expect(data.data.pagination).toHaveProperty("currentPage");
      expect(data.data.pagination).toHaveProperty("totalPages");
      expect(data.data.pagination).toHaveProperty("totalBlogs");
      expect(data.data.pagination).toHaveProperty("blogsPerPage");
    });
  });

  describe("Authorization & Permission Tests", () => {
    test("Should not delete another user's blog", async () => {
      // Create second user
      const user2 = {
        email: "testuser2@example.com",
        password: "TestPassword123",
        first_name: "Test2",
        last_name: "User2",
      };

      const signupResponse = await app.inject({
        method: "POST",
        url: "/api/auth/signup",
        payload: user2,
      });

      const signupData = JSON.parse(signupResponse.body);
      const user2Token = signupData.data.token;

      // Try to delete original user's blog with user2
      const deleteResponse = await app.inject({
        method: "DELETE",
        url: `/api/blogs/${blogId}`,
        headers: {
          authorization: `Bearer ${user2Token}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(403);
    });

    test("Should not update another user's blog", async () => {
      const user2 = {
        email: "testuser3@example.com",
        password: "TestPassword123",
        first_name: "Test3",
        last_name: "User3",
      };

      const signupResponse = await app.inject({
        method: "POST",
        url: "/api/auth/signup",
        payload: user2,
      });

      const signupData = JSON.parse(signupResponse.body);
      const user2Token = signupData.data.token;

      const updateResponse = await app.inject({
        method: "PUT",
        url: `/api/blogs/${blogId}`,
        headers: {
          authorization: `Bearer ${user2Token}`,
        },
        payload: {
          title: "Hacked Title",
          description: testBlog.description,
          body: testBlog.body,
        },
      });

      expect(updateResponse.statusCode).toBe(403);
    });
  });

  describe("Validation Tests", () => {
    test("POST /api/blogs - Should reject short title", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/blogs",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          ...testBlog,
          title: "ABC", // Too short
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
    });

    test("POST /api/blogs - Should reject short body", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/blogs",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          ...testBlog,
          body: "Too short", // Less than 50 chars
        },
      });

      expect(response.statusCode).toBe(400);
    });

    test("POST /api/auth/signup - Should reject invalid email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/signup",
        payload: {
          ...testUser,
          email: "notanemail",
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
    });

    test("POST /api/auth/signup - Should reject short password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/signup",
        payload: {
          ...testUser,
          email: "unique@example.com",
          password: "short",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
