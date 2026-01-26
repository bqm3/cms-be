# CMS Backend

Node.js + Express + MySQL API for CMS.

## Setup
1. `cd be`
2. `npm install`
3. Update `.env` with your database credentials (default: root/1234567890/cms).
4. `node initAdmin.js` to create the default admin user.

## Running
- Development: `npm run dev`
- Production: `npm start`

## API Endpoints

### Auth
- `POST /api/auth/register` - Create a new user (default role: user)
- `POST /api/auth/login` - Login and get JWT token

### Public Posts
- `GET /api/posts/public` - Get all approved posts.
  - Query params: `sort=view_count:DESC` or `sort=sequence_number:ASC`
- `GET /api/posts/public/:id` - Get post detail (increments view count)

### Protected Posts (Requires Auth header: `Authorization: Bearer <token>`)
- `POST /api/posts/` - Create a post (FormData: `title`, `post_title`, `content`, `sequence_number`, `category_name`, `topic_name`, `logo` [file])
- `PUT /api/posts/:id` - Update a post (User can update own, Admin can update any)

### Admin Only (Requires Admin role)
- `GET /api/posts/admin` - Get all posts with filtering/sorting.
  - Query params: `search=...`, `category=...`, `topic=...`, `sort=view_count:DESC`
- `PATCH /api/posts/:id/approve` - Approve a post
- `DELETE /api/posts/:id` - Delete a post

## Tracking Fields
Each post contains:
- `created_at`: Creation time
- `updated_at`: Modification time
- `created_by`: ID of the user who created it
- `updated_by`: ID of the user who last modified it
