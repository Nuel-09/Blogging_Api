import path from "node:path";
import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";

// Type declarations
import "./types/fastify";

import { connectDB } from "./config/database";
import { registerAuthRoutes } from "./routes/authRoutes";
import { registerBlogRoutes } from "./routes/blogRoutes";

dotenv.config();

const app = Fastify({
  logger: true,
});

const PORT = parseInt(process.env.FASTIFY_PORT || "5000", 10);
const HOST = process.env.FASTIFY_HOST || "0.0.0.0";

const configurePlugins = async () => {
  // CORS - Allow frontend to connect
  await app.register(fastifyCors, {
    origin: ["https://taskapp-cvmv.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  });

  // Cookie handling
  await app.register(fastifyCookie);

  // Static files
  await app.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
    prefix: "/public/",
  });
};

const registerRoutes = async () => {
  // Auth routes
  await app.register(registerAuthRoutes);

  // Blog routes
  await app.register(registerBlogRoutes);
};

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Configure plugins
    await configurePlugins();

    // Register routes
    await registerRoutes();

    // Start server
    await app.listen({ port: PORT, host: HOST });
    console.log(`✓ Server running at http://${HOST}:${PORT}`);
  } catch (error) {
    console.error("✗ Server failed to start:", error);
    process.exit(1);
  }
};

start();
