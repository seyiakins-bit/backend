const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/generateToken");

exports.register = async (req, res) => {
    const { firstName, lastName, email, role, password, confirmPassword  } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email: email }})
        if(user) return res.status(400).json({ success: false, message: "User already exists"})

        if(password !== confirmPassword) return res.status(400).json({ success: false, message: "Password not match"})

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                role,
                password: hashedPassword,
            }
        });
        console.log("User Created: ", newUser);
        if(!newUser) return res.status(400).json({ success: false, message: "Could not create new user"});
        res.status(201).json({ success: true, message: "User registered successfully", data: newUser });
        
    } catch (error) {
        console.log({ error: error.message });
        return res.status(500).json({ success: false, message: "Server error" });
    }
}


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email: email }});
        if(!user) {
            return res.status(400).json({ success: false, message: "User not found"});
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log("Password: " + isValidPassword)
        if(!isValidPassword) {
            return res.status(400).json({ success: false, message: "Invalid credentials"});
        }

        const token = generateToken(user.id, user.role);
        console.log("User: ", token);
        console.log("token",token);
        return res.header("auth-token", token).status(200).json({ success: true, message: "User logged in successfully", token });

        
    } catch (error) {
        console.log({ error: error.message });
        res.status(500).json({ success: false, message: "Internal Server Error"})
    }
}