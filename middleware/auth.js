const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function auth (req, res, next) {
    const token = req.header("auth-token");
    try {
        if (!token) return res.status(401).json({ success: false, message: "No token, authorization denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { email: true, password: true, id: true} 
        })

        if(!user) return res.status(403).json({ success: false, message: "Forbidden" })

        req.user = user 
        next();
        
    } catch (error) {
        if(error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired, login again" })
        }
        if(error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token" })
        }
        console.log({ error: error.message })
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}


module.exports = { auth };
