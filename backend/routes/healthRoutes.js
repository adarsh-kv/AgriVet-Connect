const express = require("express");

const {
    addHealthRecord,
    getHealthRecords,
    getHealthRecordById,
    updateHealthRecord,
    deleteHealthRecord
} = require("../controllers/healthController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addHealthRecord);

router.get("/", authenticateToken, getHealthRecords);

router.get("/:id", authenticateToken, getHealthRecordById);

router.put("/:id", authenticateToken, updateHealthRecord);

router.delete("/:id", authenticateToken, deleteHealthRecord);

module.exports = router;