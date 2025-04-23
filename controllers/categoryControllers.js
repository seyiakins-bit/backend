const { PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

exports.createcategory = async(req, res) => {
    try {
        const category = await prisma.category.create({ data: req.body });
        if(!category) return res.status(400).json({ success: false, message: "unable to create category"})
        res.status(201).json({ success: true, message: "category created successfully", data: category });
    } catch (error) {
        res.status(500).json({ error: "Server error"});
    }
}

exports.getAllCategory = async (req, res) => {
    try {
        const category = await prisma.category.findMany();
        if(category.length < 0 && !category){
            res.status(404).json({ success: false, message: "category not found"});
        }
        res.status(200).json({ success: true, message:"fetched category", data: category })
    } catch (error) {
        res.status(500).json({success: false, message: "server error"})
    }
}

exports.updateCategory = async(req, res) => {
    try {
        const categoryId = await prisma.category.findUnique({ where: { id: parseInt(req.params.id) }});
        console.log(categoryId.id)
        if(!categoryId) return res.status(400).json({ success: false, message: "category not found"})
        const category = await prisma.category.update({ where: { id: parseInt(categoryId.id) }, data: req.body });
        res.status(200).json({ success: true, message:"Category updated successfully", data: category }) 
    } catch (error) {
        res.status(500).json({success: false, message: "server error"})
    }
}

exports.deleteCategory = async(req, res) => {
    try {
        const categoryId = await prisma.category.findUnique({ where: { id: parseInt(req.params.id) }});
        console.log(categoryId.id)
        if(!categoryId) return res.status(400).json({ success: false, message:"category not found"})
        const category = await prisma.category.delete({ where: { id: parseInt(categoryId.id) } });
        res.status(200).json({ success: true, message:"Category deleted successfully", data: category }) 
    } catch (error) {
        res.status(500).json({success: false, message: "server error"})
    }
}