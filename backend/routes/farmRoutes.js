const express = require("express");

const {
    createFarm,
    getMyFarms,
    getFarmById,
    updateFarm,
    deleteFarm
} = require("../controllers/farmController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    createFarm
);

router.get(
    "/",
    authenticateToken,
    getMyFarms
);

router.get(
    "/:id",
    authenticateToken,
    getFarmById
);

router.put(
    "/:id",
    authenticateToken,
    updateFarm
);

router.delete(
    "/:id",
    authenticateToken,
    deleteFarm
);

module.exports = router;