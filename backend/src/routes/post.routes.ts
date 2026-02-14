import express, { Request, Response } from 'express';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all posts (feed) - newest first
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const [posts] = await db.query<RowDataPacket[]>(
            `SELECT 
        p.id, p.title, p.content, p.image_url, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COUNT(DISTINCT l.id) as like_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`
        );

        res.json({ posts });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single post with comments
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);
        // Get post with user info and like count
        const [posts] = await db.query<RowDataPacket[]>(
            `SELECT 
        p.id, p.title, p.content, p.image_url, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COUNT(DISTINCT l.id) as like_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.id = ?
      GROUP BY p.id, u.id`,
            [postId]
        );

        if (posts.length === 0) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        // Get comments for this post
        const [comments] = await db.query<RowDataPacket[]>(
            `SELECT 
        c.id, c.content, c.created_at,
        u.id as user_id, u.username, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC`,
            [postId]
        );

        res.json({
            post: posts[0],
            comments
        });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create post (protected)
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content, image_url } = req.body;

        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }

        if (title.length > 300) {
            res.status(400).json({ error: 'Title must be less than 300 characters' });
            return;
        }

        const [result] = await db.query(
            'INSERT INTO posts (user_id, title, content, image_url) VALUES (?, ?, ?, ?)',
            [req.user!.userId, title, content, image_url || null]
        );

        const postId = (result as any).insertId;

        res.status(201).json({
            message: 'Post created successfully',
            postId
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete post (protected - only own posts)
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);
        const [posts] = await db.query<RowDataPacket[]>(
            'SELECT user_id FROM posts WHERE id = ?',
            [postId]
        );

        if (posts.length === 0) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        if (posts[0].user_id !== req.user!.userId) {
            res.status(403).json({ error: 'Not authorized to delete this post' });
            return;
        }

        await db.query('DELETE FROM posts WHERE id = ?', [postId]);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Like post (protected)
router.post('/:id/like', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);

        // Check if already liked
        const [existing] = await db.query<RowDataPacket[]>(
            'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
            [postId, req.user!.userId]
        );

        if (existing.length > 0) {
            res.status(409).json({ error: 'Post already liked' });
            return;
        }

        await db.query(
            'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
            [postId, req.user!.userId]
        );

        res.status(201).json({ message: 'Post liked successfully' });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Unlike post (protected)
router.delete('/:id/like', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);
        await db.query(
            'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
            [postId, req.user!.userId]
        );

        res.json({ message: 'Post unliked successfully' });
    } catch (error) {
        console.error('Unlike post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get favorite posts (protected)
router.get('/favorites/all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const [posts] = await db.query<RowDataPacket[]>(
            `SELECT 
        p.id, p.title, p.content, p.image_url, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COUNT(DISTINCT l2.id) as like_count
      FROM likes l
      JOIN posts p ON l.post_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l2 ON p.id = l2.post_id
      WHERE l.user_id = ?
      GROUP BY p.id, u.id
      ORDER BY l.created_at DESC`,
            [req.user!.userId]
        );

        res.json({ posts });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
