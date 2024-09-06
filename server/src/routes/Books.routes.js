import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addBook, borrowBook, getAllBooks, removeBook, returnBook } from "../controllers/Books.controllers.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.middleware.js";


const bookRoute = Router()

bookRoute.route('/addbook').post(authenticateToken, authorizeRole('admin'), upload.single('bookImage'), addBook)
bookRoute.route('/removebook').post(authenticateToken, authorizeRole('admin'), removeBook)
bookRoute.route('/borrowbook').post(authenticateToken, authorizeRole('admin'),borrowBook)
bookRoute.route('/returnbook').post(authenticateToken, authorizeRole('admin'),returnBook)
bookRoute.route('/getallbook').get(getAllBooks)

export { bookRoute }