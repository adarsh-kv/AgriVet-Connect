const db = require("../config/db");

// Add Health Record
const addHealthRecord = async (req, res) => {
    try {
        const {
            livestock_id,
            visit_date,
            diagnosis,
            treatment,
            medicine,
            remarks
        } = req.body;

        // Get veterinarian ID from JWT
        const veterinarian_id = req.user.user_id;

        if (!livestock_id || !visit_date) {
            return res.status(400).json({
                message: "Livestock and Visit Date are required"
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

// View Health Records
const getHealthRecords = async (req, res) => {
    try {

        let rows;

        if (req.user.role === "ADMIN") {

            [rows] = await db.query(`
                SELECT hr.*, l.animal_name, l.tag_number
                FROM health_records hr
                JOIN livestock l
                ON hr.livestock_id = l.livestock_id
            `);

        } else if (req.user.role === "VETERINARIAN") {

            [rows] = await db.query(`
                SELECT hr.*, l.animal_name, l.tag_number
                FROM health_records hr
                JOIN livestock l
                ON hr.livestock_id = l.livestock_id
                WHERE hr.veterinarian_id = ?
            `, [req.user.user_id]);

        } else {

            // Farmer
            [rows] = await db.query(`
                SELECT hr.*, l.animal_name, l.tag_number
                FROM health_records hr
                JOIN livestock l
                ON hr.livestock_id = l.livestock_id
                WHERE l.owner_id = ?
            `, [req.user.user_id]);

        }

        res.status(200).json(rows);

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

        let rows;

        if (req.user.role === "ADMIN") {

            [rows] = await db.query(
                "SELECT * FROM health_records WHERE record_id = ?",
                [id]
            );

        } else if (req.user.role === "VETERINARIAN") {

            [rows] = await db.query(
                `SELECT * FROM health_records
                 WHERE record_id = ? AND veterinarian_id = ?`,
                [id, req.user.user_id]
            );

        } else {

            [rows] = await db.query(
                `SELECT hr.*
                 FROM health_records hr
                 JOIN livestock l
                 ON hr.livestock_id = l.livestock_id
                 WHERE hr.record_id = ?
                 AND l.owner_id = ?`,
                [id, req.user.user_id]
            );

        }

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Health record not found or permission denied"
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

        let result;

        if (req.user.role === "ADMIN") {

            [result] = await db.query(
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

        } else {

            [result] = await db.query(
                `UPDATE health_records
                 SET visit_date=?,
                     diagnosis=?,
                     treatment=?,
                     medicine=?,
                     remarks=?
                 WHERE record_id=? AND veterinarian_id=?`,
                [
                    visit_date,
                    diagnosis,
                    treatment,
                    medicine,
                    remarks,
                    id,
                    req.user.user_id
                ]
            );

        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Health record not found or permission denied"
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

        let result;

        if (req.user.role === "ADMIN") {

            [result] = await db.query(
                "DELETE FROM health_records WHERE record_id = ?",
                [id]
            );

        } else {

            [result] = await db.query(
                `DELETE FROM health_records
                 WHERE record_id = ? AND veterinarian_id = ?`,
                [id, req.user.user_id]
            );

        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Health record not found or permission denied"
            });
        }

        res.status(200).json({
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