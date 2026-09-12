const express = require("express");

const {
    getAllUsers,
    getUserById,
    updateUserStatus,
    getVeterinarianVerifications,
    updateVeterinarianVerificationStatus
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/users",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getAllUsers
);

router.get(
    "/users/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getUserById
);

router.put(
    "/users/:id/status",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateUserStatus
);

router.get(
    "/veterinarians/verifications",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getVeterinarianVerifications
);

router.put(
    "/veterinarians/verifications/:id/status",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateVeterinarianVerificationStatus
);

module.exports = router;