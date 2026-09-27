const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const {authMiddleware,authSystemUserMiddleware} = require('../middleware/authMiddleware');



router.post("/create", authMiddleware, transactionController.createTransaction);
router.post("/system/initial-fund", authSystemUserMiddleware,transactionController.createIntialFundTransaction);

module.exports = router;