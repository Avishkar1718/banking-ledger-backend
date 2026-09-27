const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const accountController = require('../controllers/accountController');

router.post('/create-account', authMiddleware, accountController.createAccount);
router.get('/my-accounts', authMiddleware, accountController.getUserAccounts);
router.get('/balance/:accountId', authMiddleware, accountController.getAccountBalance);



module.exports = router;