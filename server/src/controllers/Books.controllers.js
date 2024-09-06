import { fileUpload } from "../helpers/cloudinary.js";
import { Book } from "../models/Books.models.js";
import { Student } from "../models/Student.models.js";

export async function addBook(req, res) {
    try {
        const { bookName, author, noOfBooks, bookId } = req.body;


        if (!bookName || !author || !noOfBooks || !bookId) {
            return res.status(400).json({ success: false, message: "Enter Proper Details of Book." });
        }

        let bookImage = '';
        if (req.file) {
            console.log('File path before upload:', req.file.path);
            bookImage = await fileUpload(req.file.path);
            if (!bookImage) {
                return res.status(500).json({ success: false, message: "Failed to upload book image" });
            }
        }

        const newBook = await Book.create({
            bookName,
            author,
            noOfBooks,
            bookImage,
            bookId
        });

        res.status(201).json({ success: true, message: "Book added successfully", data: newBook });
    } catch (error) {
        console.error("Something went wrong while adding the book", error);
        res.status(500).json({ success: false, message: "Can't add book, internal server error." });
    }
}

export async function borrowBook(req, res) {
    try {
        const { studentId, bookId } = await req.body;
        if (!studentId || !bookId) {
            res.status(400).json({ success: false, message: "All fields are required." })
        }

        const book = await Book.findOne({ bookId });
        const student = await Student.findOne({ studentID: studentId });

        if (!book || !student) {
            return res.status(404).json({ success: false, message: "Book or Student not found." });
        }

        if (book.noOfBooks <= 0) {
            return res.status(400).json({ success: false, message: "No available copies of this book." });
        }

        book.borrowedBy.push({
            studentID: student._id,
            borrowedDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14))
        });

        student.borrowedBooks.push({
            bookID: book._id,
            borrowedDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14))
        });

        book.noOfBooks -= 1;
        await book.save();
        await student.save();

        res.status(200).json({ success: true, message: "Book borrowed successfully." });
    } catch (error) {
        console.error("Error borrowing book:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export async function returnBook(req, res) {
    try {
        const { studentId, bookId } = req.body;

        if (!studentId || !bookId) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const book = await Book.findOne({ bookId });
        const student = await Student.findOne({ studentID: studentId });

        if (!book || !student) {
            return res.status(404).json({ success: false, message: "Book or Student not found." });
        }

        const studentBookIndex = student.borrowedBooks.findIndex((borrow) =>
            borrow.bookID && borrow.bookID.equals(book._id)
        );
        if (studentBookIndex !== -1) {
            student.borrowedBooks[studentBookIndex].returned = true;
        }

        const bookStudentIndex = book.borrowedBy.findIndex((borrow) =>
            borrow.studentID && borrow.studentID.equals(student._id)
        );
        if (bookStudentIndex !== -1) {
            book.borrowedBy[bookStudentIndex].returned = true;
        }
        book.noOfBooks += 1;

        await student.save();
        await book.save();

        res.status(200).json({ success: true, message: "Book returned successfully." });
    } catch (error) {
        console.error("Error returning book:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export async function removeBook(req, res) {
    try {
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const book = await Book.findOne({ bookId })
        if (!book) {
            res.status(400).json({ success: false, message: "Book not found with this BookID. Try again..." })
        }

        const deletedBook = await Book.findOneAndDelete({ bookId });

        if (!deletedBook) {
            res.status(400).json({ success: false, message: "Unable to remove book. Try again after some time." })
        }
        res.status(200).json({ success: true, message: "Book removed successfully.", deletedBook })


    } catch (error) {
        console.error("Error removing book:", error);
        res.status(400).json({ success: false, message: "Internal server error." })
    }
}
export async function getAllBooks(req, res) {
    try {
        const bookList = await Book.find({});
        
        if (!bookList || bookList.length === 0) {
            return res.status(404).json({ success: false, message: "No books found." });
        }

        return res.status(200).json({ success: true, data: bookList });
    } catch (error) {
        console.error("Error getting book list:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}
