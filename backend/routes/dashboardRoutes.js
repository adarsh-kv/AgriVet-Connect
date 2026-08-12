const express = require("express");

const {
    getDashboardStats,
    getUpcomingVaccinations,
    getRecentHealthRecords
} = require("../controllers/dashboardController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Dashboard statistics
router.get("/stats", authenticateToken, getDashboardStats);

// Upcoming vaccinations
router.get(
    "/upcoming-vaccinations",
    authenticateToken,
    getUpcomingVaccinations
);

// Recent health records
router.get(
    "/recent-health",
    authenticateToken,
    getRecentHealthRecords
);

module.exports = router;