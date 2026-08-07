const db = require("../config/db");

// Add Vaccination
const addVaccination = async (req, res) => {
    try {

        const {
            livestock_id,
            vaccine_name,
            vaccination_date,
            next_due_date,
            remarks
        } = req.body;

        // Get veterinarian ID from JWT
        const veterinarian_id = req.user.user_id;

        if (!livestock_id || !vaccine_name || !vaccination_date) {
            return res.status(400).json({
                message: "Livestock, Vaccine Name and Vaccination Date are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO vaccinations
            (livestock_id, veterinarian_id, vaccine_name, vaccination_date, next_due_date, remarks)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                livestock_id,
                veterinarian_id,
                vaccine_name,
                vaccination_date,
                next_due_date,
                remarks
            ]
        );

        res.status(201).json({
            message: "Vaccination added successfully",
            vaccination_id: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get Vaccinations
const getVaccinations = async (req, res) => {
    try {

        let rows;

        if (req.user.role === "ADMIN") {

            [rows] = await db.query(`
                SELECT v.*, l.animal_name, l.tag_number
                FROM vaccinations v
                JOIN livestock l
                ON v.livestock_id = l.livestock_id
            `);

        } else if (req.user.role === "VETERINARIAN") {

            [rows] = await db.query(`
                SELECT v.*, l.animal_name, l.tag_number
                FROM vaccinations v
                JOIN livestock l
                ON v.livestock_id = l.livestock_id
                WHERE v.veterinarian_id = ?
            `, [req.user.user_id]);

        } else {

            [rows] = await db.query(`
                SELECT v.*, l.animal_name, l.tag_number
                FROM vaccinations v
                JOIN livestock l
                ON v.livestock_id = l.livestock_id
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

// Get Vaccination by ID
const getVaccinationById = async (req, res) => {
    try {

        const { id } = req.params;

        let rows;

        if (req.user.role === "ADMIN") {

            [rows] = await db.query(
                "SELECT * FROM vaccinations WHERE vaccination_id = ?",
                [id]
            );

        } else if (req.user.role === "VETERINARIAN") {

            [rows] = await db.query(
                `SELECT *
                 FROM vaccinations
                 WHERE vaccination_id = ?
                 AND veterinarian_id = ?`,
                [id, req.user.user_id]
            );

        } else {

            [rows] = await db.query(
                `SELECT v.*
                 FROM vaccinations v
                 JOIN livestock l
                 ON v.livestock_id = l.livestock_id
                 WHERE v.vaccination_id = ?
                 AND l.owner_id = ?`,
                [id, req.user.user_id]
            );

        }

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Vaccination record not found or permission denied"
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

// Update Vaccination
const updateVaccination = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            vaccine_name,
            vaccination_date,
            next_due_date,
            status,
            remarks
        } = req.body;

        let result;

        if (req.user.role === "ADMIN") {

            [result] = await db.query(
                `UPDATE vaccinations
                 SET vaccine_name=?,
                     vaccination_date=?,
                     next_due_date=?,
                     status=?,
                     remarks=?
                 WHERE vaccination_id=?`,
                [
                    vaccine_name,
                    vaccination_date,
                    next_due_date,
                    status,
                    remarks,
                    id
                ]
            );

        } else if (req.user.role === "VETERINARIAN") {

            [result] = await db.query(
                `UPDATE vaccinations
                 SET vaccine_name=?,
                     vaccination_date=?,
                     next_due_date=?,
                     status=?,
                     remarks=?
                 WHERE vaccination_id=? AND veterinarian_id=?`,
                [
                    vaccine_name,
                    vaccination_date,
                    next_due_date,
                    status,
                    remarks,
                    id,
                    req.user.user_id
                ]
            );

        } else {

            return res.status(403).json({
                message: "Farmers cannot update vaccination records"
            });

        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Vaccination record not found or permission denied"
            });
        }

        res.status(200).json({
            message: "Vaccination updated successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Delete Vaccination
const deleteVaccination = async (req, res) => {
    try {

        const { id } = req.params;

        let result;

        if (req.user.role === "ADMIN") {

            [result] = await db.query(
                "DELETE FROM vaccinations WHERE vaccination_id = ?",
                [id]
            );

        } else if (req.user.role === "VETERINARIAN") {

            [result] = await db.query(
                `DELETE FROM vaccinations
                 WHERE vaccination_id = ? AND veterinarian_id = ?`,
                [id, req.user.user_id]
            );

        } else {

            return res.status(403).json({
                message: "Farmers cannot delete vaccination records"
            });

        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Vaccination record not found or permission denied"
            });
        }

        res.status(200).json({
            message: "Vaccination deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    addVaccination,
    getVaccinations,
    getVaccinationById,
    updateVaccination,
    deleteVaccination
};