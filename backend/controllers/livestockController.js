const db = require("../config/db");

// Add Livestock
const addLivestock = async (req, res) => {
    try {
        const {
            owner_id,
            tag_number,
            animal_name,
            species,
            breed,
            gender,
            date_of_birth,
            weight,
            health_status
        } = req.body;

        if (!owner_id || !tag_number || !species) {
            return res.status(400).json({
                message: "Owner ID, Tag Number and Species are required"
            });
        }

        const [existing] = await db.query(
            "SELECT livestock_id FROM livestock WHERE tag_number = ?",
            [tag_number]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Tag number already exists"
            });
        }

        const [result] = await db.query(
            `INSERT INTO livestock
            (owner_id, tag_number, animal_name, species, breed, gender, date_of_birth, weight, health_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                owner_id,
                tag_number,
                animal_name,
                species,
                breed,
                gender,
                date_of_birth,
                weight,
                health_status
            ]
        );

        res.status(201).json({
            message: "Livestock added successfully",
            livestock_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get All Livestock
const getAllLivestock = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                livestock_id,
                owner_id,
                tag_number,
                animal_name,
                species,
                breed,
                gender,
                date_of_birth,
                weight,
                health_status,
                created_at
            FROM livestock`
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get Livestock by ID
const getLivestockById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM livestock WHERE livestock_id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Livestock not found"
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

// Update Livestock
const updateLivestock = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            animal_name,
            species,
            breed,
            gender,
            date_of_birth,
            weight,
            health_status
        } = req.body;

        const [result] = await db.query(
            `UPDATE livestock
             SET animal_name=?,
                 species=?,
                 breed=?,
                 gender=?,
                 date_of_birth=?,
                 weight=?,
                 health_status=?
             WHERE livestock_id=?`,
            [
                animal_name,
                species,
                breed,
                gender,
                date_of_birth,
                weight,
                health_status,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Livestock not found"
            });
        }

        res.json({
            message: "Livestock updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Delete Livestock
const deleteLivestock = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM livestock WHERE livestock_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Livestock not found"
            });
        }

        res.json({
            message: "Livestock deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    addLivestock,
    getAllLivestock,
    getLivestockById,
    updateLivestock,
    deleteLivestock
};