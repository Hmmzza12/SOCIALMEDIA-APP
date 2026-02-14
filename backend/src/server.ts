import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Database from 'better-sqlite3';
import { testConnection } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';

// Load environment variables
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import chatRoutes from './routes/chat.routes';

// ... (existing imports)

const app = express();
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
});

// Socket.IO Middleware for Auth
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
        socket.data.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}, User ID: ${socket.data.user.id}`);

    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.data.user.id} joined conversation ${conversationId}`);
    });

    socket.on('send_message', (data) => {
        // Broadcast to room (excluding sender if needed, but usually we want to confirm)
        // Actually, we'll emit back to room so everyone gets it
        io.to(`conversation_${data.conversationId}`).emit('receive_message', data);
    });

    socket.on('typing_start', (conversationId) => {
        socket.to(`conversation_${conversationId}`).emit('user_typing', { userId: socket.data.user.id, conversationId });
    });

    socket.on('typing_stop', (conversationId) => {
        socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', { userId: socket.data.user.id, conversationId });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Make io accessible in routes if needed (e.g. for notifications)
app.set('io', io);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chat', chatRoutes);

// ... (health check, 404)

// Initialize database schema
const initializeDatabase = () => {
    try {
        const dbPath = resolve(__dirname, '../database.sqlite');
        const db = new Database(dbPath);
        const schemaPath = resolve(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        db.exec(schema);
        console.log('✅ Database schema initialized');
        db.close();
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
    }
};

// Start server
const startServer = async () => {
    // Initialize database schema
    initializeDatabase();

    // Test database connection
    const dbConnected = testConnection();

    if (!dbConnected) {
        console.error('Failed to connect to database. Please check your configuration.');
        process.exit(1);
    }

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`B Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💾 Database: SQLite`);
        console.log(`🔌 Socket.IO initialized`);
    });
};

startServer();
