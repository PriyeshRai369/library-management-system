import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.models.js';
import { Student } from '../models/Student.models.js';

async function authenticateToken(req, res, next) {
    try {
        const token = req.cookies?.accessToken || req.headers['authorization']?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required. Please login." });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        let user;
        if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.id).select("-password");
        } else if (decoded.role === 'student') {
            user = await Student.findById(decoded.id).select("-password");
        } else {
            return res.status(403).json({ success: false, message: "Unauthorized identity. Invalid role." });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication Error: ", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized. Invalid or expired token." });
    }
}


function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Access denied. You are not authorized to access this resource." });
        }
        next();
    };
}

export { authenticateToken, authorizeRole };
