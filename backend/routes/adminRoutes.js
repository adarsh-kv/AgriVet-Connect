const express = require("express");

const {
    getAllUsers
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/users",
    authenticateToken,
    getAllUsers
);


module.exports = router;