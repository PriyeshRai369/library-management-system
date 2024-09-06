import { Router } from "express";
import { getStudent, studentLogin, studentLogout, studentRegistrarion } from "../controllers/Student.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(upload.single('sutdentProfilePic'),studentRegistrarion)
router.route('/login').post(studentLogin)
router.route('/logout').get(studentLogout)
router.route('/getstudent').post(authenticateToken,authorizeRole('admin'),getStudent)

export {router}