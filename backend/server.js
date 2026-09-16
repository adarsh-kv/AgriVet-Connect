const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");
const livestockRoutes = require("./routes/livestockRoutes");
const healthRoutes = require("./routes/healthRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const veterinarianRoutes = require("./routes/veterinarianRoutes");
const adminRoutes = require("./routes/adminRoutes");
const farmRoutes = require("./routes/farmRoutes");
const feedRoutes = require("./routes/feedRoutes");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/livestock", livestockRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/veterinarians", veterinarianRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/feed", feedRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "AgriVet Connect API is running"
    });
});

app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
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

app.get(
    "/api/admin",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res) => {

        res.json({
            message: "Welcome Admin"
        });

    }
);

app.get(
    "/api/farmer",
    authenticateToken,
    authorizeRoles("FARMER"),
    (req, res) => {

        res.json({
            message: "Welcome Farmer"
        });

    }
);

app.get(
    "/api/vet",
    authenticateToken,
    authorizeRoles("VETERINARIAN"),
    (req, res) => {

        res.json({
            message: "Welcome Veterinarian"
        });

    }
);