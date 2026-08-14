const db = require("../config/db");

// Get all veterinarians
const getVeterinarians = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone
             FROM users u
             JOIN roles r
                ON u.role_id = r.role_id
             WHERE r.role_name = 'VETERINARIAN'`
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get Veterinarians Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// Farmer sends veterinarian request
const createVeterinarianRequest = async (req, res) => {
    try {
        // Only farmers can send requests
        if (req.user.role !== "FARMER") {
            return res.status(403).json({
                message: "Only farmers can send veterinarian requests"
            });
        }

        const {
            veterinarian_id,
            livestock_id,
            reason
        } = req.body;

        if (!veterinarian_id || !livestock_id) {
            return res.status(400).json({
                message: "Veterinarian and livestock are required"
            });
        }

        // Verify that the livestock belongs to this farmer
        const [livestock] = await db.query(
            `SELECT livestock_id
             FROM livestock
             WHERE livestock_id = ?
             AND owner_id = ?`,
            [livestock_id, req.user.user_id]
        );

        if (livestock.length === 0) {
            return res.status(403).json({
                message: "You can only request a veterinarian for your own livestock"
            });
        }

        // Verify selected user is actually a veterinarian
        const [veterinarian] = await db.query(
            `SELECT u.user_id
             FROM users u
             JOIN roles r
                ON u.role_id = r.role_id
             WHERE u.user_id = ?
             AND r.role_name = 'VETERINARIAN'`,
            [veterinarian_id]
        );

        if (veterinarian.length === 0) {
            return res.status(400).json({
                message: "Invalid veterinarian"
            });
        }

        // Check for an existing pending request
        const [existingRequest] = await db.query(
            `SELECT request_id
             FROM veterinarian_requests
             WHERE farmer_id = ?
             AND veterinarian_id = ?
             AND livestock_id = ?
             AND status = 'PENDING'`,
            [
                req.user.user_id,
                veterinarian_id,
                livestock_id
            ]
        );

        if (existingRequest.length > 0) {
            return res.status(409).json({
                message: "A pending request already exists"
            });
        }

        const [result] = await db.query(
            `INSERT INTO veterinarian_requests
            (
                farmer_id,
                veterinarian_id,
                livestock_id,
                reason
            )
            VALUES (?, ?, ?, ?)`,
            [
                req.user.user_id,
                veterinarian_id,
                livestock_id,
                reason || null
            ]
        );

        res.status(201).json({
            message: "Veterinarian request sent successfully",
            request_id: result.insertId
        });

    } catch (error) {
        console.error("Create Veterinarian Request Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// Get requests
const getVeterinarianRequests = async (req, res) => {
    try {
        let rows;

        if (req.user.role === "FARMER") {

            [rows] = await db.query(
                `SELECT
                    vr.*,
                    v.full_name AS veterinarian_name,
                    l.animal_name,
                    l.tag_number
                 FROM veterinarian_requests vr
                 JOIN users v
                    ON vr.veterinarian_id = v.user_id
                 JOIN livestock l
                    ON vr.livestock_id = l.livestock_id
                 WHERE vr.farmer_id = ?
                 ORDER BY vr.requested_at DESC`,
                [req.user.user_id]
            );

        } else if (req.user.role === "VETERINARIAN") {

            [rows] = await db.query(
                `SELECT
                    vr.*,
                    f.full_name AS farmer_name,
                    l.animal_name,
                    l.tag_number
                 FROM veterinarian_requests vr
                 JOIN users f
                    ON vr.farmer_id = f.user_id
                 JOIN livestock l
                    ON vr.livestock_id = l.livestock_id
                 WHERE vr.veterinarian_id = ?
                 ORDER BY vr.requested_at DESC`,
                [req.user.user_id]
            );

        } else if (req.user.role === "ADMIN") {

            [rows] = await db.query(
                `SELECT
                    vr.*,
                    f.full_name AS farmer_name,
                    v.full_name AS veterinarian_name,
                    l.animal_name,
                    l.tag_number
                 FROM veterinarian_requests vr
                 JOIN users f
                    ON vr.farmer_id = f.user_id
                 JOIN users v
                    ON vr.veterinarian_id = v.user_id
                 JOIN livestock l
                    ON vr.livestock_id = l.livestock_id
                 ORDER BY vr.requested_at DESC`
            );

        } else {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get Veterinarian Requests Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// Veterinarian accepts/rejects request
const updateVeterinarianRequest = async (req, res) => {
    try {
        if (req.user.role !== "VETERINARIAN") {
            return res.status(403).json({
                message: "Only veterinarians can respond to requests"
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Status must be ACCEPTED or REJECTED"
            });
        }

        const [result] = await db.query(
            `UPDATE veterinarian_requests
             SET status = ?,
                 responded_at = CURRENT_TIMESTAMP
             WHERE request_id = ?
             AND veterinarian_id = ?
             AND status = 'PENDING'`,
            [
                status,
                id,
                req.user.user_id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Request not found or already processed"
            });
        }

        res.status(200).json({
            message: `Veterinarian request ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error("Update Veterinarian Request Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


module.exports = {
    getVeterinarians,
    createVeterinarianRequest,
    getVeterinarianRequests,
    updateVeterinarianRequest
};