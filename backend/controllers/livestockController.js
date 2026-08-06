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

module.exports = {
    addLivestock
};