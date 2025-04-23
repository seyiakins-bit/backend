const productController = require('../controllers/productControllers');
const express = require('express');

const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/api/create-product", upload.single("img"), productController.createProducts)
router.get("/api/product",  productController.getProducts)



module.exports = router;