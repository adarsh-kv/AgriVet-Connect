const bcrypt = require("bcryptjs");
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

        // Insert user
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

module.exports = {
    register
};