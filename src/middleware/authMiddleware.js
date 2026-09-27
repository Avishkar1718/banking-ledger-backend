const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const tokenBlackListModel = require('../models/blackList.model');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token||req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const isBlacklisted = await tokenBlackListModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is blacklisted"
        })
    }



        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.user_id);
       
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', error:error.message });
    }
};

const authSystemUserMiddleware=async (req,res,next)=>{
    try {
        const token = req.cookies.token||req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const isBlacklisted = await tokenBlackListModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is blacklisted"
        })
    }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.user_id).select("+systemUser");
   
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!user.systemUser) {
            return res.status(403).json({ message: 'Forbidden access not a system user' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', error:error.message });
    }

}

module.exports = {authMiddleware, authSystemUserMiddleware};