const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({

    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true, 'ledger must be associated with an account'],
        index:true,
        immutable:true
    },
    ammount:{
        type:Number,
        required:[true, 'ammount is required to create a ledger entry'],
        min:[0, 'ledger amount must be positive'],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true, 'ledger must be associated with a transaction'],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:['debit','credit'],
            message:'ledger type must be either debit or credit'
        },
        required:[true, 'ledger type is required'],
        immutable:true
    }
    
})
const preventLedgerModification = function(){
    throw new Error('Ledger entries are immutable and cannot be modified once created');
}

ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);

const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;
