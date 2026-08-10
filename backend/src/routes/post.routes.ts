import express, { Request, Response } from 'express';
import db from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all posts (feed) - newest first
router.get('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const communityName = req.query.community as string;
        const uid = req.user ? req.user.userId : null;

        let query = `SELECT
        p.id, p.title, p.content, p.image_url, p.community_name, p.community_icon, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COUNT(DISTINCT l.id) as like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
        EXISTS(SELECT 1 FROM likes lk WHERE lk.post_id = p.id AND lk.user_id = ?) as liked,
        EXISTS(SELECT 1 FROM bookmarks bm WHERE bm.post_id = p.id AND bm.user_id = ?) as bookmarked,
        EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_name = p.community_name AND cm.user_id = ?) as is_member
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id`;

        const params: any[] = [uid, uid, uid];

        if (communityName) {
            query += ` WHERE p.community_name = ?`;
            params.push(communityName);
        }

        query += ` GROUP BY p.id, u.id ORDER BY p.created_at DESC`;

        const [posts] = await db.query<RowDataPacket[]>(query, params);

        res.json({ posts });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Following feed - only posts from users the current user follows
router.get('/feed/following', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const uid = req.user!.userId;
        const [posts] = await db.query<RowDataPacket[]>(
            `SELECT
        p.id, p.title, p.content, p.image_url, p.community_name, p.community_icon, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COUNT(DISTINCT l.id) as like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
        EXISTS(SELECT 1 FROM likes lk WHERE lk.post_id = p.id AND lk.user_id = ?) as liked,
        EXISTS(SELECT 1 FROM bookmarks bm WHERE bm.post_id = p.id AND bm.user_id = ?) as bookmarked,
        EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_name = p.community_name AND cm.user_id = ?) as is_member
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.user_id IN (SELECT following_id FROM followers WHERE follower_id = ?)
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`,
            [uid, uid, uid, uid]
        );
        res.json({ posts });
    } catch (error) {
        console.error('Get following feed error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single post with comments
router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);
        const uid = req.user ? req.user.userId : null;
        // Get post with user info and like count
        const [posts] = await db.query<RowDataPacket[]>(
            `SELECT
        p.id, p.title, p.content, p.image_url, p.community_name, p.community_icon, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COUNT(DISTINCT l.id) as like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
        EXISTS(SELECT 1 FROM likes lk WHERE lk.post_id = p.id AND lk.user_id = ?) as liked,
        EXISTS(SELECT 1 FROM bookmarks bm WHERE bm.post_id = p.id AND bm.user_id = ?) as bookmarked,
        EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_name = p.community_name AND cm.user_id = ?) as is_member
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.id = ?
      GROUP BY p.id, u.id`,
            [uid, uid, uid, postId]
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
        const { title, content, image_url, community_name, community_icon } = req.body;

        if (!title || !title.trim()) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }

        // A post needs a body OR an image
        if ((!content || !content.trim()) && !image_url) {
            res.status(400).json({ error: 'Add some text or an image' });
            return;
        }

        if (title.length > 300) {
            res.status(400).json({ error: 'Title must be less than 300 characters' });
            return;
        }

        const [result] = await db.query(
            'INSERT INTO posts (user_id, title, content, image_url, community_name, community_icon) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user!.userId, title, content || '', image_url || null, community_name || null, community_icon || null]
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

        // Notify the post owner (skip self-likes)
        const [owners] = await db.query<RowDataPacket[]>(
            'SELECT user_id FROM posts WHERE id = ?',
            [postId]
        );
        if (owners.length > 0 && owners[0].user_id !== req.user!.userId) {
            await db.query(
                'INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, ?, ?)',
                [owners[0].user_id, req.user!.userId, 'like', postId]
            );
        }

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

// Bookmark a post (protected)
router.post('/:id/bookmark', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);

        const [existing] = await db.query<RowDataPacket[]>(
            'SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?',
            [postId, req.user!.userId]
        );

        if (existing.length > 0) {
            res.status(409).json({ error: 'Post already bookmarked' });
            return;
        }

        await db.query(
            'INSERT INTO bookmarks (post_id, user_id) VALUES (?, ?)',
            [postId, req.user!.userId]
        );

        res.status(201).json({ message: 'Post bookmarked successfully' });
    } catch (error) {
        console.error('Bookmark post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove a bookmark (protected)
router.delete('/:id/bookmark', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);
        await db.query(
            'DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?',
            [postId, req.user!.userId]
        );

        res.json({ message: 'Bookmark removed successfully' });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get bookmarked (saved) posts (protected)
router.get('/bookmarks/all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const uid = req.user!.userId;
        const [posts] = await db.query<RowDataPacket[]>(
            `SELECT
        p.id, p.title, p.content, p.image_url, p.community_name, p.community_icon, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COUNT(DISTINCT l.id) as like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
        EXISTS(SELECT 1 FROM likes lk WHERE lk.post_id = p.id AND lk.user_id = ?) as liked,
        1 as bookmarked
      FROM bookmarks b
      JOIN posts p ON b.post_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE b.user_id = ?
      GROUP BY p.id, u.id
      ORDER BY b.created_at DESC`,
            [uid, uid]
        );

        res.json({ posts });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ----- Emoji Reactions -----
const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '😮'];

// Summary of reactions for a post: [{ emoji, count, reacted }]
const getReactionSummary = async (postId: number, uid: number | null) => {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT emoji, COUNT(*) as count,
        MAX(CASE WHEN user_id = ? THEN 1 ELSE 0 END) as reacted
     FROM reactions
     WHERE post_id = ?
     GROUP BY emoji
     ORDER BY count DESC, emoji ASC`,
        [uid ?? -1, postId]
    );
    return rows;
};

// Get reactions for a post (optionally personalized)
router.get('/:id/reactions', optionalAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);
        const uid = req.user ? req.user.userId : null;
        const reactions = await getReactionSummary(postId, uid);
        res.json({ reactions });
    } catch (error) {
        console.error('Get reactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Toggle a reaction (protected)
router.post('/:id/react', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id as string);
        const { emoji } = req.body;
        const uid = req.user!.userId;

        if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
            res.status(400).json({ error: 'Invalid emoji' });
            return;
        }

        const [existing] = await db.query<RowDataPacket[]>(
            'SELECT id FROM reactions WHERE post_id = ? AND user_id = ? AND emoji = ?',
            [postId, uid, emoji]
        );

        if (existing.length > 0) {
            await db.query('DELETE FROM reactions WHERE post_id = ? AND user_id = ? AND emoji = ?', [postId, uid, emoji]);
        } else {
            await db.query('INSERT INTO reactions (post_id, user_id, emoji) VALUES (?, ?, ?)', [postId, uid, emoji]);
        }

        const reactions = await getReactionSummary(postId, uid);
        res.json({ reactions });
    } catch (error) {
        console.error('React error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
