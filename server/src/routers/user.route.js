const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", authenticateToken, controller.logout);

module.exports = router;
