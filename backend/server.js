const express = require("express");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "AgriVet Connect API is running"
    });
});

app.get("/test-db", async (req, res) => {
    try {
        const [result] = await db.query(
            "SELECT DATABASE() AS database_name"
        );

        res.json({
            message: "Database connected successfully",
            database: result[0].database_name
        });
    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `AgriVet Connect API running on http://localhost:${PORT}`
    );
});