const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticateToken = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Invalid token format."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Check current user status in database
        const [users] = await db.query(
            `
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.status,
                r.role_name
            FROM users u
            JOIN roles r
                ON u.role_id = r.role_id
            WHERE u.user_id = ?
            `,
            [decoded.user_id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        const user = users[0];

        // Block inactive users immediately
        if (user.status === "INACTIVE") {
            return res.status(403).json({
                message:
                    "Your account has been deactivated. Please contact the administrator."
            });
        }

        // Check verification for veterinarians
        if (user.role_name === "VETERINARIAN") {
            const [verifications] = await db.query(
                `SELECT verification_status FROM veterinarian_verifications WHERE user_id = ?`,
                [user.user_id]
            );

            if (verifications.length === 0 || verifications[0].verification_status !== "APPROVED") {
                return res.status(403).json({
                    message: "Your veterinarian account is not approved. Access denied."
                });
            }
        }

        // Attach current database user to request
        req.user = {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role_name,
            status: user.status
        };

        next();

    } catch (error) {

        console.error("Authentication Error:", error);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticateToken;