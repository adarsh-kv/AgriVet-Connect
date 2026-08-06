const express = require("express");

const {
    addLivestock,
    getAllLivestock,
    getLivestockById,
    updateLivestock,
    deleteLivestock
} = require("../controllers/livestockController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addLivestock);
router.get("/", authenticateToken, getAllLivestock);
router.get("/:id", authenticateToken, getLivestockById);
router.put("/:id", authenticateToken, updateLivestock);
router.delete("/:id", authenticateToken, deleteLivestock);

module.exports = router;