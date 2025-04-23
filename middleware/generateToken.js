const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config()


function generateToken(userId, userRole) {
    try {
        const token = jwt.sign(
            { id: userId, userRole},
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        )
        return token;
    } catch (error) {
        console.log({ error: error.message })
    }
}

module.exports = { generateToken };