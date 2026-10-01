const db = require("../config/db");
const { notifyAdmins, notifyUser } = require("../utils/notificationHelper");

// Apply for Livestock Insurance (FARMER only)
const applyInsurance = async (req, res) => {
    try {
        const farmer_id = req.user.user_id;
        const {
            livestock_id,
            insurance_provider,
            policy_name,
            coverage_amount,
            premium_amount,
            subsidy_amount,
            start_date,
            end_date,
            identification_mark
        } = req.body;

        // Required field validation
        if (
            !livestock_id ||
            !insurance_provider ||
            !policy_name ||
            coverage_amount === undefined ||
            coverage_amount === null ||
            premium_amount === undefined ||
            premium_amount === null
        ) {
            return res.status(400).json({
                message: "Livestock, Insurance Provider, Policy Name, Coverage Amount, and Premium Amount are required"
            });
        }

        // Validate positive amounts
        const numCoverage = parseFloat(coverage_amount);
        const numPremium = parseFloat(premium_amount);
        const numSubsidy = subsidy_amount !== undefined && subsidy_amount !== null ? parseFloat(subsidy_amount) : 0.00;

        if (isNaN(numCoverage) || numCoverage <= 0) {
            return res.status(400).json({
                message: "Coverage amount must be a positive number greater than zero"
            });
        }

        if (isNaN(numPremium) || numPremium <= 0) {
            return res.status(400).json({
                message: "Premium amount must be a positive number greater than zero"
            });
        }

        if (isNaN(numSubsidy) || numSubsidy < 0) {
            return res.status(400).json({
                message: "Subsidy amount cannot be negative"
            });
        }

        // Verify livestock ownership using existing livestock.owner_id
        const [livestock] = await db.query(
            `SELECT livestock_id, tag_number
             FROM livestock
             WHERE livestock_id = ? AND owner_id = ?`,
            [livestock_id, farmer_id]
        );

        if (livestock.length === 0) {
            return res.status(403).json({
                message: "You can only apply for insurance for your own livestock"
            });
        }

        // Prevent duplicate PENDING or ACTIVE insurance applications for the same livestock
        const [existing] = await db.query(
            `SELECT policy_id, status
             FROM insurance_policies
             WHERE livestock_id = ? AND status IN ('PENDING', 'ACTIVE')`,
            [livestock_id]
        );

        if (existing.length > 0) {
            const existingStatus = existing[0].status;
            return res.status(409).json({
                message: `This livestock already has an ${existingStatus.toLowerCase()} insurance policy`
            });
        }

        // Insert insurance application with status = 'PENDING'
        const [result] = await db.query(
            `INSERT INTO insurance_policies
             (livestock_id, farmer_id, insurance_provider, policy_name, coverage_amount, premium_amount, subsidy_amount, start_date, end_date, identification_mark, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [
                livestock_id,
                farmer_id,
                String(insurance_provider).trim(),
                String(policy_name).trim(),
                numCoverage,
                numPremium,
                numSubsidy,
                start_date || null,
                end_date || null,
                identification_mark ? String(identification_mark).trim() : null
            ]
        );

        // Fetch farmer name for notification
        const [farmerUser] = await db.query(
            "SELECT full_name FROM users WHERE user_id = ?",
            [farmer_id]
        );
        const farmerName = farmerUser.length > 0 ? farmerUser[0].full_name : "A farmer";

        // Notify active Admins
        await notifyAdmins({
            title: "New Insurance Application",
            message: `${farmerName} submitted an application for "${String(policy_name).trim()}" with ${String(insurance_provider).trim()}.`,
            notification_type: "INSURANCE_APPLICATION",
            related_id: result.insertId,
            related_type: "INSURANCE_POLICY"
        });

        res.status(201).json({
            message: "Insurance application submitted successfully",
            policy_id: result.insertId
        });
    } catch (error) {
        console.error("Apply Insurance Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Farmer's Own Policies (FARMER only)
const getFarmerPolicies = async (req, res) => {
    try {
        const farmer_id = req.user.user_id;

        const [rows] = await db.query(
            `SELECT
                ip.policy_id,
                ip.livestock_id,
                ip.farmer_id,
                ip.policy_number,
                ip.insurance_provider,
                ip.policy_name,
                ip.coverage_amount,
                ip.premium_amount,
                ip.subsidy_amount,
                ip.start_date,
                ip.end_date,
                ip.status,
                ip.identification_mark,
                ip.admin_remarks,
                ip.applied_at,
                ip.reviewed_at,
                l.animal_name,
                l.tag_number,
                l.species,
                l.breed,
                l.gender
             FROM insurance_policies ip
             JOIN livestock l ON ip.livestock_id = l.livestock_id
             WHERE ip.farmer_id = ?
             ORDER BY ip.applied_at DESC`,
            [farmer_id]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Get Farmer Policies Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Single Policy by ID (FARMER can only access own policy, ADMIN can access any)
const getPolicyById = async (req, res) => {
    try {
        const { id } = req.params;

        let rows;

        if (req.user.role === "ADMIN") {
            [rows] = await db.query(
                `SELECT
                    ip.*,
                    u.full_name AS farmer_name,
                    u.email AS farmer_email,
                    u.phone AS farmer_phone,
                    l.animal_name,
                    l.tag_number,
                    l.species,
                    l.breed,
                    l.gender
                 FROM insurance_policies ip
                 JOIN users u ON ip.farmer_id = u.user_id
                 JOIN livestock l ON ip.livestock_id = l.livestock_id
                 WHERE ip.policy_id = ?`,
                [id]
            );
        } else {
            [rows] = await db.query(
                `SELECT
                    ip.*,
                    l.animal_name,
                    l.tag_number,
                    l.species,
                    l.breed,
                    l.gender
                 FROM insurance_policies ip
                 JOIN livestock l ON ip.livestock_id = l.livestock_id
                 WHERE ip.policy_id = ? AND ip.farmer_id = ?`,
                [id, req.user.user_id]
            );
        }

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Insurance policy not found or permission denied"
            });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Get Policy By ID Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get All Insurance Applications/Policies (ADMIN only)
const getAllPolicies = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                ip.*,
                u.full_name AS farmer_name,
                u.email AS farmer_email,
                u.phone AS farmer_phone,
                l.animal_name,
                l.tag_number,
                l.species,
                l.breed,
                l.gender
             FROM insurance_policies ip
             JOIN users u ON ip.farmer_id = u.user_id
             JOIN livestock l ON ip.livestock_id = l.livestock_id
             ORDER BY ip.applied_at DESC`
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Get All Policies Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update Policy Status / Approve / Reject (ADMIN only)
const updatePolicyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            policy_number,
            start_date,
            end_date,
            admin_remarks
        } = req.body;

        const ALLOWED_STATUSES = ["ACTIVE", "REJECTED", "EXPIRED", "CLAIMED"];

        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`
            });
        }

        // Check if policy exists
        const [existing] = await db.query(
            "SELECT * FROM insurance_policies WHERE policy_id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Insurance policy not found" });
        }

        let assignedPolicyNumber = policy_number ? String(policy_number).trim() : null;

        // If approving (status === 'ACTIVE') and no policy number was given, generate one
        if (status === "ACTIVE") {
            if (!assignedPolicyNumber && !existing[0].policy_number) {
                assignedPolicyNumber = `AGV-INS-${Date.now().toString().slice(-6)}`;
            } else if (!assignedPolicyNumber) {
                assignedPolicyNumber = existing[0].policy_number;
            }

            // Check uniqueness of policy_number across other policies
            const [duplicate] = await db.query(
                "SELECT policy_id FROM insurance_policies WHERE policy_number = ? AND policy_id != ?",
                [assignedPolicyNumber, id]
            );

            if (duplicate.length > 0) {
                return res.status(409).json({
                    message: "A policy with this policy number already exists"
                });
            }
        }

        const effectiveStartDate = start_date || existing[0].start_date || (status === "ACTIVE" ? new Date().toISOString().split("T")[0] : null);
        const effectiveEndDate = end_date || existing[0].end_date || null;

        const [result] = await db.query(
            `UPDATE insurance_policies
             SET status = ?,
                 policy_number = ?,
                 start_date = ?,
                 end_date = ?,
                 admin_remarks = ?,
                 reviewed_at = CURRENT_TIMESTAMP
             WHERE policy_id = ?`,
            [
                status,
                assignedPolicyNumber,
                effectiveStartDate,
                effectiveEndDate,
                admin_remarks ? String(admin_remarks).trim() : null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Insurance policy not found" });
        }

        // Notify applicant farmer
        if (existing[0].farmer_id) {
            const isApproved = status === "ACTIVE";
            await notifyUser({
                user_id: existing[0].farmer_id,
                title: `Insurance Policy ${isApproved ? "Approved & Activated" : status === "REJECTED" ? "Rejected" : "Updated"}`,
                message: `Your insurance application for "${existing[0].policy_name}" has been ${status.toLowerCase()}.${isApproved ? ` Policy Number: ${assignedPolicyNumber}.` : ""}${admin_remarks ? ` Remarks: ${admin_remarks}` : ""}`,
                notification_type: "INSURANCE_STATUS",
                related_id: id,
                related_type: "INSURANCE_POLICY"
            });
        }

        res.status(200).json({
            message: `Insurance policy ${status.toLowerCase()} successfully`,
            policy_number: assignedPolicyNumber
        });
    } catch (error) {
        console.error("Update Policy Status Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Policy (ADMIN only)
const deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM insurance_policies WHERE policy_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Insurance policy not found" });
        }

        res.status(200).json({
            message: "Insurance policy deleted successfully"
        });
    } catch (error) {
        console.error("Delete Policy Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get Insurance Directory / Schemes (All Authenticated Users)
const getInsuranceDirectory = async (req, res) => {
    try {
        let rows;
        if (req.user && req.user.role === "ADMIN") {
            [rows] = await db.query(
                "SELECT * FROM insurance_schemes ORDER BY insurance_id ASC"
            );
        } else {
            [rows] = await db.query(
                "SELECT * FROM insurance_schemes WHERE status = 'ACTIVE' ORDER BY insurance_id ASC"
            );
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error("Get Insurance Directory Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    applyInsurance,
    getFarmerPolicies,
    getPolicyById,
    getAllPolicies,
    updatePolicyStatus,
    deletePolicy,
    getInsuranceDirectory
};
