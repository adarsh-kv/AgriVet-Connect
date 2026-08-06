const db = require("../config/db");

// Add Vaccination
const addVaccination = async (req, res) => {
    try {

        const {
            livestock_id,
            veterinarian_id,
            vaccine_name,
            vaccination_date,
            next_due_date,
            remarks
        } = req.body;

        if (!livestock_id || !veterinarian_id || !vaccine_name || !vaccination_date) {
            return res.status(400).json({
                message: "Required fields are missing"
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

// Get All Vaccinations
const getVaccinations = async (req, res) => {
    try {

        const [rows] = await db.query(
            "SELECT * FROM vaccinations"
        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    addVaccination,
    getVaccinations
};