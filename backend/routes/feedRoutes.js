const express = require("express");

const {
    addFeedRecord,
    getFeedRecords,
    getFeedRecordById,
    updateFeedRecord,
    deleteFeedRecord
} = require("../controllers/feedController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authenticateToken, authorizeRoles("FARMER"), addFeedRecord);
router.get("/", authenticateToken, authorizeRoles("FARMER"), getFeedRecords);
router.get("/:id", authenticateToken, authorizeRoles("FARMER"), getFeedRecordById);
router.put("/:id", authenticateToken, authorizeRoles("FARMER"), updateFeedRecord);
router.delete("/:id", authenticateToken, authorizeRoles("FARMER"), deleteFeedRecord);

module.exports = router;
