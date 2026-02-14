# 📝 BlogHub - Full-Stack Blogging Platform

A production-ready blogging platform with full authentication, CRUD operations, advanced search, and server-rendered UI. Built with Fastify, MongoDB, TypeScript, and EJS.

**Status**: ✅ Complete | **Tests**: 44/44 passing | **TypeScript**: Zero errors

---

## 🎯 Features

✅ **Authentication** - Signup, login, logout with JWT tokens  
✅ **Blog Management** - Create, read, update, delete blogs  
✅ **State Management** - Draft/published blog states  
✅ **Search & Filter** - By title, description, tags, author name  
✅ **Sorting** - By date, reads, reading time  
✅ **Pagination** - 20 blogs per page (configurable)  
✅ **Reading Time** - Auto-calculated based on word count  
✅ **Read Tracking** - Auto-incremented on each view  
✅ **Type Safe** - 100% TypeScript with strict mode  
✅ **Tested** - 44 comprehensive tests included  
✅ **Server-Rendered** - EJS templates with responsive CSS  
✅ **Sample Data** - 50 blogs + 5 test users included

---

## 🛠️ Tech Stack

| Component     | Technology  | Version |
| ------------- | ----------- | ------- |
| **Runtime**   | Node.js     | 18+     |
| **Framework** | Fastify     | 5.x     |
| **Language**  | TypeScript  | 5.x     |
| **Database**  | MongoDB     | 6.x+    |
| **ODM**       | Mongoose    | 8.x     |
| **Auth**      | JWT         | Custom  |
| **Hashing**   | bcryptjs    | 2.4.x   |
| **Templates** | EJS         | 3.x     |
| **Testing**   | Jest        | 29.x    |
| **Styling**   | Vanilla CSS | -       |

---

## ⚡ Quick Start (60 seconds)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/blogging_system
FASTIFY_PORT=5000
FASTIFY_HOST=0.0.0.0
NODE_ENV=development
EOF

# 4. Seed database with 50 blogs
npm run seed

# 5. Start development server
npm run dev

# 6. Visit http://localhost:5000
```

**Test Login:**

```
Email: john.doe@example.com
Password: Password123
```

---

## 📦 Installation & Setup

### Prerequisites

```bash
node --version    # v18+
npm --version     # 8+
```

### Environment Setup

1. **Create `.env` file** in `backend/` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/blogging_system

# Server
FASTIFY_PORT=5000
FASTIFY_HOST=0.0.0.0
NODE_ENV=development
```

2. **Install dependencies**:

```bash
cd backend
npm install
```

3. **For MongoDB Atlas**:
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create cluster and database user
   - Copy connection string and add to `MONGO_URI`

---

## 🚀 Running the Application

### Development

```bash
npm run dev
```

- Hot reload enabled
- Runs on http://localhost:5000
- Logs all requests

### Production

```bash
npm run build     # Compile TypeScript
npm start         # Run compiled code
```

### Database Seeding

```bash
npm run seed
```

Creates:

- **5 test users** with predefined passwords
- **50 blog posts** with realistic metadata
- **31 published** blogs + **19 drafts**
- ~7,220 distributed reads
- Varied topics, tags, and authors

---

## 🧪 Testing

