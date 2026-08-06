const db = require("../config/db");

// Add Health Record
const addHealthRecord = async (req, res) => {
    try {
        const {
            livestock_id,
            veterinarian_id,
            visit_date,
            diagnosis,
            treatment,
            medicine,
            remarks
        } = req.body;

        if (!livestock_id || !veterinarian_id || !visit_date) {
            return res.status(400).json({
                message: "Livestock, Veterinarian and Visit Date are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO health_records
            (livestock_id, veterinarian_id, visit_date, diagnosis, treatment, medicine, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                livestock_id,
                veterinarian_id,
                visit_date,
                diagnosis,
                treatment,
                medicine,
                remarks
            ]
        );

        res.status(201).json({
            message: "Health record added successfully",
            record_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// View All Health Records
const getHealthRecords = async (req, res) => {
    try {

        const [rows] = await db.query(
            `SELECT * FROM health_records`
        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get Health Record by ID
const getHealthRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM health_records WHERE record_id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Health record not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Update Health Record
const updateHealthRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            visit_date,
            diagnosis,
            treatment,
            medicine,
            remarks
        } = req.body;

        const [result] = await db.query(
            `UPDATE health_records
             SET visit_date=?,
                 diagnosis=?,
                 treatment=?,
                 medicine=?,
                 remarks=?
             WHERE record_id=?`,
            [
                visit_date,
                diagnosis,
                treatment,
                medicine,
                remarks,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Health record not found"
            });
        }

        res.json({
            message: "Health record updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Delete Health Record
const deleteHealthRecord = async (req, res) => {
    try {

        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM health_records WHERE record_id=?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Health record not found"
            });
        }

        res.json({
            message: "Health record deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    addHealthRecord,
    getHealthRecords,
    getHealthRecordById,
    updateHealthRecord,
    deleteHealthRecord
};