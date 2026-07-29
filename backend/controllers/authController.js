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

module.exports = {
    register,
    login
};