```bash
npm test                    # All 44 tests
npm run test:unit          # 19 unit tests
npm run test:integration   # 25 integration tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

**Results:**

```
✅ Test Suites: 2 passed
✅ Tests:       44 passed
✅ Time:        ~3 seconds
```

See [TESTING.md](TESTING.md) for detailed test documentation.

---

## 📡 API Endpoints

### Authentication (4 endpoints)

| Method | Endpoint            | Description    | Auth |
| ------ | ------------------- | -------------- | ---- |
| POST   | `/api/auth/signup`  | Create account | ❌   |
| POST   | `/api/auth/login`   | Get JWT token  | ❌   |
| POST   | `/api/auth/logout`  | Clear session  | ✅   |
| GET    | `/api/auth/profile` | Get user info  | ✅   |

### Blogs (8 endpoints)

| Method | Endpoint                   | Description                            | Auth |
| ------ | -------------------------- | -------------------------------------- | ---- |
| GET    | `/api/blogs`               | List published (paginated, searchable) | ❌   |
| GET    | `/api/blogs/:id`           | View blog (increments read_count)      | ❌   |
| POST   | `/api/blogs`               | Create new blog (draft state)          | ✅   |
| PUT    | `/api/blogs/:id`           | Update blog (owner-only)               | ✅   |
| DELETE | `/api/blogs/:id`           | Delete blog (owner-only)               | ✅   |
| PATCH  | `/api/blogs/:id/state`     | Toggle draft/published (owner-only)    | ✅   |
| GET    | `/api/blogs/user/my-blogs` | Get user's blogs (with state filter)   | ✅   |

### Web Views (7 pages)

| Route             | Page                          | Auth |
| ----------------- | ----------------------------- | ---- |
| `/`               | Home - browse published blogs | ❌   |
| `/login`          | Login form                    | ❌   |
| `/signup`         | Signup form                   | ❌   |
| `/dashboard`      | User blog dashboard           | ✅   |
| `/blogs/new`      | Create blog editor            | ✅   |
| `/blogs/:id`      | View blog article             | ❌   |
| `/blogs/:id/edit` | Edit blog (owner-only)        | ✅   |

---

## 🔍 API Examples

### List Blogs with Search

```bash
# Get first page
curl http://localhost:5000/api/blogs?page=1

# Search by title
curl "http://localhost:5000/api/blogs?search=TypeScript"

# Most read blogs
curl "http://localhost:5000/api/blogs?sortBy=read_count&order=desc"

# Quick reads (shortest reading time)
curl "http://localhost:5000/api/blogs?sortBy=reading_time&order=asc"

# Search by author
curl "http://localhost:5000/api/blogs?search=john"
```

### Authentication

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123"
  }'

# Response includes: token, user data
# Token stored in HTTP-only cookie automatically
```

### Create Blog (Protected)

```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog",
    "description": "An interesting article",
    "body": "Full blog content here with at least 50 characters...",
    "tags": ["javascript", "tutorial"]
  }'
```

---

## 📊 Database Schema

### User Model

