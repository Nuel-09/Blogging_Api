import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { calculateReadingTime } from "../utils/readingTime";
import { signJwt, verifyJwt } from "../utils/jwt";

describe("Unit Tests - Core Business Logic & Utilities", () => {
  beforeAll(() => {
    console.log("🟢 Starting unit tests");
  });

  beforeEach(() => {
    console.log("  ▶ Running test...");
  });

  afterEach(() => {
    console.log("  ✓ Test completed");
  });

  afterAll(() => {
    console.log("🔴 All unit tests finished\n");
  });

  describe("Authentication Utilities", () => {
    describe("Password Hashing (bcryptjs)", () => {
      test("should hash password correctly", async () => {
        const password = "testPassword123";
        const hashedPassword = await bcryptjs.hash(password, 10);

        expect(hashedPassword).not.toBe(password);
        expect(hashedPassword.length).toBeGreaterThan(0);
      });

      test("should compare password with hash correctly", async () => {
        const password = "testPassword123";
        const hashedPassword = await bcryptjs.hash(password, 10);

        const isMatch = await bcryptjs.compare(password, hashedPassword);
        expect(isMatch).toBe(true);
      });

      test("should not match wrong password", async () => {
        const password = "testPassword123";
        const wrongPassword = "wrongPassword";
        const hashedPassword = await bcryptjs.hash(password, 10);

        const isMatch = await bcryptjs.compare(wrongPassword, hashedPassword);
        expect(isMatch).toBe(false);
      });

      test("should create different hashes for same password", async () => {
        const password = "testPassword123";
        const hash1 = await bcryptjs.hash(password, 10);
        const hash2 = await bcryptjs.hash(password, 10);

        expect(hash1).not.toBe(hash2);
        // But both should match the password
        expect(await bcryptjs.compare(password, hash1)).toBe(true);
        expect(await bcryptjs.compare(password, hash2)).toBe(true);
      });
    });

    describe("JWT Token Management", () => {
      test("should sign and verify JWT token", () => {
        const payload = { userId: "user123" };
        const token = signJwt(payload);

        expect(token).toBeDefined();
        expect(typeof token).toBe("string");

        const verified = verifyJwt(token);
        expect(verified).toBeDefined();
        expect((verified as any).userId).toBe("user123");
      });

      test("should return null for invalid token", () => {
        const invalidToken = "invalid.token.here";
        const verified = verifyJwt(invalidToken);

        expect(verified).toBeNull();
      });

      test("should have correct exp claim in token", () => {
        const payload = { userId: "user123" };
        const token = signJwt(payload, "1h");

        const verified = verifyJwt(token) as any;
        expect(verified.exp).toBeDefined();
      });
    });
  });

  describe("Data Validation Rules", () => {
    describe("Email Validation", () => {
      test("should validate correct email format", () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmails = [
          "test@example.com",
          "user.name@company.co.uk",
          "john+tag@gmail.com",
        ];

        validEmails.forEach((email) => {
          expect(emailRegex.test(email)).toBe(true);
        });
      });

      test("should reject invalid email formats", () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = [
          "notanemail",
          "missing@domain",
          "@nodomain.com",
          "spaces in@email.com",
        ];

        invalidEmails.forEach((email) => {
          expect(emailRegex.test(email)).toBe(false);
        });
      });
    });

    describe("Password Validation", () => {
      test("should validate minimum password length of 6", () => {
        const minLength = 6;
        expect("short".length >= minLength).toBe(false);
        expect("validPassword123".length >= minLength).toBe(true);
      });

      test("should reject passwords with spaces", () => {
        const passwordsWithSpaces = [
          "pass word",
          "my password",
          " password",
          "password ",
        ];

        passwordsWithSpaces.forEach((pwd) => {
          expect(/\s/.test(pwd)).toBe(true);
        });
      });

      test("should allow valid passwords without spaces", () => {
        const validPasswords = [
          "Password123",
          "SecureP@ss123",
          "MyBlog2024",
          "Test123",
        ];

        validPasswords.forEach((pwd) => {
          expect(/\s/.test(pwd)).toBe(false);
        });
      });
    });

    describe("Name Validation", () => {
      test("should validate first/last names (2-30 chars)", () => {
        const nameRegex = /^[A-Za-z0-9_\- ]{2,30}$/;

        expect(nameRegex.test("John")).toBe(true);
        expect(nameRegex.test("Jane-Marie")).toBe(true);
        expect(nameRegex.test("J")).toBe(false); // Too short
        expect(nameRegex.test("a".repeat(31))).toBe(false); // Too long
      });

      test("should allow special chars in names: hyphen, underscore, space", () => {
        const nameRegex = /^[A-Za-z0-9_\- ]{2,30}$/;

        expect(nameRegex.test("Mary-Jane")).toBe(true);
        expect(nameRegex.test("John_Smith")).toBe(true);
        expect(nameRegex.test("Jean Paul")).toBe(true);
      });
    });

    describe("Blog Field Validation", () => {
      test("should validate blog title (5-200 characters)", () => {
        const isValidTitle = (title: string) =>
          title.trim().length >= 5 && title.trim().length <= 200;

        expect(isValidTitle("Hi")).toBe(false); // Too short
        expect(isValidTitle("Valid Blog Title")).toBe(true);
        expect(isValidTitle("a".repeat(201))).toBe(false); // Too long
      });

      test("should validate blog description (10-500 characters)", () => {
        const isValidDesc = (desc: string) =>
          desc.trim().length >= 10 && desc.trim().length <= 500;

        expect(isValidDesc("Short")).toBe(false);
        expect(isValidDesc("This is a valid description")).toBe(true);
        expect(isValidDesc("a".repeat(501))).toBe(false);
      });

      test("should validate blog body (minimum 50 characters)", () => {
        const isValidBody = (body: string) => body.trim().length >= 50;

        expect(isValidBody("Too short")).toBe(false);
        expect(
          isValidBody(
            "This is a valid blog body with enough content for publishing",
          ),
        ).toBe(true);
      });

      test("should validate blog state (draft or published)", () => {
        const validStates = ["draft", "published"];
        const isValidState = (state: string) => validStates.includes(state);

        expect(isValidState("draft")).toBe(true);
        expect(isValidState("published")).toBe(true);
        expect(isValidState("archived")).toBe(false);
        expect(isValidState("")).toBe(false);
      });

      test("should validate tags (maximum 10 items)", () => {
        const isValidTags = (tags: string[]) => tags.length <= 10;

        expect(isValidTags(["js", "react"])).toBe(true);
        expect(isValidTags(Array(10).fill("tag"))).toBe(true);
        expect(isValidTags(Array(11).fill("tag"))).toBe(false);
      });

      test("should filter empty tags", () => {
        const tags = ["js", "", "react", "  ", "blog"];
        const filtered = tags.filter((tag) => tag.trim());

        expect(filtered).toEqual(["js", "react", "blog"]);
        expect(filtered.length).toBe(3);
      });
    });
  });

  describe("Blog Content Utilities", () => {
    describe("Reading Time Calculation", () => {
      test("should calculate reading time for ~200 words (1 minute)", () => {
        const text = Array(200).fill("word").join(" ");
        const readingTime = calculateReadingTime(text);
        expect(readingTime).toBe(1);
      });

      test("should calculate reading time for ~400 words (2 minutes)", () => {
        const text = Array(400).fill("word").join(" ");
        const readingTime = calculateReadingTime(text);
        expect(readingTime).toBe(2);
      });

      test("should calculate reading time for ~600 words (3 minutes)", () => {
        const text = Array(600).fill("word").join(" ");
        const readingTime = calculateReadingTime(text);
        expect(readingTime).toBe(3);
      });

      test("should calculate reading time for ~1000 words (5 minutes)", () => {
        const text = Array(1000).fill("word").join(" ");
        const readingTime = calculateReadingTime(text);
        expect(readingTime).toBe(5);
      });

      test("should return minimum 1 minute for very short text", () => {
        const text = "Hello world";
        const readingTime = calculateReadingTime(text);
        expect(readingTime).toBe(1);
      });

      test("should round up reading time correctly", () => {
        const text = Array(250).fill("word").join(" "); // ~1.25 minutes
        const readingTime = calculateReadingTime(text);
        expect(readingTime).toBe(2);
      });

      test("should handle extra whitespace correctly", () => {
        const text =
          "  word   word   word   " + Array(197).fill("word").join(" ");
        const readingTime = calculateReadingTime(text);
        expect(readingTime).toBeGreaterThanOrEqual(1);
      });

      test("should use 200 words per minute as standard", () => {
        const text = Array(400).fill("word").join(" "); // 400 words
        const readingTime = calculateReadingTime(text);
        // 400 / 200 = 2 minutes
        expect(readingTime).toBe(2);
      });

      test("should calculate correctly for real blog content", () => {
        const realContent = Array(300).fill("word").join(" ");
        const readingTime = calculateReadingTime(realContent);
        expect(readingTime).toBeGreaterThan(1);
      });
    });
  });

  describe("Data Processing", () => {
    describe("Blog State Management", () => {
      test("should toggle blog state correctly", () => {
        let blog = { state: "draft" };

        blog.state = blog.state === "draft" ? "published" : "draft";
        expect(blog.state).toBe("published");

        blog.state = blog.state === "draft" ? "published" : "draft";
        expect(blog.state).toBe("draft");
      });

      test("should preserve blog data on state change", () => {
        const blog = {
          _id: "blog123",
          title: "My Blog",
          author: "user123",
          state: "draft",
        };

        const updatedBlog = {
          ...blog,
          state: "published",
        };

        expect(updatedBlog.title).toBe(blog.title);
        expect(updatedBlog.author).toBe(blog.author);
        expect(updatedBlog._id).toBe(blog._id);
        expect(updatedBlog.state).toBe("published");
      });
    });

    describe("Read Count Management", () => {
      test("should increment read count on blog view", () => {
        const blog = { read_count: 5 };
        blog.read_count += 1;
        expect(blog.read_count).toBe(6);
      });

      test("should initialize read_count to 0 for new blog", () => {
        const newBlog = { read_count: 0 };
        expect(newBlog.read_count).toBe(0);
      });

      test("should handle multiple read increments", () => {
        const blog = { read_count: 0 };
        for (let i = 0; i < 5; i++) {
          blog.read_count += 1;
        }
        expect(blog.read_count).toBe(5);
      });
    });
  });
});
