import { FastifyInstance } from "fastify";
import { ensureAuthenticated } from "../middleware/auth";
import {
  signup,
  login,
  logout,
  getProfile,
} from "../controllers/authController";

export const registerAuthRoutes = async (app: FastifyInstance) => {
  // Public routes (no authentication needed)

  // Signup - Create new account
  app.post("/api/auth/signup", signup);

  // Login - Authenticate user
  app.post("/api/auth/login", login);

  // Protected routes (authentication required)

  // Logout - End session (public route - clears cookie)
  app.post("/api/auth/logout", logout);

  // Get Profile - Get current user info
  app.get("/api/auth/profile", { preHandler: ensureAuthenticated }, getProfile);
};
