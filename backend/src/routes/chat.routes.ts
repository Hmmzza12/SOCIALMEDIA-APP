import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;
        // Query to get conversations with the other participant's details
        // This is a bit complex in pure SQL
        const sql = `
            SELECT c.*, 
                   u.id as partner_id, u.username as partner_username, u.avatar_url as partner_avatar,
                   (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                   (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ? AND m.id NOT IN (SELECT message_id FROM message_reads WHERE user_id = ?)) as unread_count
            FROM conversations c
            JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
            JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
            JOIN users u ON cp2.user_id = u.id
            WHERE cp1.user_id = ? AND cp2.user_id != ?
            ORDER BY last_message_time DESC
        `;

        const [conversations] = await query(sql, [userId, userId, userId, userId]);
        res.json({ conversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Start or get existing conversation with a user
router.post('/conversations', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;
        const { partnerId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User ID missing from token' });
        }

        if (!partnerId) {
            return res.status(400).json({ error: 'Partner ID is required' });
        }

        // Check if conversation already exists
        const checkSql = `
            SELECT c.id 
            FROM conversations c
            JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
            JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
            WHERE cp1.user_id = ? AND cp2.user_id = ?
        `;
        const [existing] = await query(checkSql, [userId, partnerId]);

        if (Array.isArray(existing) && existing.length > 0) {
            return res.json({ conversationId: (existing[0] as any).id });
        }

        // Create new conversation
        const [result] = await query('INSERT INTO conversations (created_at) VALUES (CURRENT_TIMESTAMP)');
        const conversationId = (result as any).insertId;

        // Add participants
        await query('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)', [conversationId, userId]);
        await query('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)', [conversationId, partnerId]);

        res.status(201).json({ conversationId });
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authenticateToken, async (req: any, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.userId; // Check participation (security)

        // Verify participation
        const [participant] = await query(
            'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
            [conversationId, userId]
        );

        if (!Array.isArray(participant) || participant.length === 0) {
            return res.status(403).json({ error: 'Not authorized to view this conversation' });
        }

        // Fetch messages
        const [messages] = await query(
            `SELECT m.*, u.username as sender_username, u.avatar_url as sender_avatar
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE conversation_id = ?
             ORDER BY created_at ASC`,
            [conversationId]
        );

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Mark conversation messages as read
router.post('/conversations/:id/read', authenticateToken, async (req: any, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.userId;

        // Find all unread messages in this conversation sent by others
        const findUnreadSql = `
            SELECT id FROM messages 
            WHERE conversation_id = ? AND sender_id != ? 
            AND id NOT IN (SELECT message_id FROM message_reads WHERE user_id = ?)
        `;
        const [unreadMessages] = await query(findUnreadSql, [conversationId, userId, userId]);

        if (Array.isArray(unreadMessages) && unreadMessages.length > 0) {
            // Bulk insert into message_reads
            // SQLite doesn't support bulk insert nicely with separate params for multiple rows easily without dynamic query building
            // So we'll loop for simplicity or build a query. Loop is fine for small batches.
            for (const msg of unreadMessages as any[]) {
                await query('INSERT OR IGNORE INTO message_reads (message_id, user_id) VALUES (?, ?)', [msg.id, userId]);
            }
        }

        res.json({ success: true, readCount: Array.isArray(unreadMessages) ? unreadMessages.length : 0 });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

// Save a new message (usually called via socket, but fallback REST endpoint)
router.post('/messages', authenticateToken, async (req: any, res) => {
    try {
        const { conversationId, content } = req.body;
        const senderId = req.user.userId;

        const [result] = await query(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
            [conversationId, senderId, content]
        );

        const [newMessage] = await query('SELECT * FROM messages WHERE id = ?', [(result as any).insertId]);

        // Update conversation timestamp (optional but good for sorting)
        await query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);

        res.status(201).json({ message: Array.isArray(newMessage) ? newMessage[0] : newMessage });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
