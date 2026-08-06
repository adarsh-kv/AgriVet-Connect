const express = require("express");

const {
    addVaccination,
    getVaccinations
} = require("../controllers/vaccinationController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addVaccination);

router.get("/", authenticateToken, getVaccinations);

module.exports = router;