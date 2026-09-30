const express = require("express");

const {
    createFarm,
    getMyFarms,
    getFarmById,
    updateFarm,
    deleteFarm
} = require("../controllers/farmController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("FARMER"),
    createFarm
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("FARMER"),
    getMyFarms
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("FARMER"),
    getFarmById
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("FARMER"),
    updateFarm
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("FARMER"),
    deleteFarm
);

module.exports = router;