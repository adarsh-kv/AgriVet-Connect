const express = require("express");

const {
    getVeterinarians,
    createVeterinarianRequest,
    getVeterinarianRequests,
    updateVeterinarianRequest
} = require("../controllers/veterinarianController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Get all veterinarians
router.get(
    "/",
    authenticateToken,
    getVeterinarians
);

// Farmer sends a request to a veterinarian
router.post(
    "/requests",
    authenticateToken,
    createVeterinarianRequest
);

// Get veterinarian requests
router.get(
    "/requests",
    authenticateToken,
    getVeterinarianRequests
);

// Veterinarian accepts/rejects a request
router.put(
    "/requests/:id",
    authenticateToken,
    updateVeterinarianRequest
);

module.exports = router;