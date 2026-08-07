const express = require("express");

const {
    addVaccination,
    getVaccinations,
    getVaccinationById,
    updateVaccination,
    deleteVaccination
} = require("../controllers/vaccinationController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addVaccination);

router.get("/", authenticateToken, getVaccinations);

router.get("/:id", authenticateToken, getVaccinationById);

router.put("/:id", authenticateToken, updateVaccination);

router.delete("/:id", authenticateToken, deleteVaccination);

module.exports = router;