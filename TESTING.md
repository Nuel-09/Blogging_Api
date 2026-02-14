# Testing Documentation - BlogHub

This document outlines all test cases for the BlogHub blogging platform.

## Test Overview

```
✅ Test Suites: 2 passed, 2 total
✅ Tests:       44 passed, 44 total
⏱️  Time:        ~3 seconds
```

## Test Structure

- **Unit Tests** (19 tests) - Validation, calculations, utilities
- **Integration Tests** (25 tests) - API endpoints, authorization, workflows

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

---

## Unit Tests (19 Total)

Location: `src/__tests__/unit.test.ts`

### Password & Security (3 tests)

- ✅ Password hashing with bcryptjs
- ✅ Password comparison with hash
- ✅ Wrong password fails verification

### Email Validation (2 tests)

- ✅ Valid email format accepted
- ✅ Invalid email format rejected

### User Field Validation (4 tests)

- ✅ First name 2-30 characters accepted
- ✅ Last name 2-30 characters accepted
- ✅ Names with special characters rejected
- ✅ Names with spaces at edges rejected

### Blog Field Validation (4 tests)

- ✅ Title validation (5-200 chars)
- ✅ Description validation (max 500)
- ✅ Tags array validation (max 10)
- ✅ Body text validation

### Reading Time Calculation (2 tests)

- ✅ Correct reading time calculation
- ✅ Minimum reading time enforced (1 min)

### JWT Utilities (4 tests)

- ✅ JWT token generation
- ✅ JWT token verification
- ✅ Expired token handling
- ✅ Invalid token rejection

---

## Integration Tests (25 Total)

Location: `src/__tests__/integration.test.ts`

### Authentication Endpoints (5 tests)

- ✅ Description between 10-500 characters passes
- ✅ Descriptions that are too short or too long fail
- ✅ Body must be at least 50 characters
- ✅ State must be 'draft' or 'published'
- ✅ Tags cannot exceed 10 items

### Reading Time Calculation Tests

- ✅ 200 words = 1 minute
- ✅ 400 words = 2 minutes
- ✅ 600 words = 3 minutes
- ✅ Very short text returns minimum 1 minute
- ✅ Fractional reading times are rounded up (e.g., 250 words = 2 minutes)
- ✅ Whitespace is handled correctly

## Integration Tests

### API Response Format

#### Success Response Tests

- ✅ Success response has `statusCode`, `data`, and `success` properties
- ✅ Response data contains user fields (first_name, last_name)
- ✅ Password never included in response
- ✅ Token included in authentication responses

#### Error Response Tests

- ✅ Error response has `statusCode`, `error`, and `success` properties
- ✅ Status codes are valid HTTP codes (400, 401, 403, 404, 500)

### Blog CRUD Operations

#### Create Blog Tests

- ✅ New blog has all required fields
- ✅ New blog starts in draft state
- ✅ New blog has read_count of 0

#### Read Blog Tests

- ✅ Published blogs can be accessed without authentication
- ✅ Draft blogs only accessible by owner
- ✅ Viewing blog increments read_count by 1

#### Update Blog Tests

- ✅ Blog can be updated by owner
- ✅ Update preserves author ID
- ✅ Can update title, description, body, and tags
- ✅ Reading time recalculated when body is updated
- ✅ Title must still be unique after update

#### Delete Blog Tests

- ✅ Blog can be deleted by owner
- ✅ Deleted blog removed from collection

#### State Management Tests

- ✅ Blog state can toggle between draft and published
- ✅ Owner can change blog state
- ✅ Non-owner cannot change blog state

### Authorization Logic

#### Blog Ownership Tests

- ✅ User cannot modify other user's blog
- ✅ User can modify own blog
- ✅ Draft blogs only viewable by owner
- ✅ Published blogs viewable by anyone

#### Permission Tests

- ✅ Unauthenticated users get 401 error when creating blog
- ✅ Unauthenticated users can view published blogs
- ✅ Owner cannot delete other user's blog

### Pagination Tests

#### Pagination Structure Tests

- ✅ Pagination has `currentPage`, `totalPages`, `totalBlogs`, `blogsPerPage`
- ✅ Default limit is 20 blogs per page
- ✅ Maximum limit is 100 blogs per page

#### Page Navigation Tests

