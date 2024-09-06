import { Admin } from "../models/Admin.models.js";
import bcrypt from 'bcrypt'
import { generateToken } from '../helpers/generateToken.js'
import { fileUpload } from "../helpers/cloudinary.js";

export async function adminSignup(req, res) {
    try {
        const { firstName, lastName, email, adminSecret, phone, password } = await req.body
        if (!firstName || !lastName || !email || !adminSecret || !phone || !password) {
            res.status(400).json({ success: false, message: "All fildes are reqiured" })
        }
        const existedAdmin = await Admin.findOne({ email })
        if (existedAdmin) {
            res.status(400).json({ success: false, message: "Admin already existed with this email. Try another or login" });
        }
        if (adminSecret !== "pkrai123" && adminSecret !== "pkrai@123") {
            res.status(400).json({ success: false, message: "You are not Authorised ADMIN, your secret is wrong conect to your head or try again." })
        }



        const hashedPassword = await bcrypt.hash(password, 10);

        let profilePicUrl = '';
        if (req.file) {
            console.log('File path before upload:', req.file.path);
            profilePicUrl = await fileUpload(req.file.path);
            if (!profilePicUrl) {
                return res.status(500).json({ success: false, message: "Failed to upload profile picture" });
            }
        }
        const newAdmin = await Admin.create({
            firstName,
            lastName,
            email,
            adminSecret,
            phone,
            adminProfilePic: profilePicUrl,
            password: hashedPassword,
        })

        const isAdminCreated = await Admin.findOne(newAdmin._id).select("-password")

        if (!isAdminCreated) {
            res.status(400).json({ success: false, message: "Can not create the new Admin" })
        }
        res.status(201).json({ success: true, message: "Admin registration Success.", student: isAdminCreated })

    } catch (error) {
        console.log("An error is encounter while admin registration", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}

export async function adminLogin(req, res) {
    try {
        const { loginId, password } = req.body
        if (!loginId || !password) {
            res.status(400).json({ success: false, message: "All fildes are reqiured" })
        }

        const admin = await Admin.findOne({
            $or: [
                { email: loginId },
                { adminSecret: loginId }
            ]
        })

        if (!admin) {
            res.status(400).json({ success: false, message: "Can not Find Admin whith this email or Admin Secret. Try again..." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Incorect password. Try again..." })
        }
        const accessToken = await generateToken(admin)
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        };
        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .json({ success: true, message: "Admin login success", accessToken })



    } catch (error) {
        console.log("An error is encounter while admin registration", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });

    }
}

export async function adminLogout(req,res) {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      };
      return res
        .status(201)
        .clearCookie("accessToken", options)
        .json({ success: true, message: "Logout Success"})
}