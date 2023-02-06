const mongoose = require('mongoose');

// Connect to our database
// NOTE: This is a cloud deployed database, the username and password are both "server"
const mongoDB = process.env.DATABASE_TOKEN;

/* mongoose.connect(mongoDB, { useNewUrlParser: true }).catch((error) => {
    console.log("Error Connecting Database Server!");
}); */

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://team10:bookland@cluster0.ur99l.mongodb.net/BookLandAPI?retryWrites=true&w=majority'

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});


module.exports = { mongoose };