- ✅ Page 1 returns first 20 blogs
- ✅ Page 2 returns blogs 20-39
- ✅ Correct number of pages calculated
- ✅ Out of range pages handled correctly

### Search Tests

#### Search by Title Tests

- ✅ Case-insensitive search finds matching titles
- ✅ Partial title matches work
- ✅ No results for non-matching search

#### Search by Description Tests

- ✅ Search finds blogs by description content
- ✅ Partial description text matches

#### Search by Tags Tests

- ✅ Search finds blogs by tag
- ✅ Multiple tags searchable

#### Search by Author Tests

- ✅ Search finds blogs by author first_name
- ✅ Search finds blogs by author last_name
- ✅ Multiple blogs by same author found

### Sorting Tests

#### Sort by read_count Tests

- ✅ Ascending sort: least read first
- ✅ Descending sort: most read first
- ✅ Ties handled correctly

#### Sort by reading_time Tests

- ✅ Ascending sort: shortest reading time first
- ✅ Descending sort: longest reading time first

#### Sort by createdAt Tests

- ✅ Ascending sort: oldest blogs first
- ✅ Descending sort: newest blogs first

### State Filtering Tests

#### Filter by State Tests

- ✅ Filter for 'draft' returns only draft blogs
- ✅ Filter for 'published' returns only published blogs
- ✅ No filter returns all user's blogs
- ✅ Published blogs endpoint only returns published blogs

### JWT & Authentication Tests

#### Token Tests

- ✅ Token included in login/signup response
- ✅ Invalid token returns 401
- ✅ Expired token returns 401
- ✅ Missing token returns 401

#### Bearer Format Tests

- ✅ Authorization header uses "Bearer " prefix
- ✅ Token extracted correctly from header
- ✅ Malformed header rejected

## Test Scenarios by Endpoint

### POST /api/auth/signup

| Scenario             | Request                      | Expected Response           |
| -------------------- | ---------------------------- | --------------------------- |
| Valid signup         | All required fields          | 201 + user data + token     |
| Missing email        | No email field               | 400 + error message         |
| Invalid email        | "notanemail"                 | 400 + error message         |
| Duplicate email      | Existing email               | 400 + "Email already exist" |
| Weak password        | "pass"                       | 400 + error message         |
| Password with spaces | "pass word"                  | 400 + error message         |
| Invalid first_name   | Too short/long/special chars | 400 + error message         |
| Invalid last_name    | Too short/long/special chars | 400 + error message         |

### POST /api/auth/signin

| Scenario           | Request                       | Expected Response                 |
| ------------------ | ----------------------------- | --------------------------------- |
| Valid login        | Correct email & password      | 200 + user data + token           |
| Non-existent email | Wrong email                   | 401 + "invalid email or password" |
| Wrong password     | Correct email, wrong password | 401 + "invalid email or password" |
| Missing email      | No email field                | 400 + error message               |
| Missing password   | No password field             | 400 + error message               |

### POST /api/blogs (Create Blog)

| Scenario              | Request                    | Expected Response                           |
| --------------------- | -------------------------- | ------------------------------------------- |
| Valid blog            | All required fields + auth | 201 + blog data (draft)                     |
| No authentication     | Valid data, no token       | 401 + "Unauthorized"                        |
| Duplicate title       | Title already exists       | 400 + "Blog with this title already exists" |
| Title too short       | Title < 5 chars            | 400 + error message                         |
| Title too long        | Title > 200 chars          | 400 + error message                         |
| Description too short | Description < 10 chars     | 400 + error message                         |
| Description too long  | Description > 500 chars    | 400 + error message                         |
| Body too short        | Body < 50 chars            | 400 + error message                         |
| Missing field         | Any required field missing | 400 + error message                         |
| Too many tags         | More than 10 tags          | 400 + error message                         |

### GET /api/blogs (Get Published Blogs)

| Scenario          | Request                      | Expected Response               |
| ----------------- | ---------------------------- | ------------------------------- |
| Get all published | No parameters                | 200 + paginated blogs           |
| With pagination   | ?page=2&limit=10             | 200 + page 2 results            |
| With search       | ?search=react                | 200 + filtered blogs            |
| With sort         | ?sortBy=read_count&order=asc | 200 + sorted blogs              |
| Combined filters  | All parameters               | 200 + filtered/sorted/paginated |
| Invalid page      | ?page=999                    | 200 + empty or last page        |
| Invalid limit     | ?limit=1000                  | 200 + capped at max (100)       |

