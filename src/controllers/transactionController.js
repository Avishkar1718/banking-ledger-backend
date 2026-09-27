const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');

const accountModel = require('../models/account.model');
const mongoose = require('mongoose');

const createTransaction = async (req, res) => {
    const{fromAccount, toAccount, ammount, idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !ammount || !idempotencyKey){
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const fromAccountDoc = await accountModel.findOne({_id: fromAccount});
    const toAccountDoc = await accountModel.findOne({_id: toAccount});

    if(!fromAccountDoc || !toAccountDoc){
        return res.status(400).json({ message: 'Invalid from and to accounts' });
    }

    const idempotencyKeyDoc = await transactionModel.findOne({idempotencyKey});

    if(idempotencyKeyDoc){
       if(idempotencyKeyDoc.status === 'completed'){
        return res.status(400).json({ message: 'Transaction already processed',transaction:idempotencyKeyDoc });
       }
       if(idempotencyKeyDoc.status === 'pending'){
        return res.status(200).json({ message: 'Transaction is still processing' });
       }
       if(idempotencyKeyDoc.status === 'failed'){
        return res.status(500).json({ message: 'Transaction processing failed, please try again' });
       }
       if(idempotencyKeyDoc.status === 'reversed'){
        return res.status(500).json({ message: 'Transaction was reversed, please try again' });
       }
    }


    if(fromAccountDoc.status !== 'ACTIVE' || toAccountDoc.status !== 'ACTIVE'){
        return res.status(400).json({ message: 'From account or to account must be active to process transaction' });
    }

    const balance = await fromAccountDoc.getBalance();
    if(balance < ammount){
        return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    try{

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction=(await transactionModel.create([{
        fromAccount,
        toAccount,
        ammount,
        idempotencyKey,
        status: 'pending'
    }],{session}))[0];
    console.log(transaction);


    const debitLedgerEntry=await ledgerModel.create([{
        account: fromAccount,
        ammount: ammount,
        transaction: transaction._id,
        type: 'debit'
    }],{session});
    

    const creditLedgerEntry=await ledgerModel.create([{
        account: toAccount,
        ammount: ammount,
        transaction: transaction._id,
        type: 'credit'
    }],{session});

    await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: 'Transaction created successfully', transaction });
    }
    catch(error) {

        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
            error: error.message
        })

    }
   
};

const createIntialFundTransaction = async (req, res) => {
    try {
        const {toAccount, ammount, idempotencyKey} = req.body;
    
        if(!toAccount || !ammount || !idempotencyKey){
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const toAccountDoc = await accountModel.findById(toAccount);
    
        if(!toAccountDoc){
            return res.status(404).json({ message: 'To account not found' });
        }

        const fromAccountDoc = await accountModel.findOne({user:req.user._id});
        console.log(fromAccountDoc);
        if(!fromAccountDoc){
            return res.status(404).json({ message: 'From account not found' });
        }
        const session = await mongoose.startSession();
        session.startTransaction();

        const transaction = new transactionModel({
            fromAccount: fromAccountDoc._id,
            toAccount: toAccount,
            ammount,
            idempotencyKey,
            status: 'pending'
        });
        console.log(transaction._id);

        const debitLedgerEntry=await ledgerModel.create([{
            account: fromAccountDoc._id,
            ammount:ammount,
            transaction: transaction._id,
            type: 'debit'
        }],{session});

        const creditLedgerEntry=await ledgerModel.create([{
            account: toAccount,
            ammount: ammount,
            transaction: transaction._id,
            type: 'credit'
        }],{session});

        transaction.status = 'completed';
        await transaction.save({session});

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ message: 'Transaction created successfully', transaction });
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error:error.message });
    }
}


module.exports = {
    createTransaction,
    createIntialFundTransaction
};
