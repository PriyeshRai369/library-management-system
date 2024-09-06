import jwt from 'jsonwebtoken'

export async function generateToken(student){
    return await jwt.sign({ id: student._id, role: student.role }, process.env.SECRET_KEY, {
        expiresIn: '1d',
    });
}