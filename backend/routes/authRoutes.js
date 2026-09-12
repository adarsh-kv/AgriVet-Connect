const express = require("express");

const {
    register,
    registerVeterinarian,
    login
} = require("../controllers/authController");

const uploadCertificate = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", register);

router.post(
    "/register-veterinarian",
    (req, res, next) => {
        uploadCertificate.single("certificate")(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    message: err.message || "Error uploading certificate file"
                });
            }
            next();
        });
    },
    registerVeterinarian
);

router.post("/login", login);

module.exports = router;