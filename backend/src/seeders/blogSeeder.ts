import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { User } from "../models/user";
import { Blog } from "../models/Blog";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/blogging_system";

// Sample blog data
const blogTitles = [
  "Getting Started with TypeScript",
  "React Hooks: A Complete Guide",
  "Building REST APIs with Node.js",
  "MongoDB Best Practices",
  "CSS Grid vs Flexbox",
  "JavaScript async/await Explained",
  "Docker for Beginners",
  "Understanding JWT Authentication",
  "Vue.js Composition API",
  "WebSocket Real-time Communication",
  "GraphQL vs REST",
  "Next.js Advanced Patterns",
  "Testing with Jest",
  "Git Workflow Mastery",
  "Microservices Architecture",
  "Redis Caching Strategies",
  "Machine Learning with Python",
  "Cloud Deployment Best Practices",
  "Performance Optimization Techniques",
  "Cybersecurity Fundamentals",
  "Building Scalable Applications",
  "Database Indexing Strategies",
  "API Design Patterns",
  "Mobile Development with React Native",
  "Automated Testing Frameworks",
  "Container Orchestration with Kubernetes",
  "Serverless Computing",
  "Progressive Web Apps",
  "Microservices vs Monolithic",
  "Data Structures and Algorithms",
  "Design Patterns in Software Development",
  "Clean Code Principles",
  "Agile Methodology",
  "DevOps Best Practices",
  "Event-Driven Architecture",
  "SOLID Principles Explained",
  "Test-Driven Development",
  "Continuous Integration and Deployment",
  "Load Balancing Strategies",
  "Caching Mechanisms",
  "API Security Best Practices",
  "Error Handling in Production",
  "Logging and Monitoring",
  "System Design Interview",
  "Rate Limiting Implementation",
  "Database Sharding",
  "Message Queue Systems",
  "Distributed Systems",
  "Concurrency Control",
  "Network Protocols"
];

const blogDescriptions = [
  "A comprehensive guide to getting started with TypeScript and its advanced features.",
  "Learn how to use React Hooks to write cleaner, more maintainable component code.",
  "Master the art of building scalable REST APIs with Express.js and Node.js.",
  "Discover MongoDB best practices for optimal performance and data management.",
  "Compare CSS Grid and Flexbox to understand when to use each layout technique.",
  "Deep dive into JavaScript async/await and how it simplifies asynchronous code.",
  "Introduction to Docker containerization for development and deployment.",
  "Understand JWT tokens and implement secure authentication in your applications.",
  "Explore Vue.js Composition API for more flexible and reusable component logic.",
  "Real-time communication over WebSockets for interactive applications.",
  "Compare GraphQL and REST to choose the right API architecture for your project.",
  "Advanced patterns and techniques in Next.js for production applications.",
  "Complete guide to unit testing with Jest framework.",
  "Master Git workflow for effective team collaboration.",
  "Architecture patterns for microservices-based systems.",
  "Redis caching strategies to improve application performance.",
  "Introduction to machine learning concepts with Python.",
  "Deploy your applications to cloud platforms like AWS, Azure, or Google Cloud.",
  "Optimize your application performance with these proven techniques.",
  "Learn the basics of cybersecurity to protect your applications.",
  "Build applications that scale to millions of users.",
  "Optimize database queries using proper indexing strategies.",
  "Design robust APIs with consistent patterns and best practices.",
  "Develop mobile apps using React Native for iOS and Android.",
  "Automate your testing process with popular testing frameworks.",
  "Orchestrate containers at scale using Kubernetes.",
  "Build applications without managing servers using serverless architecture.",
  "Create web applications that work offline with Progressive Web Apps.",
  "Choose between microservices and monolithic architecture for your project.",
  "Master essential data structures and algorithms for coding interviews.",
  "Common design patterns for solving recurring problems in software.",
  "Write maintainable code by following clean code principles.",
  "Implement Agile methodology for efficient project management.",
  "Best practices for DevOps teams and CI/CD pipelines.",
  "Build systems that react to events in real-time.",
  "Understand SOLID principles for better code design.",
  "Write tests before implementing features with TDD.",
  "Automate your testing and deployment pipeline.",
  "Distribute traffic across multiple servers efficiently.",
  "Implement different caching strategies to reduce latency.",
  "Secure your APIs against common vulnerabilities.",
  "Proper error handling and recovery in production systems.",
  "Monitor and log your applications for better troubleshooting.",
  "Common questions and solutions for system design interviews.",
  "Implement rate limiting to protect your APIs.",
  "Scale databases horizontally with sharding techniques.",
  "Use message queues for asynchronous communication.",
  "Understand distributed systems and their challenges.",
  "Control concurrent access to shared resources.",
  "Overview of network protocols and their usage."
];

