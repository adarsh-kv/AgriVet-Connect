const express = require("express");

const {
    addHealthRecord,
    getHealthRecords,
    getHealthRecordById,
    updateHealthRecord,
    deleteHealthRecord
} = require("../controllers/healthController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("VETERINARIAN", "ADMIN"),
    addHealthRecord
);

router.get("/", authenticateToken, getHealthRecords);

router.get("/:id", authenticateToken, getHealthRecordById);

router.put("/:id", authenticateToken, updateHealthRecord);

router.delete("/:id", authenticateToken, deleteHealthRecord);

module.exports = router;