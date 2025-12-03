const express = require("express");
const router = express.Router();

router.use('/user', require("./user.route"))
router.use('/history', require("./history.route"))
router.use('/log', require("./log.route"))
router.use('/saved-words', require('./savedWords.route'))

module.exports = router;