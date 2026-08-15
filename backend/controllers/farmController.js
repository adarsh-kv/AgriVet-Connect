const db = require("../config/db");

// ==========================================
// CREATE FARM
// ==========================================

const createFarm = async (req, res) => {
    try {
        const {
            farm_name,
            location,
            farm_type,
            description
        } = req.body;

        const owner_id = req.user.user_id;

        if (!farm_name || !farm_name.trim()) {
            return res.status(400).json({
                message: "Farm name is required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO farms
            (owner_id, farm_name, location, farm_type, description)
            VALUES (?, ?, ?, ?, ?)`,
            [
                owner_id,
                farm_name.trim(),
                location || null,
                farm_type || null,
                description || null
            ]
        );

        res.status(201).json({
            message: "Farm created successfully",
            farm_id: result.insertId
        });

    } catch (error) {
        console.error("Create Farm Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// ==========================================
// GET MY FARMS
// ==========================================

const getMyFarms = async (req, res) => {
    try {
        const owner_id = req.user.user_id;

        const [rows] = await db.query(
            `SELECT
                f.farm_id,
                f.farm_name,
                f.location,
                f.farm_type,
                f.description,
                f.created_at,
                COUNT(l.livestock_id) AS livestock_count
             FROM farms f
             LEFT JOIN livestock l
                ON f.farm_id = l.farm_id
             WHERE f.owner_id = ?
             GROUP BY
                f.farm_id,
                f.farm_name,
                f.location,
                f.farm_type,
                f.description,
                f.created_at
             ORDER BY f.created_at DESC`,
            [owner_id]
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get My Farms Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// ==========================================
// GET FARM BY ID
// ==========================================

const getFarmById = async (req, res) => {
    try {
        const { id } = req.params;

        const [farms] = await db.query(
            `SELECT
                farm_id,
                farm_name,
                location,
                farm_type,
                description,
                created_at
             FROM farms
             WHERE farm_id = ?
             AND owner_id = ?`,
            [id, req.user.user_id]
        );

        if (farms.length === 0) {
            return res.status(404).json({
                message: "Farm not found or permission denied"
            });
        }

        const [livestock] = await db.query(
            `SELECT
                livestock_id,
                tag_number,
                animal_name,
                species,
                breed,
                gender,
                date_of_birth,
                weight,
                health_status,
                created_at
             FROM livestock
             WHERE farm_id = ?
             AND owner_id = ?
             ORDER BY created_at DESC`,
            [id, req.user.user_id]
        );

        res.status(200).json({
            ...farms[0],
            livestock
        });

    } catch (error) {
        console.error("Get Farm By ID Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// ==========================================
// UPDATE FARM
// ==========================================

const updateFarm = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            farm_name,
            location,
            farm_type,
            description
        } = req.body;

        if (!farm_name || !farm_name.trim()) {
            return res.status(400).json({
                message: "Farm name is required"
            });
        }

        const [result] = await db.query(
            `UPDATE farms
             SET farm_name = ?,
                 location = ?,
                 farm_type = ?,
                 description = ?
             WHERE farm_id = ?
             AND owner_id = ?`,
            [
                farm_name.trim(),
                location || null,
                farm_type || null,
                description || null,
                id,
                req.user.user_id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Farm not found or permission denied"
            });
        }

        res.status(200).json({
            message: "Farm updated successfully"
        });

    } catch (error) {
        console.error("Update Farm Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// ==========================================
// DELETE FARM
// ==========================================

const deleteFarm = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether livestock is still assigned
        const [livestock] = await db.query(
            `SELECT livestock_id
             FROM livestock
             WHERE farm_id = ?
             LIMIT 1`,
            [id]
        );

        if (livestock.length > 0) {
            return res.status(400).json({
                message: "Cannot delete a farm while livestock is assigned to it"
            });
        }

        const [result] = await db.query(
            `DELETE FROM farms
             WHERE farm_id = ?
             AND owner_id = ?`,
            [id, req.user.user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Farm not found or permission denied"
            });
        }

        res.status(200).json({
            message: "Farm deleted successfully"
        });

    } catch (error) {
        console.error("Delete Farm Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


module.exports = {
    createFarm,
    getMyFarms,
    getFarmById,
    updateFarm,
    deleteFarm
};