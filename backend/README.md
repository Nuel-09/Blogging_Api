# Blogging API System

A comprehensive blogging API built with **Fastify**, **TypeScript**, and **MongoDB**. Users can create, read, update, and delete blog posts with full authentication and authorization.

## Features

✅ **User Authentication**
- JWT-based authentication with 1-hour token expiration
- Secure password hashing with bcryptjs
- User registration and login

✅ **Blog Management**
- Create blogs in draft state
- Publish/unpublish blogs
- Edit and delete blogs (owner only)
- Automatic reading time calculation
- Search by title, description, tags, and author
- Sort by read count, reading time, and creation date
- Pagination support (default 20 blogs per page)

✅ **Authorization**
- Only authenticated users can create blogs
- Only blog owners can edit/delete their blogs
- Published blogs viewable by anyone
- Draft blogs only viewable by owner

✅ **Performance**
- Indexed MongoDB queries for fast searches
- Efficient pagination
- Automatic read count tracking

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Testing**: Jest
- **CORS**: @fastify/cors

## Installation

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blogging_system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/blogging_system
   JWT_SECRET=your-secret-key-change-this
   FASTIFY_PORT=5000
   FASTIFY_HOST=0.0.0.0
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201)**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "token": "jwt_token"
  },
  "success": true
}
```

#### Sign In
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "token": "jwt_token"
  },
  "success": true
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "success": true
}
```

### Blog Endpoints (Public)

#### Get All Published Blogs
```
GET /api/blogs?page=1&limit=20&search=react&sortBy=read_count&order=desc
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Blogs per page (default: 20, max: 100)
- `search` - Search by title, description, tags, or author name
- `sortBy` - Sort field: `createdAt`, `read_count`, `reading_time` (default: createdAt)
- `order` - Sort order: `asc` or `desc` (default: desc)

**Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "data": [
      {
        "_id": "blog_id",
        "title": "React Best Practices",
        "description": "Learn React patterns and best practices",
        "body": "...",
        "author": {
          "_id": "user_id",
          "email": "user@example.com",
          "first_name": "John",
          "last_name": "Doe"
        },
        "state": "published",
        "read_count": 245,
        "reading_time": 5,
        "tags": ["react", "javascript", "tutorial"],
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalBlogs": 100,
      "blogsPerPage": 20
    }
  },
  "success": true
}
```

#### Get Single Blog by ID
```
GET /api/blogs/:id
```

**Similar structure to Get All Published Blogs response, returns single blog object. Increments `read_count` by 1.**

### Blog Endpoints (Protected - Requires Authentication)

#### Create Blog
```
POST /api/blogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Blog Post",
  "description": "This is an interesting blog about web development",
  "body": "This is the main content of my blog post. It should have at least 50 characters and contain meaningful information about the topic.",
  "tags": ["web", "development", "tutorial"]
}
```

**Response (201)**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "blog_id",
    "title": "My First Blog Post",
    "description": "This is an interesting blog about web development",
    "body": "...",
    "author": {
      "_id": "user_id",
      "first_name": "John",
      "last_name": "Doe"
    },
    "state": "draft",
    "read_count": 0,
    "reading_time": 3,
    "tags": ["web", "development", "tutorial"],
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "success": true
}
```

#### Get My Blogs
```
GET /api/blogs/user/my-blogs?page=1&limit=20&state=draft
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Blogs per page (default: 20, max: 100)
- `state` - Filter by state: `draft` or `published` (optional)

**Response (200)** - Same format as "Get All Published Blogs"

#### Update Blog
```
PUT /api/blogs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "body": "Updated blog content...",
  "tags": ["updated", "tags"]
}
```

**Note:** Owner only. All fields are optional. Reading time is recalculated if body is updated.

**Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "blog_id",
    "title": "Updated Title",
    ...
  },
  "success": true
}
```

#### Delete Blog
```
DELETE /api/blogs/:id
Authorization: Bearer <token>
```

**Note:** Owner only. Works for both draft and published blogs.

**Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Blog deleted successfully"
  },
  "success": true
}
```

#### Update Blog State
```
PATCH /api/blogs/:id/state
Authorization: Bearer <token>
Content-Type: application/json

{
  "state": "published"
}
```

**Note:** Owner only. Changes blog state between `draft` and `published`.

**Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "blog_id",
    "state": "published",
    ...
  },
  "success": true
}
```

## Data Models

### User Model
```typescript
{
  _id: ObjectId,
  email: string (unique, required),
  password: string (hashed, required),
  first_name: string (required),
  last_name: string (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Model
```typescript
{
  _id: ObjectId,
  title: string (unique, required, 5-200 chars),
  description: string (required, 10-500 chars),
  body: string (required, min 50 chars),
  author: ObjectId (FK to User, required),
  state: enum ["draft", "published"] (default: "draft"),
  read_count: number (default: 0),
  reading_time: number (in minutes),
  tags: string[] (max 10 tags),
  createdAt: Date,
  updatedAt: Date
}
```

## Reading Time Calculation

Reading time is automatically calculated using:
- **Average Reading Speed**: 200 words per minute
- **Formula**: `Math.ceil(wordCount / 200)`
- **Minimum**: 1 minute

### Example
- 200 words = 1 minute
- 400 words = 2 minutes
- 250 words = 2 minutes (rounded up)

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "error": "Invalid email format",
  "success": false
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "error": "Not authenticated",
  "success": false
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "error": "You can only edit your own blogs",
  "success": false
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "error": "Blog not found",
  "success": false
}
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Test Coverage

**Unit Tests** - Password hashing, validation, reading time calculation

**Integration Tests** - API responses, authorization logic, CRUD operations, pagination, search, sorting

## Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── blogController.ts
│   │   └── baseController.ts
│   ├── models/
│   │   ├── user.ts
│   │   └── Blog.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── blogRoutes.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── readingTime.ts
│   ├── types/
│   │   └── index.ts
│   ├── config/
│   │   └── database.ts
│   ├── __tests__/
│   │   ├── unit.test.ts
│   │   └── integration.test.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode

## Security Best Practices

✅ **Implemented:**
- JWT tokens expire after 1 hour
- Passwords are hashed with bcryptjs (10 salt rounds)
- Unauthorized access is blocked at route level
- Owner-only operations are enforced
- CORS configured for frontend domain
- Input validation on all endpoints
- MongoDB injection protection via Mongoose

## API Rate Limiting Notes

Currently, no rate limiting is implemented. Consider adding `@fastify/rate-limit` for production use.

## Environment Variables

```
MONGODB_URI       - MongoDB connection string
JWT_SECRET        - Secret key for JWT signing
FASTIFY_PORT      - Server port (default: 5000)
FASTIFY_HOST      - Server host (default: 0.0.0.0)
```

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Setup for Production
- Use strong `JWT_SECRET`
- Set `NODE_ENV=production`
- Configure `MONGODB_URI` to production database
- Set proper CORS origins

## Common Issues & Solutions

### "Blog with this title already exists"
- Blog titles must be unique. Try a different title.

### "You can only edit your own blogs"
- Only the blog owner can edit or delete their blogs.

### "Unauthorized"
- Include a valid JWT token in the Authorization header: `Authorization: Bearer <token>`

### "Blog not found"
- Ensure the blog ID is correct and the blog is published (if not logged in).

## Contributing

1. Create a feature branch
2. Make changes following the MVC pattern
3. Add tests for new functionality
4. Submit a pull request

## License

See LICENSE file for details.
