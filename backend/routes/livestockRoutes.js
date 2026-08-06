const express = require("express");

const {
    addLivestock,
    getAllLivestock
} = require("../controllers/livestockController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addLivestock);
router.get("/", authenticateToken, getAllLivestock);

module.exports = router;