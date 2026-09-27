const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const tokenBlackListModel = require('../models/blackList.model');

const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await userModel.create({ 
            name, 
            email, 
            password
         });
        const token = jwt.sign({ 
            user_id: user._id 
        }, process.env.JWT_SECRET, 
        { expiresIn: '3d' });

        res.cookie('token',token)

        res.status(201).json({ message: 'User created successfully', user:{
            _id: user._id,
            name: user.name,
            email: user.email
        }, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ 
            user_id: user._id 
        }, process.env.JWT_SECRET, 
        { expiresIn: '3d' });

        res.cookie('token',token)

        res.status(200).json({ message: 'User logged in successfully', user:{
            _id: user._id,
            name: user.name,
            email: user.email
        }, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const userLogout = async (req, res) => {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }



    await tokenBlackListModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    userRegister,
    userLogin,
    userLogout
};