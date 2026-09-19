const express = require("express");

const {
    getAllSchemes,
    getSchemeById,
    createScheme,
    updateScheme,
    deleteScheme,
    applyForScheme,
    getFarmerApplications,
    getAllApplications,
    updateApplicationStatus
} = require("../controllers/schemeController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Specific paths must be declared before :id parameter
router.get("/", authenticateToken, getAllSchemes);
router.get("/applications", authenticateToken, authorizeRoles("ADMIN"), getAllApplications);
router.get("/my-applications", authenticateToken, authorizeRoles("FARMER"), getFarmerApplications);

router.post("/", authenticateToken, authorizeRoles("ADMIN"), createScheme);
router.put("/applications/:id/status", authenticateToken, authorizeRoles("ADMIN"), updateApplicationStatus);

router.get("/:id", authenticateToken, getSchemeById);
router.put("/:id", authenticateToken, authorizeRoles("ADMIN"), updateScheme);
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), deleteScheme);
router.post("/:id/apply", authenticateToken, authorizeRoles("FARMER"), applyForScheme);

module.exports = router;