### GET /api/blogs/:id (Get Single Blog)

| Scenario                | Request                      | Expected Response                   |
| ----------------------- | ---------------------------- | ----------------------------------- |
| Published blog          | Valid ID, blog is published  | 200 + blog + incremented read_count |
| Draft blog (owner)      | Valid ID, auth as owner      | 200 + blog + incremented read_count |
| Draft blog (other user) | Valid ID, auth as other user | 404 + "Blog not found"              |
| Non-existent ID         | Invalid/unknown ID           | 404 + "Blog not found"              |
| Invalid ObjectId        | Malformed ID                 | 400 + error message                 |

### PUT /api/blogs/:id (Update Blog)

| Scenario             | Request                         | Expected Response                        |
| -------------------- | ------------------------------- | ---------------------------------------- |
| Valid update (owner) | Valid data + auth as owner      | 200 + updated blog                       |
| As other user        | Valid data, auth as other user  | 403 + "You can only edit your own blogs" |
| No authentication    | Valid data, no token            | 401 + "Unauthorized"                     |
| Invalid title        | Title < 5 or > 200 chars        | 400 + error message                      |
| Duplicate title      | New title already exists        | 400 + error message                      |
| Invalid description  | Description < 10 or > 500 chars | 400 + error message                      |
| Invalid body         | Body < 50 chars                 | 400 + error message                      |
| Non-existent blog    | Invalid ID                      | 404 + "Blog not found"                   |

### DELETE /api/blogs/:id (Delete Blog)

| Scenario             | Request                      | Expected Response                          |
| -------------------- | ---------------------------- | ------------------------------------------ |
| Valid delete (owner) | Valid ID + auth as owner     | 200 + success message                      |
| As other user        | Valid ID, auth as other user | 403 + "You can only delete your own blogs" |
| No authentication    | Valid ID, no token           | 401 + "Unauthorized"                       |
| Non-existent blog    | Invalid ID                   | 404 + "Blog not found"                     |
| Invalid ObjectId     | Malformed ID                 | 400 + error message                        |

### PATCH /api/blogs/:id/state (Update Blog State)

| Scenario                   | Request                   | Expected Response                                   |
| -------------------------- | ------------------------- | --------------------------------------------------- |
| Draft to published (owner) | state: "published" + auth | 200 + blog with state=published                     |
| Published to draft (owner) | state: "draft" + auth     | 200 + blog with state=draft                         |
| As other user              | Valid state, other user   | 403 + "You can only change state of your own blogs" |
| No authentication          | Valid state, no token     | 401 + "Unauthorized"                                |
| Invalid state              | state: "archived"         | 400 + error message                                 |
| Missing state              | No state field            | 400 + error message                                 |
| Non-existent blog          | Invalid ID                | 404 + "Blog not found"                              |

### GET /api/blogs/user/my-blogs (Get User's Blogs)

| Scenario           | Request                 | Expected Response               |
| ------------------ | ----------------------- | ------------------------------- |
| Authenticated user | Valid token             | 200 + user's blogs (all states) |
| No authentication  | No token                | 401 + "Unauthorized"            |
| With state filter  | ?state=draft + auth     | 200 + user's draft blogs only   |
| With pagination    | ?page=2&limit=10 + auth | 200 + paginated results         |
| Combined filters   | state=published&page=2  | 200 + filtered and paginated    |

## Edge Cases

- Very long text (thousands of words) - Should handle reading time correctly
- Empty search/filter - Should return sensible defaults
- Concurrent updates - MongoDB handles atomicity
- Special characters in search - Should be escaped properly
- Unicode characters in names/titles - Should be handled correctly

## Performance Tests (Manual)

Should test with:

- 1,000+ blogs in database
- Complex searches with multiple filters
- Large pagination ranges
- Concurrent API requests

## Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: All endpoints covered
- Critical business logic: 100% coverage

## Continuous Integration

Tests should pass before:

- Feature branch merges
- Pull request approval
- Deploy to production

## Known Limitations

- No load/stress testing included
- No concurrent user testing
- No database backup/recovery tests
- No API versioning tests
