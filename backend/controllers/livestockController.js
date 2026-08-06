const db = require("../config/db");

// Add Livestock
const addLivestock = async (req, res) => {
    try {
        const {
            tag_number,
            animal_name,
            species,
            breed,
            gender,
            date_of_birth,
            weight,
            health_status
        } = req.body;

        // Get owner ID from JWT
        const owner_id = req.user.user_id;

        if (!tag_number || !species) {
            return res.status(400).json({
            message: "Tag Number and Species are required"
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

        let rows;

        // Admin can view all livestock
        if (req.user.role === "ADMIN") {

            [rows] = await db.query(
                `SELECT * FROM livestock`
            );

        } else {

            // Farmer can view only their livestock
            [rows] = await db.query(
                `SELECT * FROM livestock
                 WHERE owner_id = ?`,
                [req.user.user_id]
            );

        }

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

        let rows;

        if (req.user.role === "ADMIN") {

            [rows] = await db.query(
                "SELECT * FROM livestock WHERE livestock_id = ?",
                [id]
            );

        } else {

            [rows] = await db.query(
                `SELECT * FROM livestock
                 WHERE livestock_id = ? AND owner_id = ?`,
                [id, req.user.user_id]
            );

        }

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

        let result;

        if (req.user.role === "ADMIN") {

            [result] = await db.query(
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

        } else {

            [result] = await db.query(
                `UPDATE livestock
                 SET animal_name=?,
                     species=?,
                     breed=?,
                     gender=?,
                     date_of_birth=?,
                     weight=?,
                     health_status=?
                 WHERE livestock_id=? AND owner_id=?`,
                [
                    animal_name,
                    species,
                    breed,
                    gender,
                    date_of_birth,
                    weight,
                    health_status,
                    id,
                    req.user.user_id
                ]
            );

        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Livestock not found or you don't have permission"
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

        let result;

        // Admin can delete any livestock
        if (req.user.role === "ADMIN") {

            [result] = await db.query(
                "DELETE FROM livestock WHERE livestock_id = ?",
                [id]
            );

        } else {

            // Farmer can delete only their own livestock
            [result] = await db.query(
                "DELETE FROM livestock WHERE livestock_id = ? AND owner_id = ?",
                [id, req.user.user_id]
            );

        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Livestock not found or you don't have permission"
            });
        }

        res.status(200).json({
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