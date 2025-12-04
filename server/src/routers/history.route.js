const express = require("express");
const router = express.Router();
const controller = require("../controllers/history.controller");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken); // bảo vệ tất cả route

router.post("/", controller.create);
router.get("/", controller.getAll);
router.delete("/:history_id", controller.delete);

module.exports = router;