const bodyContent = {
  short: `In this article, we'll explore fundamental concepts and practical examples. Whether you're a beginner or intermediate developer, this guide will help you understand the key principles. Throughout this post, we'll cover essential topics, real-world scenarios, and best practices. By the end, you'll have a solid foundation to build upon. Let's dive in and start learning!`,
  
  medium: `This comprehensive guide covers all the essential aspects you need to know. We'll start with the basics and progressively move to more advanced topics. Each section includes practical examples and code snippets to illustrate the concepts. You'll learn about design patterns, optimization techniques, and common pitfalls to avoid. The article includes multiple real-world scenarios where these concepts are applied in production systems. By mastering these topics, you'll be able to make informed decisions in your projects. We'll also discuss best practices and industry standards. Whether you're working on a small project or a large-scale system, these principles apply universally. Take your time to understand each concept thoroughly.`,
  
  long: `This in-depth tutorial provides a complete overview of the subject matter. We begin by establishing a solid foundation with fundamental concepts and terminology. As we progress, we'll explore intermediate and advanced topics with detailed explanations. Each topic includes multiple code examples demonstrating real-world usage patterns. You'll learn how to implement these concepts in your own projects. We'll also discuss common mistakes developers make and how to avoid them. Performance optimization techniques are covered extensively with benchmarks and comparisons. Security considerations are highlighted throughout the article. We'll examine best practices used in production systems at major companies. The article includes step-by-step instructions for implementing the concepts. By the end, you'll have a comprehensive understanding of the subject. You'll be able to apply these concepts confidently in your own work. We also provide resources for further learning and community engagement.`
};

const tags = [
  ["javascript", "tutorial"],
  ["typescript", "backend"],
  ["react", "frontend"],
  ["nodejs", "api"],
  ["database", "mongodb"],
  ["css", "styling"],
  ["web", "development"],
  ["security", "authentication"],
  ["vue", "javascript"],
  ["websockets", "realtime"],
  ["graphql", "api"],
  ["nextjs", "react"],
  ["testing", "jest"],
  ["git", "devops"],
  ["microservices", "architecture"],
  ["redis", "caching"],
  ["python", "machine-learning"],
  ["cloud", "deployment"],
  ["performance", "optimization"],
  ["docker", "containers"],
  ["kubernetes", "devops"],
  ["serverless", "aws"],
  ["pwa", "progressive-web"],
  ["react-native", "mobile"],
  ["devops", "ci-cd"],
  ["architecture", "design-patterns"],
  ["code-quality", "clean-code"],
  ["agile", "project-management"],
  ["database", "indexing"],
  ["api", "rest"],
];

const sampleUsers = [
  { first_name: "John", last_name: "Doe", email: "john.doe@example.com", password: "Password123" },
  { first_name: "Jane", last_name: "Smith", email: "jane.smith@example.com", password: "Password456" },
  { first_name: "Mike", last_name: "Johnson", email: "mike.johnson@example.com", password: "Password789" },
  { first_name: "Sarah", last_name: "Williams", email: "sarah.williams@example.com", password: "SecurePass1" },
  { first_name: "David", last_name: "Brown", email: "david.brown@example.com", password: "SecurePass2" },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    console.log(`📦 Connecting to MongoDB: ${MONGO_URI.substring(0, 50)}...`);

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Blog.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create sample users
    console.log("👥 Creating sample users...");
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcryptjs.hash(user.password, 10),
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create 50 sample blogs
    console.log("📝 Creating 50 sample blogs...");
    const blogs = [];

    for (let i = 0; i < 50; i++) {
      const randomUserIndex = Math.floor(Math.random() * createdUsers.length);
      const randomTitleIndex = i % blogTitles.length;
      const randomDescIndex = i % blogDescriptions.length;
      const randomBodyIndex = Math.floor(Math.random() * 3); // 0, 1, 2
      const randomTagIndex = i % tags.length;
      const isPublished = Math.random() > 0.3; // 70% published, 30% draft

      const bodyTexts = [bodyContent.short, bodyContent.medium, bodyContent.long];
      const selectedBody = bodyTexts[randomBodyIndex];
      const wordCount = selectedBody.split(/\s+/).length;

      blogs.push({
        title: `${blogTitles[randomTitleIndex]} - Part ${Math.floor(i / blogTitles.length) + 1}`,
        description: blogDescriptions[randomDescIndex],
        body: selectedBody,
        author: createdUsers[randomUserIndex]._id,
        state: isPublished ? "published" : "draft",
        read_count: isPublished ? Math.floor(Math.random() * 500) : 0,
        reading_time: Math.ceil(wordCount / 200) || 1,
        tags: tags[randomTagIndex],
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        updatedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      });
    }

    const createdBlogs = await Blog.insertMany(blogs);
    console.log(`✅ Created ${createdBlogs.length} blogs`);

    // Print sample credentials
    console.log("\n📋 Sample User Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    sampleUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log("");
    });

    // Print statistics
    console.log("📊 Database Statistics:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const publishedCount = await Blog.countDocuments({ state: "published" });
    const draftCount = await Blog.countDocuments({ state: "draft" });
    const totalReads = await Blog.aggregate([{ $group: { _id: null, total: { $sum: "$read_count" } } }]);

    console.log(`Total Users: ${createdUsers.length}`);
    console.log(`Total Blogs: ${createdBlogs.length}`);
    console.log(`Published: ${publishedCount}`);
    console.log(`Drafts: ${draftCount}`);
    console.log(`Total Reads: ${totalReads[0]?.total || 0}`);
    console.log("");

    // Average stats
    const avgReading = await Blog.aggregate([{ $group: { _id: null, avg: { $avg: "$reading_time" } } }]);
    console.log(`Average Reading Time: ${avgReading[0]?.avg?.toFixed(1) || 0} minutes`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("🚀 You can now test the API with this sample data.\n");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
