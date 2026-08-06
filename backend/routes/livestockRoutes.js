const express = require("express");

const {
    addLivestock
} = require("../controllers/livestockController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addLivestock);

module.exports = router;