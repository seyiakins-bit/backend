const paymentControllers = require("../controllers/paymentControllers");
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

router.post("/api/initiate-payment", auth, paymentControllers.initatePayment);
router.post("/api/verify-payment", auth, paymentControllers.verifyPayment);


module.exports = router;