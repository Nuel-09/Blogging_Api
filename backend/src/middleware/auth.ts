import { FastifyRequest, FastifyReply } from "fastify";
import { verifyJwt } from "../utils/jwt";

// JWT authentication middleware for Fastify
export const ensureAuthenticated = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
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

  if (!token) {
    return reply.status(401).send({ message: "Not authenticated" });
  }

  const payload = verifyJwt(token);
  if (!payload || typeof payload !== "object" || !payload.userId) {
    return reply.status(401).send({ message: "Invalid or expired token" });
  }

  // Attach user info to request
  (request as any).user = payload;
  return;
};

// Ensure this file is treated as a module
export {};
