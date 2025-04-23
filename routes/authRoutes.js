
const authController = require("../controllers/authControllers");
const express = require("express");
const router = express.Router();

router.post("/api/register", authController.register);
router.post("/api/login", authController.login);

module.exports = router;