```typescript
{
  _id: ObjectId,
  first_name: string,      // Required (2-30 chars)
  last_name: string,       // Required (2-30 chars)
  email: string,           // Unique, required
  password: string,        // Hashed with bcryptjs
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Model

```typescript
{
  _id: ObjectId,
  title: string,           // Unique, required (5-200 chars)
  description: string,     // Required (10-500 chars)
  body: string,            // Required (50+ chars)
  author: ObjectId,        // References User
  state: "draft" | "published",
  read_count: number,      // Auto-incremented on view
  reading_time: number,    // In minutes (calculated)
  tags: [string],          // Max 10 tags
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: title, author, state, tags, createdAt, read_count, reading_time

---

## 🔐 Authentication Flow

1. **Signup** → Password hashed with bcryptjs
2. **Login** → JWT token generated (1-hour expiration)
3. **Token Storage** → Stored in HTTP-only cookie
4. **API Requests** → Token sent in `Authorization: Bearer` header
5. **Protected Routes** → Validated via `ensureAuthenticated` middleware
6. **Logout** → Cookie cleared

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.ts              # Main Fastify app
│   ├── config/database.ts     # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── blogController.ts
│   │   └── baseController.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── blogRoutes.ts
│   │   └── viewRoutes.ts
│   ├── models/
│   │   ├── user.ts
│   │   └── Blog.ts
│   ├── middleware/auth.ts
│   ├── types/fastify.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── readingTime.ts
│   ├── seeders/blogSeeder.ts   # Database seeder
│   └── __tests__/              # 44 tests
│       ├── unit.test.ts
│       └── integration.test.ts
├── views/                      # 10 EJS templates
│   ├── index.ejs
│   ├── login.ejs
│   ├── signup.ejs
│   ├── blog.ejs
│   ├── dashboard.ejs
│   ├── create-blog.ejs
│   ├── edit-blog.ejs
│   ├── error.ejs
│   ├── layout.ejs
│   └── footer.ejs
├── public/css/style.css        # Responsive styling
├── dist/                       # Compiled JavaScript
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## 🧠 How It Works

### Request Flow

```
Browser Request
    ↓
Fastify Router
    ↓
Middleware (CORS, Cookies, etc.)
    ↓
Route Handler
    ↓
Auth Middleware (if protected)
    ↓
Controller (business logic)
    ↓
Mongoose Model (database)
    ↓
MongoDB
    ↓
Response (JSON API or EJS view)
```

### Reading Time Calculation

```
Word Count ÷ 200 words/minute = Reading Time
Minimum: 1 minute
Rounded up: Math.ceil()

Examples:
- 200 words  → 1 minute
- 400 words  → 2 minutes
- 600 words  → 3 minutes
```

---

## 🎯 Common Tasks

### Search for Blogs

```bash
# All parameter combinations work together
curl "http://localhost:5000/api/blogs?search=react&sortBy=read_count&page=2&order=desc"
```

### Get User's Blogs

```bash
curl http://localhost:5000/api/blogs/user/my-blogs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by state
curl "http://localhost:5000/api/blogs/user/my-blogs?state=draft" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Blog State

```bash
curl -X PATCH http://localhost:5000/api/blogs/:id/state \
  -H "Authorization: Bearer YOUR_TOKEN"

# Toggles between draft ↔ published
```

---

## 🔧 Available Commands

```bash
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Run production build
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run seed             # Populate with sample data
```

---

## 📚 Documentation

- **[TESTING.md](TESTING.md)** - Test cases and coverage
- **[SEEDER_GUIDE.md](SEEDER_GUIDE.md)** - Database seeding and sample data

---

## 🔒 Security

✅ **Implemented**:

- Password hashing (bcryptjs)
- JWT authentication
- HTTP-only cookies
- CORS protection
- Input validation
- Owner-only operations
- Type-safe code

⚠️ **For Production**:

- Use HTTPS/SSL
- Set secure environment variables
- Enable rate limiting
- Add request logging
- Configure CORS origins
- Add security headers

---

## 🐛 Troubleshooting

### Port 5000 Already in Use

```bash
Get-Process -Name node | Stop-Process -Force  # Windows
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9  # Mac/Linux
```

### MongoDB Connection Failed

- Check `MONGO_URI` in `.env`
- Verify credentials
- Check network access in MongoDB Atlas
- Ensure IP is whitelisted

### Tests Failing

```bash
npm test -- --clearCache
npm test -- --verbose
```

### TypeScript Errors

```bash
npm run build
```

---

## 📈 Performance

- **Database Indexes**: Optimized for common queries
- **Pagination**: Efficient skip/limit
- **Response Time**: ~100-500ms average
- **Caching**: Reading time pre-calculated
- **Scalability**: Handles 50+ blogs easily

---

## 📄 License

MIT License - See LICENSE file

---

## 🎉 Getting Started

1. Install dependencies: `npm install`
2. Create `.env` file with MongoDB URI
3. Seed database: `npm run seed`
4. Start server: `npm run dev`
5. Visit: http://localhost:5000

**That's it!** 🚀

---

## 📁 Project Structure

```
todo-app/
├── src/
│   ├── server.ts                 # Main server entry point
│   ├── config/
│   │   └── database.ts           # MongoDB connection setup
│   ├── middleware/
│   │   └── auth.ts               # Authentication middleware
│   ├── models/                   # Database schemas
│   │   ├── User.ts               # User schema
│   │   └── Todo.ts               # Todo schema
│   ├── controllers/              # Business logic
│   │   ├── authController.ts     # Auth operations
│   │   └── todoController.ts     # Todo operations
│   ├── routes/                   # API routes
│   │   ├── authRoutes.ts         # Auth endpoints
│   │   └── todoRoutes.ts         # Todo endpoints
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── public/
│   └── css/                      # Shared styles
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🔗 API Endpoints

### Authentication

```
POST   /api/auth/signup      - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/auth/profile     - Get current user
```

### Todos (Protected)

```
GET    /api/todos            - Get all user todos (with filters)
POST   /api/todos            - Create new todo
GET    /api/todos/:id        - Get specific todo
PUT    /api/todos/:id        - Update todo
DELETE /api/todos/:id        - Delete todo
PATCH  /api/todos/:id        - Update status
```

---

## 🧪 Development Commands

```bash
# Development mode with hot reload
npm run dev

# Build project
npm run build

# Start production server
npm start

# Run tests (coming soon)
npm test
```

---

## 📦 Dependencies

### Runtime

- `fastify` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables

### Plugins

- `@fastify/cors` - Cross-Origin Resource Sharing
- `@fastify/cookie` - Cookie handling
- `@fastify/session` - Session management
- `@fastify/static` - Static file serving
- `connect-mongo` - MongoDB session store

---

## 🔐 Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Secure cookies (httpOnly, sameSite)
- MongoDB Atlas encryption
- CORS protection
- Input validation (to be implemented)

---

## 📝 Notes

- Passwords are hashed and never stored in plain text
- Sessions are stored in MongoDB and expire after 7 days
- All API endpoints require authentication (except signup/login)
- Frontend is being built separately with React

---

## 🤝 Contributing

This is a learning project. Feel free to fork and improve!

---

## 📄 License

ISC

```bash
git clone https://github.com/Nuel-09/An-Auction-system.git
cd An-Auction-system

npm install
```

### 2. Environment Setup

```bash
# Copy example env
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Variables:**

```env
MONGO_URI=mongodb://localhost:27017/fotherbys
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key
```

### 3. Database Seeding

```bash
# Seed with test data (23 items, 5 auctions, 8 sellers)
npm run seed

# Verify data integrity
npx ts-node verify-fields.ts
npx ts-node check-lot-numbers.ts
```

### 4. Development Server

```bash
npm run dev
```

Server: **http://localhost:3000**

---

## 📁 Project Structure

```
src/
├── server.ts                 # Fastify app initialization
├── config/
│   └── database.ts          # MongoDB connection
├── middleware/
│   └── auth.ts              # Authentication & authorization
├── models/                  # Mongoose schemas
│   ├── Admin.ts             # Admin users
│   ├── Auction.ts           # Auction events
│   ├── Items.ts             # Lot items
│   └── SellersLead.ts       # Seller submissions
├── types/
│   └── index.ts             # TypeScript interfaces
├── controllers/             # Business logic (7 controllers)
│   ├── baseController.ts    # Shared utilities
│   ├── adminController.ts   # Admin operations
│   ├── auctionController.ts # Auction management
│   ├── itemController.ts    # Item/lot management
│   ├── sellerLeadController.ts  # Seller leads
│   ├── publicController.ts  # Public auction views
│   └── publicSellerController.ts # Seller dashboard
├── routes/                  # API endpoint definitions (6 route files)
│   ├── adminAuthRoutes.ts
│   ├── auctionRoutes.ts
│   ├── itemsRoutes.ts
│   ├── sellerLeadRoutes.ts
│   ├── publicRoutes.ts
│   └── publicSellerRoutes.ts
└── views/                   # EJS templates (19 templates)
    ├── admin/              # Admin dashboard pages
    └── public/             # Public-facing pages
```

For detailed architecture guide, see **[CODEBASE_STRUCTURE.md](CODEBASE_STRUCTURE.md)**

---

## 🔐 Authentication

### Admin Access

**Default Admin Account:**

```
Email: admin@fotherbys.com
Password: Admin@123
```

**Session Management:**

- Session-based authentication
- Protected routes via `ensureAuthenticated` middleware
- CSRF protection recommended for production

### Seller Access

Sellers access via email-based login (no password):

- Submit items for auction
- Track submission status
- View assigned lot numbers

---

## 📚 API Documentation

### Admin Endpoints

```typescript
// Authentication
POST   /admin/login
POST   /admin/logout
GET    /admin/dashboard

// Auctions
GET    /api/auctions                    // List all
POST   /api/auctions                    // Create
GET    /api/auctions/:id               // Get single
PUT    /api/auctions/:id               // Update
POST   /api/auctions/:id/publish       // Publish
POST   /api/auctions/:id/close         // Close
POST   /api/auctions/:id/items/bulk-assign  // Bulk assign items

// Items
GET    /api/items                      // List all
POST   /api/items                      // Create
GET    /api/items/:id                 // Get single
PUT    /api/items/:id                 // Update
DELETE /api/items/:id                 // Delete
GET    /api/items/search              // Search

// Seller Leads
GET    /api/leads                      // List all
POST   /api/leads                      // Create
PATCH  /api/leads/:id                 // Update status
GET    /api/leads/:leadId/items      // Get lead items
```

### Public Endpoints

```typescript
GET    /                               // Home page
GET    /catalogue                      // Browse auctions
GET    /item/:itemId                  // View item
GET    /seller/login                  // Seller login
POST   /api/public/submit-items       // Submit items
```

For complete endpoint reference, see **[CODEBASE_STRUCTURE.md#routes](CODEBASE_STRUCTURE.md#routes)**

---

## 🎯 Key Features

### ✅ Sprint 1 Features

- **Professional Lot Fields**: Artist, period, dimensions, condition, session time
- **Bulk Item Assignment**: Assign multiple items to auction simultaneously
- **Auto-Item Linking**: Items automatically linked to leads when verified
- **Advanced Filtering**: Date range filters with timezone support
- **Deleted Item Cleanup**: Automatic removal of orphaned items
- **QR-Code Access**: Secure auction access via QR codes
- **Responsive Design**: Mobile-friendly admin & public interfaces
- **Type Safety**: 100% TypeScript with strict mode

### 🐛 Recent Fixes (January 15, 2026)

| Issue                          | Status   | Fix                             |
| ------------------------------ | -------- | ------------------------------- |
| Bulk assign limited to 1 item  | ✅ Fixed | Proper ID trimming & validation |
| Load items not auto-extracting | ✅ Fixed | Auto-link on lead lock          |
| Date filter timezone issues    | ✅ Fixed | UTC conversion on all filters   |
| Deleted item 404 errors        | ✅ Fixed | Auto-cleanup on home page       |

---

## 🧪 Testing

### Manual Testing

```bash
# Admin login test
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fotherbys.com","password":"Admin@123"}'

# Create auction
curl -X POST http://localhost:3000/api/auctions \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Winter Auction",
    "description":"Fine art & antiques",
    "startDate":"2026-02-01T10:00:00Z",
    "endDate":"2026-02-15T17:00:00Z"
  }'
