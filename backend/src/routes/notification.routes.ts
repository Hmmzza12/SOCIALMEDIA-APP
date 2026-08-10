import express, { Request, Response } from 'express';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get notifications for the current user (newest first)
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const [notifications] = await db.query<RowDataPacket[]>(
            `SELECT
        n.id, n.type, n.post_id, n.is_read, n.created_at,
        u.id as actor_id, u.username as actor_username, u.avatar_url as actor_avatar,
        p.title as post_title
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50`,
            [req.user!.userId]
        );

        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Unread count
router.get('/unread-count', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [req.user!.userId]
        );
        res.json({ count: rows[0].count });
    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark all as read
router.put('/read-all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [req.user!.userId]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
