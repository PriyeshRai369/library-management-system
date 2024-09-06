import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { router } from './src/routes/Student.routes.js';
import { bookRoute } from './src/routes/Books.routes.js';
import { adminRouter } from './src/routes/Admin.routes.js';

dotenv.config({path: "./.env"});



const app = express()
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json({ limit: "100kb" }))
app.use('/student',router)
app.use('/books',bookRoute)
app.use("/admin",adminRouter)
export {app}