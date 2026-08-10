import express, { Request, Response } from 'express';
import db from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get community info + member count (optionally personalized)
router.get('/:name', optionalAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.params;
        const uid = req.user ? req.user.userId : null;

        const [countRows] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) as member_count FROM community_members WHERE community_name = ?',
            [name]
        );

        let isMember = false;
        if (uid) {
            const [rows] = await db.query<RowDataPacket[]>(
                'SELECT 1 FROM community_members WHERE user_id = ? AND community_name = ?',
                [uid, name]
            );
            isMember = rows.length > 0;
        }

        res.json({
            community_name: name,
            member_count: countRows[0].member_count,
            is_member: isMember
        });
    } catch (error) {
        console.error('Get community error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Join a community (protected)
router.post('/:name/join', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.params;
        const uid = req.user!.userId;

        const [existing] = await db.query<RowDataPacket[]>(
            'SELECT 1 FROM community_members WHERE user_id = ? AND community_name = ?',
            [uid, name]
        );

        if (existing.length > 0) {
            res.status(409).json({ error: 'Already a member' });
            return;
        }

        await db.query(
            'INSERT INTO community_members (user_id, community_name) VALUES (?, ?)',
            [uid, name]
        );

        const [countRows] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) as member_count FROM community_members WHERE community_name = ?',
            [name]
        );

        res.status(201).json({ message: 'Joined community', member_count: countRows[0].member_count });
    } catch (error) {
        console.error('Join community error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Leave a community (protected)
router.delete('/:name/join', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.params;
        const uid = req.user!.userId;

        await db.query(
            'DELETE FROM community_members WHERE user_id = ? AND community_name = ?',
            [uid, name]
        );

        const [countRows] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) as member_count FROM community_members WHERE community_name = ?',
            [name]
        );

        res.json({ message: 'Left community', member_count: countRows[0].member_count });
    } catch (error) {
        console.error('Leave community error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
