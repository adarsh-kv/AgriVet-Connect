const express = require("express");

const {
    applyInsurance,
    getFarmerPolicies,
    getPolicyById,
    getAllPolicies,
    updatePolicyStatus,
    deletePolicy,
    getInsuranceDirectory
} = require("../controllers/insuranceController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Specific routes before /:id
router.get("/directory", authenticateToken, getInsuranceDirectory);
router.get("/", authenticateToken, authorizeRoles("ADMIN"), getAllPolicies);
router.get("/my-policies", authenticateToken, authorizeRoles("FARMER"), getFarmerPolicies);
router.post("/apply", authenticateToken, authorizeRoles("FARMER"), applyInsurance);

router.get("/:id", authenticateToken, getPolicyById);
router.put("/:id/status", authenticateToken, authorizeRoles("ADMIN"), updatePolicyStatus);
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), deletePolicy);

module.exports = router;
