const db = require("../config/db");
const { checkVaccinationDueNotifications } = require("../utils/notificationHelper");

// GET /api/notifications - Get current user's notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // If user is a farmer, check and create any vaccination due notifications
        if (req.user.role === "FARMER") {
            await checkVaccinationDueNotifications(userId);
        }

        const [rows] = await db.query(
            `SELECT
                notification_id,
                user_id,
                title,
                message,
                notification_type,
                related_id,
                related_type,
                is_read,
                created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET /api/notifications/unread-count - Get unread count for current user
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.user_id;

        if (req.user.role === "FARMER") {
            await checkVaccinationDueNotifications(userId);
        }

        const [rows] = await db.query(
            `SELECT COUNT(*) AS unread_count
             FROM notifications
             WHERE user_id = ? AND is_read = FALSE`,
            [userId]
        );

        res.status(200).json({
            unread_count: Number(rows[0]?.unread_count || 0)
        });
    } catch (error) {
        console.error("Get Unread Count Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// PUT /api/notifications/:id/read - Mark single notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        // Check if notification exists and belongs to user
        const [existing] = await db.query(
            "SELECT user_id FROM notifications WHERE notification_id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (existing[0].user_id !== userId) {
            return res.status(403).json({
                message: "You do not have permission to modify this notification"
            });
        }

        await db.query(
            "UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?",
            [id, userId]
        );

        res.status(200).json({
            message: "Notification marked as read",
            notification_id: Number(id)
        });
    } catch (error) {
        console.error("Mark Notification Read Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// PUT /api/notifications/read-all - Mark all notifications as read for current user
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [result] = await db.query(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
            [userId]
        );

        res.status(200).json({
            message: "All notifications marked as read",
            updated_count: result.affectedRows
        });
    } catch (error) {
        console.error("Mark All Read Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// DELETE /api/notifications/:id - Delete single notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        const [existing] = await db.query(
            "SELECT user_id FROM notifications WHERE notification_id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (existing[0].user_id !== userId) {
            return res.status(403).json({
                message: "You do not have permission to delete this notification"
            });
        }

        await db.query(
            "DELETE FROM notifications WHERE notification_id = ? AND user_id = ?",
            [id, userId]
        );

        res.status(200).json({
            message: "Notification deleted successfully",
            notification_id: Number(id)
        });
    } catch (error) {
        console.error("Delete Notification Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
