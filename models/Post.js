const mongoose = require('mongoose');
const moment = require('moment');

const PostSchema = new mongoose.Schema({
    bookID: {
        type: mongoose.Schema.Types.ObjectId,
		required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
		required: true
    },
    booktitle: {
        type: String,
        required: true, 
    },
    username: {
        type: String,
        required: true, 
    },
    posterProfile: {
        type: String,
        required: false,
        default:""
    },
    pic: {
        type: String,
        required: false,
        default:"" // if no pic, use empty string
    },
    content: {
        type: String,
        required: false,
        default:""
    },
    time: {
        type: String,
        required: false
    },
    likedBy:{
        type: [mongoose.Schema.Types.ObjectId],
        default:[]
    },
    collectedBy:{
        type: [mongoose.Schema.Types.ObjectId],
        default:[]
    },
    // for index.html display
    order: {
        type: Number,
        default: -1
    },
});

const imageSchema = mongoose.Schema({
    image_id: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    created_at: {
        type: String,
        required: false
    },
});


PostSchema.pre('save', function(next) {
    this.time = moment(this.time).format('MM-DD-YYYY');
    next();
});

const Post = mongoose.model("Post", PostSchema);
const Image = mongoose.model('Image', imageSchema);

module.exports = { Post, Image };