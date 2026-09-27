const accountModel = require('../models/account.model');

const createAccount = async (req, res) => {
    try {
        
        const account = await accountModel.create({ user: req.user._id });
        res.status(201).json({ message: 'Account created successfully' ,account});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserAccounts = async (req, res) => {
    try {
        
        const accounts = await accountModel.find({ user: req.user._id });
        res.status(200).json({ message: 'Accounts retrieved successfully' ,accounts});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 const getAccountBalance = async (req, res) => {
    try {
        const {accountId} = req.params;
        const account = await accountModel.findOne({ _id: accountId, user: req.user._id });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const balance = await account.getBalance();
        console.log(balance);
        
        return res.status(200).json({ message: 'Account balance retrieved successfully' ,account,balance});
    } catch (error) {
       return res.status(500).json({ message: error.message });
    }
};
module.exports = {
    createAccount,
    getUserAccounts,
    getAccountBalance
};
