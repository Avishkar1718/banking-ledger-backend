const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Name is required'],
    },
    email:{
        type:String,
        required:[true, 'Email is required'],
        trim:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
        unique:[true, 'Email already exists']
    },
    password:{
        type:String,
        required:[true, 'Password is required'],
        minlength:[6, 'Password must be at least 6 characters'],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
    
},{
    timestamps:true
})

userSchema.pre('save', async function(){
    if(!this.isModified('password')){
        return ;
    }
    this.password=await bcrypt.hash(this.password, 10);
    
});

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;