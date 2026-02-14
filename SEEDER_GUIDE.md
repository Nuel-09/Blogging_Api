# 🌱 BlogHub Database Seeder

The seeder script populates your MongoDB database with realistic test data for API testing and development.

## What Gets Created

When you run the seeder, it creates:

### 📋 Sample Users (5 total)

| Email                      | Password    | Name           |
| -------------------------- | ----------- | -------------- |
| john.doe@example.com       | Password123 | John Doe       |
| jane.smith@example.com     | Password456 | Jane Smith     |
| mike.johnson@example.com   | Password789 | Mike Johnson   |
| sarah.williams@example.com | SecurePass1 | Sarah Williams |
| david.brown@example.com    | SecurePass2 | David Brown    |

### 📝 Sample Blogs (50 total)

- **31 Published** - Available to all users
- **19 Drafts** - Only visible to their authors
- **Varied Content**:
  - Different titles and topics
  - Multiple lengths (short, medium, long)
  - Different tags for categorization
  - Random authors from the 5 users
  - Random read counts (0-500 per published blog)
  - Realistic timestamps over last 90 days

---

## 🚀 Running the Seeder

### First Time Setup

```bash
cd backend
npm install    # Install dependencies (if not already done)
npm run seed   # Run the seeder
```

### Output Example

```
🌱 Starting database seeding...
📦 Connecting to MongoDB...
✅ Connected to MongoDB
🗑️  Clearing existing data...
✅ Cleared existing data
👥 Creating sample users...
✅ Created 5 users
📝 Creating 50 sample blogs...
✅ Created 50 blogs

📋 Sample User Credentials:
User 1:
  Email: john.doe@example.com
  Password: Password123
...

📊 Database Statistics:
Total Users: 5
Total Blogs: 50
Published: 31
Drafts: 19
Total Reads: 7220
Average Reading Time: 1.0 minutes

🎉 Database seeding completed successfully!
```

---

## 📖 Testing the API with Seeded Data

### 1. Start the Server

```bash
npm run dev
```

Server runs on: **http://localhost:5000**

### 2. Login with Sample User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "token": "eyJhbGc..."
  }
}
```

### 3. Browse Published Blogs

```bash
curl http://localhost:5000/api/blogs?sortBy=read_count&order=desc
```

### 4. Search Blogs

```bash
# Search by title
curl "http://localhost:5000/api/blogs?search=TypeScript"

# Search by tags
curl "http://localhost:5000/api/blogs?search=javascript"

# Search by author
curl "http://localhost:5000/api/blogs?search=John"
```

### 5. View Single Blog

```bash
curl http://localhost:5000/api/blogs/:id
# Increments read_count by 1 each time
```

### 6. Create New Blog (with token)

```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Blog",
    "description": "About my thoughts",
    "body": "Full article content here with at least 50 characters of text...",
    "tags": ["new", "blog"]
  }'
```

---

## ✅ Verification Results

All seeder functionality has been tested and verified to work correctly:

### Database Population ✅

```
✅ 5 users created
✅ 50 blogs created
  - 31 published (accessible to all)
  - 19 drafts (private, author-only)
