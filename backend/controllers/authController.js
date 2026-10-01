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
            specialization,
            certificate_number
        } = req.body || {};

        // Check required fields
        if (!full_name || !email || !password || !certificate_name || !specialization) {
            return res.status(400).json({
                message: "Full name, email, password, certificate name, and specialization are required"
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
            (user_id, certificate_name, specialization, certificate_number, certificate_file, verification_status)
            VALUES (?, ?, ?, ?, ?, 'PENDING')`,
            [
                userId,
                certificate_name,
                specialization.trim(),
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

// =========================================================
// GET USER PROFILE
// =========================================================
const getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [users] = await db.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.role_id,
                u.status,
                u.created_at,
                r.role_name AS role
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];
        let verification = null;
        let farms = [];

        if (user.role === "VETERINARIAN") {
            const [verifications] = await db.query(
                `SELECT
                    verification_id,
                    certificate_name,
                    specialization,
                    certificate_number,
                    verification_status,
                    submitted_at,
                    verified_at
                 FROM veterinarian_verifications
                 WHERE user_id = ?
                 ORDER BY verification_id DESC
                 LIMIT 1`,
                [userId]
            );
            if (verifications.length > 0) {
                verification = verifications[0];
            }
        } else if (user.role === "FARMER") {
            const [userFarms] = await db.query(
                `SELECT
                    farm_id,
                    farm_name,
                    location,
                    farm_type,
                    description,
                    created_at
                 FROM farms
                 WHERE owner_id = ?
                 ORDER BY farm_id DESC`,
                [userId]
            );
            farms = userFarms;
        }

        res.status(200).json({
            user,
            verification,
            farms
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Server error retrieving profile" });
    }
};

// =========================================================
// UPDATE USER PROFILE
// =========================================================
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const role = req.user.role;
        const { full_name, phone, specialization } = req.body;

        if (!full_name || !String(full_name).trim()) {
            return res.status(400).json({ message: "Full name is required" });
        }

        const cleanName = String(full_name).trim();
        const cleanPhone = phone !== undefined ? (phone ? String(phone).trim() : null) : null;

        // Update basic user info (full_name, phone)
        await db.query(
            `UPDATE users
             SET full_name = ?,
                 phone = ?
             WHERE user_id = ?`,
            [cleanName, cleanPhone, userId]
        );

        // If veterinarian, allow updating specialization without touching verification status/history
        if (role === "VETERINARIAN" && specialization !== undefined) {
            const cleanSpec = specialization ? String(specialization).trim() : null;
            await db.query(
                `UPDATE veterinarian_verifications
                 SET specialization = ?
                 WHERE user_id = ?
                 ORDER BY verification_id DESC
                 LIMIT 1`,
                [cleanSpec, userId]
            );
        }

        // Fetch refreshed user info to return
        const [users] = await db.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.role_id,
                u.status,
                u.created_at,
                r.role_name AS role
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ?`,
            [userId]
        );

        const updatedUser = users[0];
        let verification = null;
        let farms = [];

        if (role === "VETERINARIAN") {
            const [verifications] = await db.query(
                `SELECT
                    verification_id,
                    certificate_name,
                    specialization,
                    certificate_number,
                    verification_status,
                    submitted_at,
                    verified_at
                 FROM veterinarian_verifications
                 WHERE user_id = ?
                 ORDER BY verification_id DESC
                 LIMIT 1`,
                [userId]
            );
            if (verifications.length > 0) {
                verification = verifications[0];
            }
        } else if (role === "FARMER") {
            const [userFarms] = await db.query(
                `SELECT
                    farm_id,
                    farm_name,
                    location,
                    farm_type,
                    description,
                    created_at
                 FROM farms
                 WHERE owner_id = ?
                 ORDER BY farm_id DESC`,
                [userId]
            );
            farms = userFarms;
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
            verification,
            farms
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error updating profile" });
    }
};

module.exports = {
    register,
    registerVeterinarian,
    login,
    getProfile,
    updateProfile
};