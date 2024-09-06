import { Router } from "express";
import { adminLogout, adminLogin, adminSignup } from "../controllers/Admin.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const adminRouter = Router()
adminRouter.route('/signup').post(upload.single('adminProfilePic'),adminSignup)
adminRouter.route('/login').post(adminLogin)
adminRouter.route('/logout').get(adminLogout)


export {adminRouter}