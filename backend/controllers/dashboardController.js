const db = require("../config/db");

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {

        let totalLivestock;
        let totalHealthRecords;
        let totalVaccinations;

        // ADMIN
        if (req.user.role === "ADMIN") {

            const [livestock] = await db.query(
                "SELECT COUNT(*) AS count FROM livestock"
            );

            const [health] = await db.query(
                "SELECT COUNT(*) AS count FROM health_records"
            );

            const [vaccinations] = await db.query(
                "SELECT COUNT(*) AS count FROM vaccinations"
            );

            totalLivestock = livestock[0].count;
            totalHealthRecords = health[0].count;
            totalVaccinations = vaccinations[0].count;

        }

        // FARMER
        else if (req.user.role === "FARMER") {

            const [livestock] = await db.query(
                `SELECT COUNT(*) AS count
                 FROM livestock
                 WHERE owner_id = ?`,
                [req.user.user_id]
            );

            const [health] = await db.query(
                `SELECT COUNT(*) AS count
                 FROM health_records hr
                 JOIN livestock l
                 ON hr.livestock_id = l.livestock_id
                 WHERE l.owner_id = ?`,
                [req.user.user_id]
            );

            const [vaccinations] = await db.query(
                `SELECT COUNT(*) AS count
                 FROM vaccinations v
                 JOIN livestock l
                 ON v.livestock_id = l.livestock_id
                 WHERE l.owner_id = ?`,
                [req.user.user_id]
            );

            totalLivestock = livestock[0].count;
            totalHealthRecords = health[0].count;
            totalVaccinations = vaccinations[0].count;

        }

        // VETERINARIAN
        else if (req.user.role === "VETERINARIAN") {

            const [livestock] = await db.query(
                `SELECT COUNT(DISTINCT livestock_id) AS count
                 FROM health_records
                 WHERE veterinarian_id = ?`,
                [req.user.user_id]
            );

            const [health] = await db.query(
                `SELECT COUNT(*) AS count
                 FROM health_records
                 WHERE veterinarian_id = ?`,
                [req.user.user_id]
            );

            const [vaccinations] = await db.query(
                `SELECT COUNT(*) AS count
                 FROM vaccinations
                 WHERE veterinarian_id = ?`,
                [req.user.user_id]
            );

            totalLivestock = livestock[0].count;
            totalHealthRecords = health[0].count;
            totalVaccinations = vaccinations[0].count;

        }

        else {
            return res.status(403).json({
                message: "Invalid role"
            });
        }

        res.status(200).json({
            totalLivestock,
            totalHealthRecords,
            totalVaccinations
        });

    } catch (error) {

        console.error("Dashboard Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get Upcoming Vaccinations
const getUpcomingVaccinations = async (req, res) => {
    try {
        let rows;

        // ADMIN
        if (req.user.role === "ADMIN") {

            [rows] = await db.query(`
                SELECT
                    v.vaccination_id,
                    v.livestock_id,
                    v.vaccine_name,
                    v.next_due_date,
                    v.status,
                    l.animal_name,
                    l.tag_number
                FROM vaccinations v
                JOIN livestock l
                ON v.livestock_id = l.livestock_id
                WHERE v.next_due_date >= CURDATE()
                ORDER BY v.next_due_date ASC
            `);

        }

        // FARMER
        else if (req.user.role === "FARMER") {

            [rows] = await db.query(`
                SELECT
                    v.vaccination_id,
                    v.livestock_id,
                    v.vaccine_name,
                    v.next_due_date,
                    v.status,
                    l.animal_name,
                    l.tag_number
                FROM vaccinations v
                JOIN livestock l
                ON v.livestock_id = l.livestock_id
                WHERE l.owner_id = ?
                AND v.next_due_date >= CURDATE()
                ORDER BY v.next_due_date ASC
            `, [req.user.user_id]);

        }

        // VETERINARIAN
        else if (req.user.role === "VETERINARIAN") {

            [rows] = await db.query(`
                SELECT
                    v.vaccination_id,
                    v.livestock_id,
                    v.vaccine_name,
                    v.next_due_date,
                    v.status,
                    l.animal_name,
                    l.tag_number
                FROM vaccinations v
                JOIN livestock l
                ON v.livestock_id = l.livestock_id
                WHERE v.veterinarian_id = ?
                AND v.next_due_date >= CURDATE()
                ORDER BY v.next_due_date ASC
            `, [req.user.user_id]);

        }

        else {
            return res.status(403).json({
                message: "Invalid role"
            });
        }

        res.status(200).json(rows);

    } catch (error) {
        console.error("Upcoming Vaccinations Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get Recent Health Records
const getRecentHealthRecords = async (req, res) => {
    try {
        let rows;

        // ADMIN
        if (req.user.role === "ADMIN") {

            [rows] = await db.query(`
                SELECT
                    hr.record_id,
                    hr.livestock_id,
                    hr.veterinarian_id,
                    hr.visit_date,
                    hr.diagnosis,
                    hr.treatment,
                    hr.medicine,
                    hr.remarks,
                    l.animal_name,
                    l.tag_number
                FROM health_records hr
                JOIN livestock l
                ON hr.livestock_id = l.livestock_id
                ORDER BY hr.visit_date DESC
                LIMIT 10
            `);

        }

        // FARMER
        else if (req.user.role === "FARMER") {

            [rows] = await db.query(`
                SELECT
                    hr.record_id,
                    hr.livestock_id,
                    hr.veterinarian_id,
                    hr.visit_date,
                    hr.diagnosis,
                    hr.treatment,
                    hr.medicine,
                    hr.remarks,
                    l.animal_name,
                    l.tag_number
                FROM health_records hr
                JOIN livestock l
                ON hr.livestock_id = l.livestock_id
                WHERE l.owner_id = ?
                ORDER BY hr.visit_date DESC
                LIMIT 10
            `, [req.user.user_id]);

        }

        // VETERINARIAN
        else if (req.user.role === "VETERINARIAN") {

            [rows] = await db.query(`
                SELECT
                    hr.record_id,
                    hr.livestock_id,
                    hr.veterinarian_id,
                    hr.visit_date,
                    hr.diagnosis,
                    hr.treatment,
                    hr.medicine,
                    hr.remarks,
                    l.animal_name,
                    l.tag_number
                FROM health_records hr
                JOIN livestock l
                ON hr.livestock_id = l.livestock_id
                WHERE hr.veterinarian_id = ?
                ORDER BY hr.visit_date DESC
                LIMIT 10
            `, [req.user.user_id]);

        }

        else {
            return res.status(403).json({
                message: "Invalid role"
            });
        }

        res.status(200).json(rows);

    } catch (error) {
        console.error("Recent Health Records Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    getDashboardStats,
    getUpcomingVaccinations,
    getRecentHealthRecords
};