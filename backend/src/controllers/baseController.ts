import { FastifyReply } from "fastify";

// handle euccess and error replies
export const handleSuccess = (reply: FastifyReply, data: any, status = 200) => {
  return reply.status(status).send({ success: true, data });
};

export const handleError = (reply: FastifyReply, error: any, status = 400) => {
  console.error(error);
  return reply.status(status).send({
    success: false,
    error: error.message || "Something went wrong",
  });
};
