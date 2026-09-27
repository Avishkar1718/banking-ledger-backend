const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true, 'transaction must be associated with a from account'],
        index:true
    },
    toAccount:{
         type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true, 'transaction must be associated with a toAccount'],
        index:true
    },
    ammount:{
        type:Number,
        required:[true, 'transaction amount is required'],
        min:[0, 'transaction amount must be positive']
    },
   
    status:{
        type:String,
        enum:{
            values:['pending', 'completed', 'failed','reversed'],
            message:'status must be pending, completed, failed or reversed'
        },
        default:'pending'
    },

    idempotencyKey:{
        type:String,
        required:[true, 'idempotency key is required'],
        unique:true,
        index:true
        
    }
    
},{
    timestamps:true
})

const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;