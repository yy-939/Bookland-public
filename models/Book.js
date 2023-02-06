const mongoose = require('mongoose');
const moment = require('moment');
const PostSchema = mongoose.model('Post').schema


const BookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    author: {
        type: String,
        required: true,
        minlength: 1
    },
    year:{
        type: Number,
        required: true,
    },
    coverURL: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    postCollection: {
        type: [PostSchema],
        default: []
    }
});

const BooklistSchema = new mongoose.Schema({
    listName: {
        type: String,
        required: true,
        minlength: 1
    },
    listDescription: {
        type: String,
        required: false
    },
    creator: {
        type: String,
        required: true,
    },
    creatorID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    books: {
        type: [BookSchema]
    },
    createTime: {
        type: String
    },
    likedBy:{
        type: [mongoose.Schema.Types.ObjectId],
        default:[]
    },
    collectedBy:{
        type: [mongoose.Schema.Types.ObjectId],
        default:[]
    }
});

BooklistSchema.pre('save', function(next) {
    this.createTime = moment(this.createTime).format('MM-DD-YYYY');
    next();
});

const Book = mongoose.model("Book", BookSchema);
const BookList = mongoose.model("Booklist", BooklistSchema);

module.exports ={ Book, BookList };

