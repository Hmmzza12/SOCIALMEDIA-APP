# Social Media Web Application

A modern, Reddit-inspired full-stack social media application built with React, Node.js, Express, and MySQL.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with access and refresh tokens
- **User Profiles**: Customizable profiles with avatars and bios
- **Posts**: Create, view, and delete text posts with optional images
- **Interactions**: Like/unlike posts, comment on posts
- **Social Features**: Follow/unfollow users
- **Feed**: View all posts from newest to oldest
- **Favorites**: Save and view your liked posts
- **Responsive Design**: Mobile-friendly Reddit-inspired UI

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Context API for state management
- Pure CSS with custom design system

### Backend
- Node.js + Express + TypeScript
- MySQL database
- Raw SQL queries (no ORM)
- JWT authentication (access + refresh tokens)
- bcrypt for password hashing

## 📁 Project Structure

```
SOCIAL-MEDIA-APP/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts         # MySQL connection
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # Authentication
│   │   │   ├── user.routes.ts       # User management
│   │   │   ├── post.routes.ts       # Posts & likes
│   │   │   └── comment.routes.ts    # Comments
│   │   ├── utils/
│   │   │   └── jwt.ts               # Token utilities
│   │   ├── schema.sql               # Database schema
│   │   └── server.ts                # Express server
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── PostCard.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Profile.jsx
    │   │   ├── CreatePost.jsx
    │   │   └── Favorites.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    └── vite.config.js
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Database Setup

1. Install MySQL and start the MySQL server

2. Create a new database:
```sql
CREATE DATABASE social_media_db;
```

3. Import the schema from `backend/src/schema.sql`:
```bash
mysql -u root -p social_media_db < backend/src/schema.sql
```

### 2. Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - The `.env` file is already created with default values
   - Update database credentials if needed:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=social_media_db
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

1. Navigate to frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already set in `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Login**: Sign in to your account at `/login`
3. **Create Posts**: Click "Create Post" in the sidebar
4. **Interact**: Like posts, add comments, follow users
5. **Profile**: Update your avatar and bio in the profile page
6. **Favorites**: View all posts you've liked

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Tokens**: Separate access (15 min) and refresh (7 days) tokens
- **SQL Injection Prevention**: All queries use parameterized statements
- **CORS Configuration**: Backend only accepts requests from the frontend URL
- **Input Validation**: Server-side validation for all API endpoints

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

### Posts
- `GET /api/posts` - Get all posts (feed)
- `GET /api/posts/:id` - Get single post with comments
- `POST /api/posts` - Create post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)
- `POST /api/posts/:id/like` - Like post (auth required)
- `DELETE /api/posts/:id/like` - Unlike post (auth required)
- `GET /api/posts/favorites/all` - Get favorite posts (auth required)

### Comments
- `POST /api/comments/:postId/comments` - Add comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)

## 🎨 Design

The UI is inspired by Reddit with:
- Clean, card-based layout
- Reddit orange (#FF4500) as primary color
- Comfortable spacing and typography
- Hover states and smooth transitions
- Responsive design for mobile devices
- Professional color palette

## 🔄 Future Enhancements

- Real-time notifications
- Direct messaging
- Image upload (currently uses URLs)
- Search functionality
- Post categories/tags
- Infinite scroll pagination
- Dark mode
- Email verification

## 📝 License

MIT License - Feel free to use this project for learning purposes!

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

---

**Built with ❤️ using React, Express, and MySQL**
