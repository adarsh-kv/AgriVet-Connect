const db = require("../config/db");

const getAllUsers = async (req, res) => {
    try {

        // Only ADMIN can access
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        const [users] = await db.query(`
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.role_id,
                r.role_name,
                u.created_at
            FROM users u
            JOIN roles r
                ON u.role_id = r.role_id
            ORDER BY u.user_id ASC
        `);

        res.status(200).json(users);

    } catch (error) {

        console.error(
            "Get All Users Error:",
            error
        );

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    getAllUsers
};