const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();
const cloudinary = require("../config/cloudinary");


exports.createProducts = async(req, res) => {
    const { name, categoryId, trending, featured, price, description  } = req.body;
    try {
        const catId = await prisma.category.findUnique({ where: { id: parseInt(categoryId, 10)}})
        if(!catId) return res.status(400).json({ success: false, message: 'Category not found'})

        let result;
        try {
            const image = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`)
            result = image.secure_url;
            console.log("Image uploaded successfully")
        } catch (error) {
            console.log("Image uploaded failed")
        }

        const product = await prisma.product.create({
            data: {
                name,
                categoryId: parseInt(catId.id),
                trending: Boolean(trending),
                featured: Boolean(featured),
                image: result,
                price: parseInt(price),
                description
            }
        });
        if(!product) return res.status(400).json({ success: false, message: "Product upload failed"})
        res.status(201).json({ success: true, message: "Product uploaded successfully", data: product })
        
    } catch (error) {
        console.log({ error: error.message });
        res.status(500).json({ error: "internal Server error" });
    }
}

exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany()
        if(!products || products.length === 0) {
            return res.status(404).json({ success: false, message: "No products found" })
        }
        res.status(200).json({ success: true, message: "Products fetched successfully", data: products })
    } catch (error) {
        res.status(500).json({message: "Internal Server Error" });
    }
}