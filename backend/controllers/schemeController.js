const db = require("../config/db");

// Get All Schemes
// Admins see all schemes; Farmers see only ACTIVE schemes
const getAllSchemes = async (req, res) => {
    try {
        let rows;

        if (req.user.role === "ADMIN") {
            [rows] = await db.query(
                `SELECT s.*, u.full_name AS creator_name
                 FROM schemes s
                 LEFT JOIN users u ON s.created_by = u.user_id
                 ORDER BY s.created_at DESC`
            );
        } else {
            [rows] = await db.query(
                `SELECT s.*, u.full_name AS creator_name
                 FROM schemes s
                 LEFT JOIN users u ON s.created_by = u.user_id
                 WHERE s.status = 'ACTIVE'
                 ORDER BY s.created_at DESC`
            );
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error("Get All Schemes Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Single Scheme by ID
const getSchemeById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `SELECT s.*, u.full_name AS creator_name
             FROM schemes s
             LEFT JOIN users u ON s.created_by = u.user_id
             WHERE s.scheme_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Scheme not found" });
        }

        const scheme = rows[0];

        // Non-admin can only view if active
        if (req.user.role !== "ADMIN" && scheme.status !== "ACTIVE") {
            return res.status(404).json({ message: "Scheme not found or inactive" });
        }

        res.status(200).json(scheme);
    } catch (error) {
        console.error("Get Scheme By ID Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Create Scheme (ADMIN only)
const createScheme = async (req, res) => {
    try {
        const {
            scheme_name,
            scheme_code,
            category,
            description,
            eligibility,
            benefits,
            department,
            application_deadline,
            status
        } = req.body;

        if (
            !scheme_name ||
            !scheme_code ||
            !category ||
            !description ||
            !eligibility ||
            !benefits ||
            !department
        ) {
            return res.status(400).json({
                message: "Scheme Name, Code, Category, Description, Eligibility, Benefits, and Department are required"
            });
        }

        // Check duplicate scheme_code
        const [existing] = await db.query(
            "SELECT scheme_id FROM schemes WHERE scheme_code = ?",
            [String(scheme_code).trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "A scheme with this code already exists"
            });
        }

        const cleanStatus = status === "CLOSED" ? "CLOSED" : "ACTIVE";

        const [result] = await db.query(
            `INSERT INTO schemes
             (scheme_name, scheme_code, category, description, eligibility, benefits, department, application_deadline, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                String(scheme_name).trim(),
                String(scheme_code).trim().toUpperCase(),
                String(category).trim(),
                String(description).trim(),
                String(eligibility).trim(),
                String(benefits).trim(),
                String(department).trim(),
                application_deadline || null,
                cleanStatus,
                req.user.user_id
            ]
        );

        res.status(201).json({
            message: "Scheme created successfully",
            scheme_id: result.insertId
        });
    } catch (error) {
        console.error("Create Scheme Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update Scheme (ADMIN only)
const updateScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            scheme_name,
            scheme_code,
            category,
            description,
            eligibility,
            benefits,
            department,
            application_deadline,
            status
        } = req.body;

        if (
            !scheme_name ||
            !scheme_code ||
            !category ||
            !description ||
            !eligibility ||
            !benefits ||
            !department
        ) {
            return res.status(400).json({
                message: "Scheme Name, Code, Category, Description, Eligibility, Benefits, and Department are required"
            });
        }

        // Check duplicate code on another scheme
        const [existing] = await db.query(
            "SELECT scheme_id FROM schemes WHERE scheme_code = ? AND scheme_id != ?",
            [String(scheme_code).trim(), id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Another scheme already uses this scheme code"
            });
        }

        const cleanStatus = status === "CLOSED" ? "CLOSED" : "ACTIVE";

        const [result] = await db.query(
            `UPDATE schemes
             SET scheme_name = ?,
                 scheme_code = ?,
                 category = ?,
                 description = ?,
                 eligibility = ?,
                 benefits = ?,
                 department = ?,
                 application_deadline = ?,
                 status = ?
             WHERE scheme_id = ?`,
            [
                String(scheme_name).trim(),
                String(scheme_code).trim().toUpperCase(),
                String(category).trim(),
                String(description).trim(),
                String(eligibility).trim(),
                String(benefits).trim(),
                String(department).trim(),
                application_deadline || null,
                cleanStatus,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Scheme not found" });
        }

        res.status(200).json({
            message: "Scheme updated successfully"
        });
    } catch (error) {
        console.error("Update Scheme Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Scheme (ADMIN only)
const deleteScheme = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM schemes WHERE scheme_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Scheme not found" });
        }

        res.status(200).json({
            message: "Scheme deleted successfully"
        });
    } catch (error) {
        console.error("Delete Scheme Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Apply for a Scheme (FARMER only)
const applyForScheme = async (req, res) => {
    try {
        const { id } = req.params; // scheme_id
        const farmer_id = req.user.user_id;
        const { livestock_id, applicant_notes } = req.body;

        // Verify scheme exists and is ACTIVE
        const [schemes] = await db.query(
            "SELECT scheme_id, status FROM schemes WHERE scheme_id = ?",
            [id]
        );

        if (schemes.length === 0 || schemes[0].status !== "ACTIVE") {
            return res.status(400).json({
                message: "This scheme is not active or does not exist"
            });
        }

        // If livestock_id is supplied, verify ownership
        if (livestock_id) {
            const [livestock] = await db.query(
                "SELECT livestock_id FROM livestock WHERE livestock_id = ? AND owner_id = ?",
                [livestock_id, farmer_id]
            );

            if (livestock.length === 0) {
                return res.status(403).json({
                    message: "You can only link your own livestock to this application"
                });
            }
        }

        // Check if farmer already has a PENDING application for this scheme
        const [pending] = await db.query(
            `SELECT application_id FROM scheme_applications
             WHERE scheme_id = ? AND farmer_id = ? AND status = 'PENDING'`,
            [id, farmer_id]
        );

        if (pending.length > 0) {
            return res.status(409).json({
                message: "You already have a pending application for this scheme"
            });
        }

        const [result] = await db.query(
            `INSERT INTO scheme_applications
             (scheme_id, farmer_id, livestock_id, applicant_notes, status)
             VALUES (?, ?, ?, ?, 'PENDING')`,
            [
                id,
                farmer_id,
                livestock_id || null,
                applicant_notes ? String(applicant_notes).trim() : null
            ]
        );

        res.status(201).json({
            message: "Scheme application submitted successfully",
            application_id: result.insertId
        });
    } catch (error) {
        console.error("Apply For Scheme Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Farmer's Own Applications (FARMER only)
const getFarmerApplications = async (req, res) => {
    try {
        const farmer_id = req.user.user_id;

        const [rows] = await db.query(
            `SELECT
                sa.application_id,
                sa.scheme_id,
                sa.farmer_id,
                sa.livestock_id,
                sa.applicant_notes,
                sa.status,
                sa.admin_remarks,
                sa.applied_at,
                sa.reviewed_at,
                s.scheme_name,
                s.scheme_code,
                s.category,
                s.department,
                s.benefits,
                l.animal_name,
                l.tag_number,
                l.species
             FROM scheme_applications sa
             JOIN schemes s ON sa.scheme_id = s.scheme_id
             LEFT JOIN livestock l ON sa.livestock_id = l.livestock_id
             WHERE sa.farmer_id = ?
             ORDER BY sa.applied_at DESC`,
            [farmer_id]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Get Farmer Applications Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get All Applications (ADMIN only)
const getAllApplications = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                sa.application_id,
                sa.scheme_id,
                sa.farmer_id,
                sa.livestock_id,
                sa.applicant_notes,
                sa.status,
                sa.admin_remarks,
                sa.applied_at,
                sa.reviewed_at,
                s.scheme_name,
                s.scheme_code,
                s.category,
                s.department,
                u.full_name AS farmer_name,
                u.email AS farmer_email,
                u.phone AS farmer_phone,
                l.animal_name,
                l.tag_number,
                l.species
             FROM scheme_applications sa
             JOIN schemes s ON sa.scheme_id = s.scheme_id
             JOIN users u ON sa.farmer_id = u.user_id
             LEFT JOIN livestock l ON sa.livestock_id = l.livestock_id
             ORDER BY sa.applied_at DESC`
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Get All Applications Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update Application Status (ADMIN only)
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_remarks } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Status must be either APPROVED or REJECTED"
            });
        }

        const [result] = await db.query(
            `UPDATE scheme_applications
             SET status = ?,
                 admin_remarks = ?,
                 reviewed_at = CURRENT_TIMESTAMP
             WHERE application_id = ?`,
            [
                status,
                admin_remarks ? String(admin_remarks).trim() : null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: `Application ${status.toLowerCase()} successfully`
        });
    } catch (error) {
        console.error("Update Application Status Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getAllSchemes,
    getSchemeById,
    createScheme,
    updateScheme,
    deleteScheme,
    applyForScheme,
    getFarmerApplications,
    getAllApplications,
    updateApplicationStatus
};
