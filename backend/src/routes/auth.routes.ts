import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../config/database';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from '../utils/jwt';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        // Check if user already exists
        const [existingUsers] = await db.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            res.status(409).json({ error: 'Username or email already exists' });
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );

        const userId = (result as any).insertId;

        // Generate tokens
        const accessToken = generateAccessToken({ userId, username });
        const refreshToken = generateRefreshToken({ userId, username });

        res.status(201).json({
            message: 'User created successfully',
            accessToken,
            refreshToken,
            user: { id: userId, username, email }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user
        const [users] = await db.query<RowDataPacket[]>(
            'SELECT id, username, email, password_hash FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            username: user.username
        });
        const refreshToken = generateRefreshToken({
            userId: user.id,
            username: user.username
        });

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Generate new access token
        const newAccessToken = generateAccessToken({
            userId: payload.userId,
            username: payload.username
        });

        res.json({
            accessToken: newAccessToken
        });
    } catch (error) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

export default router;
