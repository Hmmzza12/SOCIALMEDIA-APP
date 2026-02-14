import express, { Request, Response } from 'express';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all users (for chat user selection)
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUserId = req.user!.userId;

        const [users] = await db.query<RowDataPacket[]>(
            'SELECT id, username, avatar_url, bio FROM users WHERE id != ? ORDER BY username',
            [currentUserId]
        );

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const [users] = await db.query<RowDataPacket[]>(
            'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = ?',
            [req.user!.userId]
        );

        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update current user profile
router.put('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const { avatar_url, bio } = req.body;

        await db.query(
            'UPDATE users SET avatar_url = ?, bio = ? WHERE id = ?',
            [avatar_url || null, bio || null, req.user!.userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id as string);
        const [users] = await db.query<RowDataPacket[]>(
            'SELECT id, username, avatar_url, bio, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Get follower/following counts
        const [followerCount] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM followers WHERE following_id = ?',
            [userId]
        );

        const [followingCount] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM followers WHERE follower_id = ?',
            [userId]
        );

        res.json({
            user: {
                ...users[0],
                followers: followerCount[0].count,
                following: followingCount[0].count
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Follow user
router.post('/:id/follow', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const followingId = parseInt(req.params.id as string);
        const followerId = req.user!.userId;

        if (followingId === followerId) {
            res.status(400).json({ error: 'Cannot follow yourself' });
            return;
        }

        // Check if already following
        const [existing] = await db.query<RowDataPacket[]>(
            'SELECT id FROM followers WHERE follower_id = ? AND following_id = ?',
            [followerId, followingId]
        );

        if (existing.length > 0) {
            res.status(409).json({ error: 'Already following this user' });
            return;
        }

        await db.query(
            'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
            [followerId, followingId]
        );

        res.status(201).json({ message: 'Successfully followed user' });
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Unfollow user
router.delete('/:id/follow', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const followingId = parseInt(req.params.id as string);
        const followerId = req.user!.userId;

        await db.query(
            'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
            [followerId, followingId]
        );

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
