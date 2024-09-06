import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema({
  bookName: {
    type: String,
    required: true,
    trim: true
  },
  bookImage:{
    type:String,
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  noOfBooks:{
    type:Number,
    required:true
  },
  bookId:{
    type:String,
    required:true,
    trime:true,
    unique:true
  },
  borrowedBy: [{
    studentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    borrowedDate: Date,
    dueDate: Date,
    returned: {
      type: Boolean,
      default: false
    }
  }],
  addedAt: {
    type: Date,
    default: Date.now
  }
});

export const Book = mongoose.model('Book', bookSchema);

