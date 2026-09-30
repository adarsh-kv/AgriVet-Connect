const db = require("../config/db");

/**
 * Insert a single notification for a user
 */
const createNotification = async ({
    user_id,
    title,
    message,
    notification_type,
    related_id = null,
    related_type = null
}) => {
    if (!user_id || !title || !message || !notification_type) {
        console.warn("createNotification called with missing required fields");
        return null;
    }

    try {
        const [result] = await db.query(
            `INSERT INTO notifications
             (user_id, title, message, notification_type, related_id, related_type, is_read)
             VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
            [
                user_id,
                String(title).trim(),
                String(message).trim(),
                String(notification_type).trim(),
                related_id ? Number(related_id) : null,
                related_type ? String(related_type).trim() : null
            ]
        );

        return result.insertId;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

/**
 * Dispatch notification to all ACTIVE admin users
 */
const notifyAdmins = async ({
    title,
    message,
    notification_type,
    related_id = null,
    related_type = null
}) => {
    try {
        const [admins] = await db.query(
            `SELECT u.user_id
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE r.role_name = 'ADMIN' AND u.status = 'ACTIVE'`
        );

        if (!admins || admins.length === 0) {
            return 0;
        }

        const promises = admins.map((admin) =>
            createNotification({
                user_id: admin.user_id,
                title,
                message,
                notification_type,
                related_id,
                related_type
            })
        );

        await Promise.all(promises);
        return admins.length;
    } catch (error) {
        console.error("Error notifying admins:", error);
        return 0;
    }
};

/**
 * Dispatch notification to a specific user
 */
const notifyUser = async (params) => {
    return await createNotification(params);
};

/**
 * Check upcoming or overdue vaccinations for a farmer's livestock
 * and generate notifications without creating duplicate notifications on refresh.
 */
const checkVaccinationDueNotifications = async (farmerId) => {
    if (!farmerId) return 0;

    try {
        // Query vaccinations where next_due_date is approaching (within 7 days) or already passed
        const [dueVaccinations] = await db.query(
            `SELECT
                v.vaccination_id,
                v.vaccine_name,
                v.next_due_date,
                l.animal_name,
                l.tag_number,
                DATEDIFF(v.next_due_date, CURDATE()) AS days_until_due
             FROM vaccinations v
             JOIN livestock l ON v.livestock_id = l.livestock_id
             WHERE l.owner_id = ?
               AND v.next_due_date IS NOT NULL
               AND v.next_due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
             ORDER BY v.next_due_date ASC`,
            [farmerId]
        );

        if (!dueVaccinations || dueVaccinations.length === 0) {
            return 0;
        }

        let createdCount = 0;

        for (const vac of dueVaccinations) {
            // Check if an unread notification exists OR a notification was already created in the last 7 days
            const [existing] = await db.query(
                `SELECT notification_id
                 FROM notifications
                 WHERE user_id = ?
                   AND related_id = ?
                   AND related_type = 'VACCINATION'
                   AND (is_read = FALSE OR created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))
                 LIMIT 1`,
                [farmerId, vac.vaccination_id]
            );

            // Skip if notification already exists
            if (existing && existing.length > 0) {
                continue;
            }

            const formattedDate = vac.next_due_date
                ? new Date(vac.next_due_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                  })
                : "soon";

            const animalIdentifier = vac.animal_name
                ? `${vac.animal_name} (${vac.tag_number})`
                : `animal (Tag: ${vac.tag_number})`;

            const isOverdue = vac.days_until_due < 0;
            const title = isOverdue
                ? `Vaccination Overdue: ${vac.vaccine_name}`
                : `Vaccination Due: ${vac.vaccine_name}`;

            const message = isOverdue
                ? `Vaccination "${vac.vaccine_name}" for ${animalIdentifier} was due on ${formattedDate} and is currently overdue.`
                : `Vaccination "${vac.vaccine_name}" for ${animalIdentifier} is due on ${formattedDate}.`;

            const notifId = await createNotification({
                user_id: farmerId,
                title,
                message,
                notification_type: "VACCINATION_DUE",
                related_id: vac.vaccination_id,
                related_type: "VACCINATION"
            });

            if (notifId) {
                createdCount++;
            }
        }

        return createdCount;
    } catch (error) {
        console.error("Error checking vaccination due notifications:", error);
        return 0;
    }
};

module.exports = {
    createNotification,
    notifyAdmins,
    notifyUser,
    checkVaccinationDueNotifications
};
