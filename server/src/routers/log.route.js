const express = require('express');
const router = express.Router();
const controller = require('../controllers/log.controller');
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken); // bảo vệ tất cả route

router.post('/', controller.create);
router.get('/:history_id', controller.getByHistory);
router.post('/translate', controller.translate);
// router.post('/text-to-speech', controller.textToSpeech);


module.exports = router;
