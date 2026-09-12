const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");


const register = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            phone,
            role_id
        } = req.body;

        // Check required fields
        if (!full_name || !email || !password || !role_id) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        // Check whether email already exists
        const [existingUser] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const [result] = await db.query(
            `INSERT INTO users
            (full_name, email, password, phone, role_id)
            VALUES (?, ?, ?, ?, ?)`,
            [
                full_name,
                email,
                hashedPassword,
                phone || null,
                role_id
            ]
        );

        res.status(201).json({
            message: "User registered successfully",
            user_id: result.insertId
        });

    } catch (error) {
        console.error("Registration Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user and role
        const [users] = await db.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.password,
                u.phone,
                u.role_id,
                u.status,
                r.role_name
            FROM users u
            JOIN roles r
                ON u.role_id = r.role_id
            WHERE u.email = ?`,
            [email]
        );

        // User not found
        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Check whether the account is active
        if (user.status === "INACTIVE") {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact the administrator."
            });
        }

        // Check verification for veterinarians
        if (user.role_name === "VETERINARIAN") {
            const [verifications] = await db.query(
                `SELECT verification_status FROM veterinarian_verifications WHERE user_id = ?`,
                [user.user_id]
            );

            const verificationStatus = verifications.length > 0 ? verifications[0].verification_status : "PENDING";

            if (verificationStatus === "PENDING") {
                return res.status(403).json({
                    message: "Your veterinarian account is pending administrator approval."
                });
            }

            if (verificationStatus === "REJECTED") {
                return res.status(403).json({
                    message: "Your veterinarian application has been rejected. Please contact the administrator."
                });
            }

            if (verificationStatus !== "APPROVED") {
                return res.status(403).json({
                    message: "Your veterinarian account is pending administrator approval."
                });
            }
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        // Wrong password
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                role_id: user.role_id,
                role: user.role_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",

            token,

            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const registerVeterinarian = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            phone,
            certificate_name,
            certificate_number
        } = req.body || {};

        // Check required fields
        if (!full_name || !email || !password || !certificate_name) {
            return res.status(400).json({
                message: "Full name, email, password, and certificate name are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Certificate file is required"
            });
        }

        // Check whether email already exists
        const [existingUser] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database with role_id = 2 and status = 'ACTIVE'
        const [result] = await db.query(
            `INSERT INTO users
            (full_name, email, password, phone, role_id, status)
            VALUES (?, ?, ?, ?, 2, 'ACTIVE')`,
            [
                full_name,
                email,
                hashedPassword,
                phone || null
            ]
        );

        const userId = result.insertId;
        const certificateFilePath = `uploads/certificates/${req.file.filename}`;

        // Create veterinarian_verifications record with PENDING status
        await db.query(
            `INSERT INTO veterinarian_verifications
            (user_id, certificate_name, certificate_number, certificate_file, verification_status)
            VALUES (?, ?, ?, ?, 'PENDING')`,
            [
                userId,
                certificate_name,
                certificate_number || null,
                certificateFilePath
            ]
        );

        return res.status(201).json({
            message: "Veterinarian registration submitted. Awaiting administrator approval.",
            user_id: userId
        });

    } catch (error) {
        console.error("Veterinarian Registration Error:", error);
        return res.status(500).json({
            message: "Server error during registration"
        });
    }
};

module.exports = {
    register,
    registerVeterinarian,
    login
};