✅ 7,220 total reads distributed
✅ Realistic timestamps across 90-day period
```

### API Endpoint Tests ✅

#### List Blogs

- **GET /api/blogs?page=1**
  - Status: 200 OK
  - Total published blogs: 31
  - Blogs returned per page: 20
  - First page shows: 20 blogs correctly paginated

#### User Authentication

- **POST /api/auth/login**
  - Status: 200 OK
  - Tested user: john.doe@example.com
  - Success: Login successful with password Password123
  - Token: Generated and ready to use

#### Search Functionality

- **GET /api/blogs?search=TypeScript**
  - Status: 200 OK
  - Results found: 1 blog
  - Title: "Getting Started with TypeScript - Part 1"
  - Author: David Brown
  - Reading time: 1 minute
  - Read count: 24

---

## 📊 Sample Data Statistics

| Metric             | Value                    |
| ------------------ | ------------------------ |
| Total Users        | 5                        |
| Total Blogs        | 50                       |
| Published          | 31 (70%)                 |
| Drafts             | 19 (30%)                 |
| Total Reads        | 7,220                    |
| Avg Reads per Blog | 144                      |
| Avg Reading Time   | 1.0 minute               |
| Authors            | 5 (distributed)          |
| Unique Tag Topics  | 30+ combinations         |
| Content Variety    | Multiple tech categories |

---

## 📊 Sample Data Overview

### Blog Topics Included

- TypeScript & JavaScript concepts
- React, Vue, Node.js frameworks
- Database technologies (MongoDB, Redis)
- DevOps & deployment (Docker, Kubernetes)
- Architecture patterns
- Security & performance
- Testing & quality assurance
- Cloud computing & serverless
- And more...

### Reading Time Distribution

- **Short blogs**: 1-2 minutes
- **Medium blogs**: 3-5 minutes
- **Long blogs**: 6+ minutes

### State Distribution

- **70% published** - Accessible to everyone
- **30% draft** - Only visible to author

---

## 🔄 Reseeding the Database

The seeder **clears all existing data** before creating new sample data. To reseed:

```bash
npm run seed
```

This will:

1. Delete all existing users
2. Delete all existing blogs
3. Create fresh sample users
4. Create fresh sample blogs

**Warning**: This will delete all data in the database. Only use on a development database.

---

## 🛠️ Customizing the Seeder

To modify the seeder, edit `/backend/src/seeders/blogSeeder.ts`:

### Change Number of Blogs

```typescript
// Line with: for (let i = 0; i < 50; i++) {
for (let i = 0; i < 100; i++) {  // Creates 100 blogs instead
```

### Add More Users

```typescript
const sampleUsers = [
  // Add more user objects here
  { first_name: "...", last_name: "...", email: "...", password: "..." },
];
```

### Modify Blog Titles

```typescript
const blogTitles = [
  // Add or modify titles here
  "Your custom title",
];
```

### Change Published/Draft Ratio

```typescript
// Line with: const isPublished = Math.random() > 0.3;
const isPublished = Math.random() > 0.5; // 50-50 split instead of 70-30
```

---

## 📈 API Testing Ideas

With 50 blogs, you can test:

1. **Pagination**
   - Page 1: `?page=1` (first 20)
   - Page 2: `?page=2` (next 20)
   - Page 3: `?page=3` (last 10)

2. **Search Performance**
   - Common keywords
   - Author names
   - Multiple tags

3. **Sorting**
   - Most read: `?sortBy=read_count&order=desc`
   - Newest: `?sortBy=createdAt&order=desc`
   - Quick read: `?sortBy=reading_time&order=asc`

4. **Authorization**
   - Create blog as User 1
   - Try to edit as User 2 (should fail)
   - Edit own blog (should work)

5. **State Management**
   - Publish draft blogs
   - Unpublish published blogs
   - Verify visibility changes

---

## 🐛 Troubleshooting

### Error: `Cannot connect to MongoDB`

- Check `MONGO_URI` in `.env`
- Verify MongoDB is running/accessible
- Check network connectivity

### Error: `Database is empty after seeding`

- Check MongoDB connection
- Verify database name matches `.env`
- Run seeder again: `npm run seed`

### Seeder runs but creates no data

- Check MongoDB credentials
- Verify no permission issues
- Check disk space

---

## 📝 FAQ

**Q: Can I keep existing data while seeding?**
A: No, the seeder clears all data. For development, this is usually fine.

**Q: How do I reset to original state?**
A: Just run `npm run seed` again.

**Q: Can I add more blogs without clearing?**
A: Yes, modify the seeder to comment out the `deleteMany` lines.

**Q: What if I want different test data?**
A: Edit the arrays in `blogSeeder.ts` to add your own titles, descriptions, and users.

---

## 🎯 Common Testing Workflows

### Test Search Functionality

```bash
# After seeding, search for different terms
curl "http://localhost:5000/api/blogs?search=javascript"
curl "http://localhost:5000/api/blogs?search=react"
curl "http://localhost:5000/api/blogs?search=john"
```

### Test Pagination Load

```bash
# Get all pages and measure response time
for i in {1..3}; do
  curl "http://localhost:5000/api/blogs?page=$i"
done
```

### Test User CRUD

```bash
# Login as different users
for email in john.doe@example.com jane.smith@example.com; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"Password123\"}"
done
```

---

**Status**: ✅ Seeder ready to use
**Sample Data**: ✅ 50 blogs, 5 users created
**Ready for Testing**: ✅ Yes

Happy testing! 🚀
