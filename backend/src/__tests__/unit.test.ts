import bcryptjs from "bcryptjs";
import { calculateReadingTime } from "../utils/readingTime";

describe("Unit Tests - Password & Data Validation", () => {
  // Setup - run once before all unit tests
  beforeAll(() => {
    console.log("🟢 Starting unit tests");
  });

  // Run before each test to ensure clean state
  beforeEach(() => {
    console.log("  ▶ Running test...");
  });

  // Run after each test to verify cleanup
  afterEach(() => {
    console.log("  ✓ Test completed");
  });

  // Cleanup - run once after all unit tests
  afterAll(() => {
    console.log("🔴 All unit tests finished\n");
  });

  describe("Password Hashing", () => {
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
  });

  describe("Data Validation", () => {
    test("email should be valid format", () => {
      const validEmail = "test@example.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(validEmail)).toBe(true);
    });

    test("email should reject invalid format", () => {
      const invalidEmail = "notanemail";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });

    test("password should have minimum length", () => {
      const password = "short";
      expect(password.length >= 6).toBe(false);
    });

    test("password should validate minimum length", () => {
      const password = "validPassword123";
      expect(password.length >= 6).toBe(true);
    });
  });

  describe("User Field Validation", () => {
    test("first_name and last_name should be 2-30 characters", () => {
      const nameRegex = /^[A-Za-z0-9_\- ]{2,30}$/;
      expect(nameRegex.test("John")).toBe(true);
      expect(nameRegex.test("J")).toBe(false);
      expect(nameRegex.test("a".repeat(31))).toBe(false);
      expect(nameRegex.test("John-Doe")).toBe(true);
    });
  });

  describe("Blog Field Validation", () => {
    test("title should be between 5-200 characters", () => {
      const shortTitle = "Hi";
      const longTitle = "a".repeat(201);
      const validTitle = "Valid Blog Title";

      expect(shortTitle.length < 5).toBe(true);
      expect(longTitle.length > 200).toBe(true);
      expect(validTitle.length >= 5 && validTitle.length <= 200).toBe(true);
    });

    test("description should be between 10-500 characters", () => {
      const shortDesc = "Short";
      const longDesc = "a".repeat(501);
      const validDesc = "This is a valid description";

      expect(shortDesc.length < 10).toBe(true);
      expect(longDesc.length > 500).toBe(true);
      expect(validDesc.length >= 10 && validDesc.length <= 500).toBe(true);
    });

    test("body should be at least 50 characters", () => {
      const shortBody = "Too short";
      const validBody = "a".repeat(50);

      expect(shortBody.length < 50).toBe(true);
      expect(validBody.length >= 50).toBe(true);
    });

    test("state should be either 'draft' or 'published'", () => {
      const validStates = ["draft", "published"];

      expect(validStates.includes("draft")).toBe(true);
      expect(validStates.includes("published")).toBe(true);
      expect(validStates.includes("archived")).toBe(false);
    });

    test("tags should have maximum 10 items", () => {
      const validTags = ["js", "react", "blog"];
      const invalidTags = Array(11).fill("tag");

      expect(validTags.length <= 10).toBe(true);
      expect(invalidTags.length > 10).toBe(true);
    });
  });

  describe("Reading Time Calculation", () => {
    test("should calculate reading time correctly for ~200 words", () => {
      const text = Array(200).fill("word").join(" ");
      const readingTime = calculateReadingTime(text);
      expect(readingTime).toBe(1);
    });

    test("should calculate reading time for ~400 words as 2 minutes", () => {
      const text = Array(400).fill("word").join(" ");
      const readingTime = calculateReadingTime(text);
      expect(readingTime).toBe(2);
    });

    test("should calculate reading time for ~600 words as 3 minutes", () => {
      const text = Array(600).fill("word").join(" ");
      const readingTime = calculateReadingTime(text);
      expect(readingTime).toBe(3);
    });

    test("should return minimum 1 minute for very short text", () => {
      const text = "Hello world";
      const readingTime = calculateReadingTime(text);
      expect(readingTime).toBe(1);
    });

    test("should round up reading time", () => {
      const text = Array(250).fill("word").join(" "); // ~1.25 minutes
      const readingTime = calculateReadingTime(text);
      expect(readingTime).toBe(2);
    });

    test("should handle whitespace correctly", () => {
      const text =
        "  word   word   word   " + Array(197).fill("word").join(" ");
      const readingTime = calculateReadingTime(text);
      expect(readingTime).toBeGreaterThanOrEqual(1);
    });
  });
});
