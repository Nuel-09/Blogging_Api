import { FastifyRequest, FastifyReply } from "fastify";
import bcryptjs from "bcryptjs";
import { User } from "../models/user";
import { handleSuccess, handleError } from "./baseController";
import { signJwt, verifyJwt } from "../utils/jwt"; // JWT PATCH

// SIGNUP - Create new user account

export const signup = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password, first_name, last_name } = request.body as {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    };

    // Robust validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z0-9_\- ]{2,30}$/; // Letters, numbers, spaces, _ and -
    const passwordMinLength = 6;

    if (!email || !password || !first_name || !last_name) {
      return handleError(reply, { message: "Fill in all fields" }, 400);
    }
    if (!emailRegex.test(email)) {
      return handleError(reply, { message: "Invalid email format" }, 400);
    }
    if (!nameRegex.test(first_name.trim())) {
      return handleError(
        reply,
        { message: "First name must be 2-30 characters, no special symbols" },
        400,
      );
    }
    if (!nameRegex.test(last_name.trim())) {
      return handleError(
        reply,
        { message: "Last name must be 2-30 characters, no special symbols" },
        400,
      );
    }
    if (password.length < passwordMinLength) {
      return handleError(
        reply,
        {
          message: `Password must be at least ${passwordMinLength} characters`,
        },
        400,
      );
    }
    if (/\s/.test(password)) {
      return handleError(
        reply,
        { message: "Password cannot contain spaces" },
        400,
      );
    }
    if (first_name.trim().length !== first_name.length) {
      return handleError(
        reply,
        { message: "First name cannot start or end with spaces" },
        400,
      );
    }
    if (last_name.trim().length !== last_name.length) {
      return handleError(
        reply,
        { message: "Last name cannot start or end with spaces" },
        400,
      );
    }

    // check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return handleError(reply, { message: "Email already exist" }, 400);
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      first_name,
      last_name,
    });

    // JWT PATCH: Issue JWT
    const token = signJwt({ userId: newUser._id });

    // Set authentication cookie
    reply.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000, // 1 hour
    });

    // Return user data and JWT
    return handleSuccess(
      reply,
      {
        _id: newUser._id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        token, // JWT PATCH
      },
      201,
    );
  } catch (error) {
    return handleError(reply, error);
  }
};

// Login - Authenticate user
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    //validate input
    if (!email || !password) {
      return handleError(
        reply,
        { message: "Email and password are required" },
        400,
      );
    }

    // find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return handleError(reply, { message: "invalid email or password" }, 401);
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return handleError(reply, { message: "invalid email or password" });
    }

    // JWT PATCH: Issue JWT
    const token = signJwt({ userId: user._id });

    // Set authentication cookie
    reply.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000, // 1 hour
    });

    // Return user data and JWT
    return handleSuccess(reply, {
      _id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      token, // JWT PATCH
    });
  } catch (error) {
    return handleError(reply, error);
  }
};

// LOGOUT - End session
export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  // Clear authentication cookie
  reply.clearCookie("authToken");
  // JWT PATCH: No-op for JWT logout (client just deletes token)
  return handleSuccess(reply, { message: "Logged out successfully" });
};

// GET PROFILE - Get current user
export const getProfile = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // JWT PATCH: Get token from Authorization header
  try {
    const auth = request.headers["authorization"];
    if (!auth || !auth.startsWith("Bearer ")) {
      return handleError(reply, { message: "Not authenticated" }, 401);
    }
    const token = auth.split(" ")[1];
    const payload = verifyJwt(token);
    if (!payload || typeof payload !== "object" || !payload.userId) {
      return handleError(reply, { message: "Not authenticated" }, 401);
    }
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return handleError(reply, { message: "User not found" }, 404);
    }
    return handleSuccess(reply, user);
  } catch (error) {
    return handleError(reply, error);
  }
};
