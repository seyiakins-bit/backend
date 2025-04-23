const categoryController = require("../controllers/categoryControllers");
const express = require("express");
const router = express.Router();

router.post("/api/create", categoryController.createcategory);
router.get("/api/category", categoryController.getAllCategory);
router.put("/api/update/:id", categoryController.updateCategory);
router.delete("/api/deleted/:id", categoryController.deleteCategory);


module.exports = router;