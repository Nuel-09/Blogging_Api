import { FastifyRequest, FastifyReply } from "fastify";
import { verifyJwt } from "../utils/jwt";

// JWT authentication middleware for Fastify
export const ensureAuthenticated = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const auth = (request.headers["authorization"] || "") as string;
  if (!auth.startsWith("Bearer ")) {
    return reply.status(401).send({ message: "Not authenticated" });
  }
  const token = auth.split(" ")[1];
  const payload = verifyJwt(token);
  if (!payload || typeof payload !== "object" || !payload.userId) {
    return reply.status(401).send({ message: "Invalid or expired token" });
  }
  // Optionally attach user info to request
  (request as any).user = payload;
};
// Ensure this file is treated as a module
export {};
