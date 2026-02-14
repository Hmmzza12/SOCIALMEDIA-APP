import express, { Request, Response } from 'express';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Create comment (protected)
router.post('/:postId/comments', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const { content } = req.body;
        const postId = parseInt(req.params.postId as string);

        if (!content) {
            res.status(400).json({ error: 'Comment content is required' });
            return;
        }

        // Check if post exists
        const [posts] = await db.query<RowDataPacket[]>(
            'SELECT id FROM posts WHERE id = ?',
            [postId]
        );

        if (posts.length === 0) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        const [result] = await db.query(
            'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
            [postId, req.user!.userId, content]
        );

        const commentId = (result as any).insertId;

        res.status(201).json({
            message: 'Comment created successfully',
            commentId
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete comment (protected - only own comments)
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const commentId = parseInt(req.params.id as string);
        const [comments] = await db.query<RowDataPacket[]>(
            'SELECT user_id FROM comments WHERE id = ?',
            [commentId]
        );

        if (comments.length === 0) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        if (comments[0].user_id !== req.user!.userId) {
            res.status(403).json({ error: 'Not authorized to delete this comment' });
            return;
        }

        await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
