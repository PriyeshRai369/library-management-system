import { Student } from "../models/Student.models.js";
import bcrypt from 'bcrypt'
import { generateToken } from '../helpers/generateToken.js'
import { fileUpload } from "../helpers/cloudinary.js";


export async function studentRegistrarion(req, res) {
  try {
    const { firstName, lastName, email, phone, password } = await req.body
    if (!firstName || !lastName || !email || !phone || !password) {
      res.status(400).json({ success: false, message: "All fildes are reqiured" })
    }
    const existedStudent = await Student.findOne({ email })
    if (existedStudent) {
      res.status(400).json({ success: false, message: "Student already existed with this email. Try another or login" });
    }

    let profilePicUrl = '';
    if (req.file) {
      console.log('File path before upload:', req.file.path);
      profilePicUrl = await fileUpload(req.file.path);
      if (!profilePicUrl) {
        return res.status(500).json({ success: false, message: "Failed to upload profile picture" });
      }
    }

    function generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
      }
      return result;
    }

    let uniqueStudentID;
    let isUnique = false;
    while (!isUnique) {
      uniqueStudentID = generateRandomString(6);
      const existingStudent = await Student.findOne({ studentID: uniqueStudentID });
      if (!existingStudent) {
        isUnique = true;
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await Student.create({
      firstName,
      lastName,
      studentID: uniqueStudentID,
      email,
      phone,
      sutdentProfilePic: profilePicUrl,
      password: hashedPassword,
    })

    const isStudentCreated = await Student.findOne(newStudent._id).select("-password")

    if (!isStudentCreated) {
      res.status(400).json({ success: false, message: "Can not create the new Student" })
    }
    res.status(201).json({ success: true, message: "Student registration Success.", student: isStudentCreated })
  } catch (error) {
    console.error("Error during student registration:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }

}

export async function studentLogin(req, res) {
  try {
    const { loginId, password } = await req.body
    if (!loginId || !password) {
      res.status(400).json({ success: "false", message: "All Fields are required." })
    }
    const student = await Student.findOne({
      $or: [
        { email: loginId },
        { studentID: loginId }
      ]
    })
    if (!student) {
      res.status(400).json({ success: false, message: "Can not Find Student whith this email or Student Id. Try again..." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, student.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Incorect password. Try again..." })
    }
    const accessToken = await generateToken(student)
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .json({ success: true, message: "User login success", accessToken })
  } catch (error) {
    console.error("Error during student login:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function studentLogout(req,res) {
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

export async function getStudent(req, res) {
  try {
    const {studentID} = req.body;
    if (!studentID) {
      res.status(400).json({success:false,message:"Please provide the correct student ID."})
    }
    const student = await Student.findOne({studentID}).select("-password")
    if(!student){
      res.status(400).json({success:false,message:"This studentID is invalid, please provide the correct student ID."})
    }

    res.status(200).json({success:true,message:"Student Found.",student})
  } catch (error) {
    console.log("Error while fetching Student details.",error);
    res.status(400).json({success:false,message:"Error while fetching Student details."})
  }
}