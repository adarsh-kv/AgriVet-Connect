const db = require("../config/db");

const ALLOWED_UNITS = ["kg", "g", "lbs", "liters", "bales", "bundles"];

// Add Feed Record
const addFeedRecord = async (req, res) => {
    try {
        const {
            livestock_id,
            feed_type,
            quantity,
            unit,
            feeding_date,
            remarks
        } = req.body;

        const owner_id = req.user.user_id;

        // Validation: Required fields
        if (!livestock_id || !feed_type || quantity === undefined || quantity === null || !unit || !feeding_date) {
            return res.status(400).json({
                message: "Livestock, Feed Type, Quantity, Unit, and Feeding Date are required"
            });
        }

        // Validation: Quantity must be positive number
        const numQty = parseFloat(quantity);
        if (isNaN(numQty) || numQty <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive number greater than zero"
            });
        }

        // Validation: Unit
        const cleanUnit = String(unit).trim().toLowerCase();
        if (!ALLOWED_UNITS.includes(cleanUnit)) {
            return res.status(400).json({
                message: `Unit must be one of: ${ALLOWED_UNITS.join(", ")}`
            });
        }

        // Verify livestock belongs to the authenticated farmer
        const [livestock] = await db.query(
            `SELECT livestock_id
             FROM livestock
             WHERE livestock_id = ? AND owner_id = ?`,
            [livestock_id, owner_id]
        );

        if (livestock.length === 0) {
            return res.status(403).json({
                message: "You can only record feed for your own livestock"
            });
        }

        const [result] = await db.query(
            `INSERT INTO feed_records
             (livestock_id, owner_id, feed_type, quantity, unit, feeding_date, remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                livestock_id,
                owner_id,
                String(feed_type).trim(),
                numQty,
                cleanUnit,
                feeding_date,
                remarks ? String(remarks).trim() : null
            ]
        );

        res.status(201).json({
            message: "Feed record added successfully",
            feed_id: result.insertId
        });

    } catch (error) {
        console.error("Add Feed Record Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get Feed Records for authenticated farmer
const getFeedRecords = async (req, res) => {
    try {
        const owner_id = req.user.user_id;

        const [rows] = await db.query(
            `SELECT
                fr.feed_id,
                fr.livestock_id,
                fr.owner_id,
                fr.feed_type,
                fr.quantity,
                fr.unit,
                fr.feeding_date,
                fr.remarks,
                fr.created_at,
                l.animal_name,
                l.tag_number,
                l.species
             FROM feed_records fr
             JOIN livestock l
                ON fr.livestock_id = l.livestock_id
             WHERE fr.owner_id = ?
             ORDER BY fr.feeding_date DESC, fr.created_at DESC`,
            [owner_id]
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get Feed Records Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get Feed Record by ID
const getFeedRecordById = async (req, res) => {
    try {
        const { id } = req.params;
        const owner_id = req.user.user_id;

        const [rows] = await db.query(
            `SELECT
                fr.feed_id,
                fr.livestock_id,
                fr.owner_id,
                fr.feed_type,
                fr.quantity,
                fr.unit,
                fr.feeding_date,
                fr.remarks,
                fr.created_at,
                l.animal_name,
                l.tag_number,
                l.species
             FROM feed_records fr
             JOIN livestock l
                ON fr.livestock_id = l.livestock_id
             WHERE fr.feed_id = ? AND fr.owner_id = ?`,
            [id, owner_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Feed record not found or permission denied"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get Feed Record By ID Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Update Feed Record
const updateFeedRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const owner_id = req.user.user_id;

        const {
            livestock_id,
            feed_type,
            quantity,
            unit,
            feeding_date,
            remarks
        } = req.body;

        // Validation: Required fields
        if (!livestock_id || !feed_type || quantity === undefined || quantity === null || !unit || !feeding_date) {
            return res.status(400).json({
                message: "Livestock, Feed Type, Quantity, Unit, and Feeding Date are required"
            });
        }

        // Validation: Quantity must be positive number
        const numQty = parseFloat(quantity);
        if (isNaN(numQty) || numQty <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive number greater than zero"
            });
        }

        // Validation: Unit
        const cleanUnit = String(unit).trim().toLowerCase();
        if (!ALLOWED_UNITS.includes(cleanUnit)) {
            return res.status(400).json({
                message: `Unit must be one of: ${ALLOWED_UNITS.join(", ")}`
            });
        }

        // Verify that the target livestock belongs to the authenticated farmer
        const [livestock] = await db.query(
            `SELECT livestock_id
             FROM livestock
             WHERE livestock_id = ? AND owner_id = ?`,
            [livestock_id, owner_id]
        );

        if (livestock.length === 0) {
            return res.status(403).json({
                message: "You can only record feed for your own livestock"
            });
        }

        // Update record ensuring both feed_id and owner_id match
        const [result] = await db.query(
            `UPDATE feed_records
             SET livestock_id = ?,
                 feed_type = ?,
                 quantity = ?,
                 unit = ?,
                 feeding_date = ?,
                 remarks = ?
             WHERE feed_id = ? AND owner_id = ?`,
            [
                livestock_id,
                String(feed_type).trim(),
                numQty,
                cleanUnit,
                feeding_date,
                remarks ? String(remarks).trim() : null,
                id,
                owner_id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Feed record not found or permission denied"
            });
        }

        res.status(200).json({
            message: "Feed record updated successfully"
        });

    } catch (error) {
        console.error("Update Feed Record Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Delete Feed Record
const deleteFeedRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const owner_id = req.user.user_id;

        const [result] = await db.query(
            `DELETE FROM feed_records
             WHERE feed_id = ? AND owner_id = ?`,
            [id, owner_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Feed record not found or permission denied"
            });
        }

        res.status(200).json({
            message: "Feed record deleted successfully"
        });

    } catch (error) {
        console.error("Delete Feed Record Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    addFeedRecord,
    getFeedRecords,
    getFeedRecordById,
    updateFeedRecord,
    deleteFeedRecord
};