```

### Test Data

Seed data includes:

- **8 Seller Leads** (various statuses: draft, submitted, locked)
- **23 Items** (across 8 categories)
- **5 Auctions** (mix of draft, published, closed)
- **Realistic values** (estimates, dimensions, conditions)

---

## 📊 Database Schema

### Items Collection

```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  estimateMin: Number,
  estimateMax: Number,

  // Professional fields
  artist?: String,
  periodDate?: String,
  dimensions?: String,
  condition?: String,
  auctionSession?: "morning" | "afternoon" | "evening",

  // Auction fields
  lotRefNumber: String (unique),
  lotNumber?: Number,
  auctionId?: ObjectId,
  sellerLeadId?: ObjectId,

  // Status
  status: "draft" | "published",
  auctionType: "online" | "physical",

  createdAt: Date,
  updatedAt: Date
}
```

See **[LOT_NUMBER_LOGIC.md](LOT_NUMBER_LOGIC.md)** for lot numbering details.

---

## 🔄 Request Flow

```
HTTP Request
    ↓
routes/*.ts (endpoint matching + middleware)
    ↓
middleware/auth.ts (if authenticated endpoint)
    ↓
controllers/*.ts (business logic)
    ↓
models/*.ts (MongoDB queries)
    ↓
MongoDB (CRUD operations)
    ↓
Response (JSON or EJS view)
```

Detailed flow examples in **[CODEBASE_STRUCTURE.md#trace-code](CODEBASE_STRUCTURE.md#trace-code)**

---

## 🚀 Development Workflow

### Adding a New Endpoint

1. **Define Type** → `src/types/index.ts`
2. **Update Route** → `src/routes/yourRoutes.ts`
3. **Add Controller** → `src/controllers/yourController.ts`
4. **Update Model** → `src/models/YourModel.ts` (if needed)
5. **Test Endpoint** → Use curl or Postman
6. **Add View** → `src/views/admin/yourPage.ejs` (if needed)

### Running in Development

```bash
# Watch mode with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

---

## 📝 Configuration

### Environment Variables

```bash
# Database
MONGO_URI=mongodb://localhost:27017/fotherbys

# Server
PORT=3000
NODE_ENV=development

# Security
SESSION_SECRET=dev-secret-key-change-in-production

# Admin
ADMIN_EMAIL=admin@fotherbys.com
ADMIN_PASSWORD=Admin@123
```

---

## 🐛 Debugging

### Enable Debug Logs

```bash
# See detailed logs
DEBUG=* npm run dev

# MongoDB debug
DEBUG=mongoose:* npm run dev
```

### Common Issues

| Issue                    | Solution                                           |
| ------------------------ | -------------------------------------------------- |
| MongoDB connection error | Check `MONGO_URI` in .env                          |
| Port already in use      | Change `PORT` in .env or kill process on port 3000 |
| Session errors           | Regenerate `SESSION_SECRET`                        |
| TypeScript errors        | Run `npm run type-check`                           |

---

## 📖 Additional Documentation

- **[CODEBASE_STRUCTURE.md](CODEBASE_STRUCTURE.md)** - Complete architecture & navigation guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Feature implementation details
- **[SPRINT_1_COMPLETION.md](SPRINT_1_COMPLETION.md)** - Sprint 1 completion status
- **[LOT_NUMBER_LOGIC.md](LOT_NUMBER_LOGIC.md)** - Lot numbering system
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing procedures
- **[FEATURE_CHECKLIST.md](FEATURE_CHECKLIST.md)** - All implemented features

---

## 📦 Scripts

```bash
npm run dev           # Start dev server with hot reload
npm run build         # Build for production
npm run seed          # Seed database with test data
npm run type-check    # Check TypeScript errors

# Utility scripts
npx ts-node verify-fields.ts      # Verify data integrity
npx ts-node check-lot-numbers.ts  # Check lot numbering
```

---

## 🔐 Security Considerations

### Current (Development)

- Session-based auth
- Basic password hashing (bcryptjs)
- No CORS headers configured

### Recommended for Production

- HTTPS/SSL certificates
- CORS configuration
- Rate limiting
- CSRF protection
- Input validation & sanitization
- Security headers (helmet)
- Environment variable validation

---

## 🤝 Contributing

### Code Standards

- TypeScript with strict mode enabled
- Functional components preferred
- Error handling required on all endpoints
- Type safety enforced throughout

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches

---

## 📊 Performance Notes

- **Database Indexes**: Configured on `lotRefNumber`, `email`, `status`
- **Query Optimization**: Lean queries used where applicable
- **Response Time**: Average endpoint response <100ms
- **Concurrent Users**: Tested with up to 50 simultaneous connections

---

## 🆘 Support & Issues

For issues or questions:

1. Check **[CODEBASE_STRUCTURE.md](CODEBASE_STRUCTURE.md)** for architecture help
2. Review **[TESTING_GUIDE.md](TESTING_GUIDE.md)** for testing issues

---

## 📄 License

Proprietary - Confidential

---

## 👥 Contributors

- **Primary Developer**: Nuel-09
- **Last Updated**: January 18, 2026
- **Status**: ✅ Sprint 1 Complete - Production Ready

---

## 📞 Quick Reference

**Start Development:**

```bash
npm install && npm run seed && npm run dev
```

**Admin Access:** `http://localhost:3000/admin/login`  
**Public Site:** `http://localhost:3000/`  
**API Base:** `http://localhost:3000/api/`

**Test Seller Email:** Check seed output after running `npm run seed`
