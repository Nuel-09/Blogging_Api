import { FastifyRequest } from "fastify";

declare global {
  namespace FastifyInstance {
    interface FastifyRequest {
      user?: {
        userId: string;
        [key: string]: any;
      };
    }
  }
}

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      userId: string;
      [key: string]: any;
    };
  }
}

export {};
