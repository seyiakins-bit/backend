const cartControllers = require("../controllers/cartControllers");
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

router.post("/api/add-to-cart", auth, cartControllers.addToCart);
router.get("/api/cart", auth, cartControllers.getCart);
router.put("/api/update-cart", auth, cartControllers.updateCartItem);
router.delete("/api/delete-cart", auth, cartControllers.deleteCartItems);


module.exports = router;