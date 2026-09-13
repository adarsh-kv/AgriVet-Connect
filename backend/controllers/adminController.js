const db = require("../config/db");

// =========================================================
// GET ALL USERS
// =========================================================

const getAllUsers = async (req, res) => {
    try {

        const [users] = await db.query(`
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.role_id,
                r.role_name,
                u.status,
                u.created_at
            FROM users u
            JOIN roles r
                ON u.role_id = r.role_id
            ORDER BY u.user_id ASC
        `);

        res.status(200).json(users);

    } catch (error) {

        console.error("Get All Users Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// =========================================================
// GET SINGLE USER
// =========================================================

const getUserById = async (req, res) => {
    try {

        const { id } = req.params;

        const [users] = await db.query(`
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.role_id,
                r.role_name,
                u.status,
                u.created_at
            FROM users u
            JOIN roles r
                ON u.role_id = r.role_id
            WHERE u.user_id = ?
        `, [id]);

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(users[0]);

    } catch (error) {

        console.error("Get User Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// =========================================================
// UPDATE USER STATUS
// =========================================================

const updateUserStatus = async (req, res) => {
    try {

        console.log("=================================");
        console.log("UPDATE USER STATUS");
        console.log("USER:", req.user);
        console.log("PARAM ID:", req.params.id);
        console.log("BODY:", req.body);
        console.log("=================================");

        const { id } = req.params;
        const { status } = req.body;

        // -----------------------------------------
        // Validate status
        // -----------------------------------------

        if (!["ACTIVE", "INACTIVE"].includes(status)) {
            return res.status(400).json({
                message: "Status must be ACTIVE or INACTIVE"
            });
        }

        // -----------------------------------------
        // Prevent admin from changing own status
        // -----------------------------------------

        if (Number(id) === Number(req.user.user_id)) {
            return res.status(400).json({
                message: "You cannot change your own account status"
            });
        }

        // -----------------------------------------
        // Check target user
        // -----------------------------------------

        const [users] = await db.query(
            `
            SELECT
                user_id,
                full_name,
                status
            FROM users
            WHERE user_id = ?
            `,
            [id]
        );

        console.log("TARGET USER:", users);

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // -----------------------------------------
        // Update status
        // -----------------------------------------

        const [result] = await db.query(
            `
            UPDATE users
            SET status = ?
            WHERE user_id = ?
            `,
            [status, id]
        );

        console.log("UPDATE RESULT:", result);

        // -----------------------------------------
        // Verify database value
        // -----------------------------------------

        const [updatedUsers] = await db.query(
            `
            SELECT
                user_id,
                full_name,
                status
            FROM users
            WHERE user_id = ?
            `,
            [id]
        );

        console.log("UPDATED USER:", updatedUsers);

        // -----------------------------------------
        // Response
        // -----------------------------------------

        return res.status(200).json({
            message:
                `User ${status.toLowerCase()} successfully`,
            user: updatedUsers[0]
        });

    } catch (error) {

        console.error(
            "UPDATE USER STATUS ERROR:",
            error
        );

        return res.status(500).json({
            message: "Server Error"
        });
    }
};


// =========================================================
// GET VETERINARIAN VERIFICATIONS
// =========================================================

const getVeterinarianVerifications = async (req, res) => {
    try {
        const [verifications] = await db.query(`
            SELECT
                vv.verification_id,
                vv.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.status AS account_status,
                vv.certificate_name,
                vv.specialization,
                vv.certificate_number,
                vv.certificate_file,
                vv.verification_status,
                vv.submitted_at,
                vv.verified_at
            FROM veterinarian_verifications vv
            JOIN users u
                ON vv.user_id = u.user_id
            ORDER BY vv.submitted_at DESC
        `);

        res.status(200).json(verifications);

    } catch (error) {
        console.error("Get Veterinarian Verifications Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};


// =========================================================
// UPDATE VETERINARIAN VERIFICATION STATUS
// =========================================================

const updateVeterinarianVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Status must be APPROVED or REJECTED"
            });
        }

        // Check if verification record exists
        const [verifications] = await db.query(
            `SELECT verification_id, user_id, verification_status
             FROM veterinarian_verifications
             WHERE verification_id = ?`,
            [id]
        );

        if (verifications.length === 0) {
            return res.status(404).json({
                message: "Verification record not found"
            });
        }

        await db.query(
            `UPDATE veterinarian_verifications
             SET verification_status = ?,
                 verified_at = CURRENT_TIMESTAMP
             WHERE verification_id = ?`,
            [status, id]
        );

        const [updated] = await db.query(
            `SELECT
                vv.verification_id,
                vv.user_id,
                u.full_name,
                u.email,
                u.phone,
                vv.certificate_name,
                vv.specialization,
                vv.certificate_number,
                vv.certificate_file,
                vv.verification_status,
                vv.submitted_at,
                vv.verified_at
            FROM veterinarian_verifications vv
            JOIN users u
                ON vv.user_id = u.user_id
            WHERE vv.verification_id = ?`,
            [id]
        );

        return res.status(200).json({
            message: `Veterinarian application ${status.toLowerCase()} successfully`,
            verification: updated[0]
        });

    } catch (error) {
        console.error("Update Veterinarian Verification Error:", error);
        return res.status(500).json({
            message: "Server Error"
        });
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    updateUserStatus,
    getVeterinarianVerifications,
    updateVeterinarianVerificationStatus
};