/* server.js - user & resource authentication */
// Modular version, with express routes imported separately.
'use strict';
const log = console.log
const path = require('path')
const fs = require("fs");

const express = require('express')
// starting the express server
const app = express();

// mongoose and mongo connection
const { ObjectID, ObjectId } = require('mongodb')
const { mongoose } = require('./db/mongoose');
const { Post, Image } = require('./models/Post')
const { Book, BookList } = require('./models/Book')
const { User } = require('./models/User')

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dp3ndonmv',
    api_key: '264429449941826',
    api_secret: 'zkXIf4zbe0uJDkrTTogQEIlFtNg'
});

// body-parser: middleware for parsing HTTP JSON body into a usable object
const bodyParser = require('body-parser') 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));


/*****************************************/
function isMongoError(error) { // checks for first error returned by promise rejection if Mongo database suddently disconnects
	return typeof error === 'object' && error !== null && error.name === "MongoNetworkError"
}

// helper: check mongo connection error
const mongoChecker = (req, res, next) => {
	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return;
	} else {
		next()	
	}	
}

//helper: check session cookies
const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/index.html?userID='+req.session.user._id); // not sure
    } else {
        next(); // next() moves on to the route.
    }    
};

// Middleware for authentication of resources
const authenticate = (req, res, next) => {

	if (req.session.user) {
		User.findById(req.session.user).then((user) => {
			if (!user) {
				return Promise.reject()
			} else {
				req.user = user
				next()
			}
		}).catch((error) => {
			res.status(401).send("Unauthorized")
		})
	} else {
		res.status(401).send("Unauthorized")
	}
}

// Middleware for update booklist operation checking
const booklistModifyValidation = (req, res, next) =>{
	const validTargets =['likedBy','collectedBy','listDescription','books']
	const validOperation = ['add', 'reduce', 'new']
	if (!validTargets.includes(req.body.target) | !validOperation.includes(req.body.operation)){
		res.status(400).send("bad request on checking booklistModifyValidation")
		return Promise.reject() 
	} else {
		next()
	}
}


/*** Session handling **************************************/
// express-session for managing user sessions
const session = require('express-session');
const res = require('express/lib/response');

/// Middleware for creating sessions and session cookies.
// A session is created on every request, but whether or not it is saved depends on the option flags provided.
app.use(session({
    secret: '309BookLand', // later we will define the session secret as an environment variable for production. for now, we'll just hardcode it.
    cookie: { // the session cookie sent, containing the session id.
        expires: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true // important: saves it in only browser's memory - not accessible by javascript (so it can't be stolen/changed by scripts!).
    },
    // Session saving options
    saveUninitialized: false, // don't save the initial session if the session object is unmodified (for example, we didn't log in).
    resave: false, // don't resave an session that hasn't been modified.
}));



// A route to logout a user
app.get('/logout', (req, res) => {
	// Remove the session
	req.session.destroy((error) => {
		if (error) {
			res.status(500).send(error)
		} else {
			res.redirect('/')
		}
	})
})

/*******************************************************************/
/** Import the various routes **/
// Webpage routes
// app.use(require('./routes/webpage'))
// User and login routes
// app.use(require('./routes/users'))
// Student API routes
// app.use(require('./routes/student'))

app.use("/", express.static(path.join(__dirname + '/public')));
app.use("/public/html", express.static(path.join(__dirname + '/public/html')));
app.use('/public/css', express.static(path.join(__dirname + '/public/css')));
app.use('/public/js', express.static(path.join(__dirname + '/public/js')));
app.use('/public/img/static', express.static(path.join(__dirname + '/public/img/static')));
app.use('/user', express.static(path.join(__dirname + '/user')))

/*******************************************************************/

app.get('/', sessionChecker, (req, res) => {
	res.sendFile(__dirname + '/index.html')
})

app.get('/login',sessionChecker, (req, res) => {
	res.sendFile(__dirname + '/public/html/login.html') 
})

app.get('/register', sessionChecker, (req, res) => {
	res.sendFile(__dirname + '/public/html/register.html')
})

/*******************************************************************/
/*******************************************************************/
// login verify
app.get('/login/:username/:password', mongoChecker, async (req, res) => {
	const username = req.params.username
	const password = req.params.password

    try {
		const user = await User.findByNamePassword(username, password);
		if (!user) {
			console.log("does not match")
			res.status(404).send("user")
		} else {   
			// Add the user's id and username to the session.
            // We can check later if the session exists to ensure we are logged in.
			if (user.isActivate == false){
				console.log("blocked")
				res.status(400).send("status")
			}
			else{
				req.session.user = user._id;
            	req.session.username = user.username
				res.send({user})
			}
		}
    } catch (error) {
    	if (isMongoError(error)) {
			res.status(500).send(error)}
		else {
			console.log("does not match")
			res.status(404).send("user")
		}
    }
})

// register verify
app.get('/register/:username', mongoChecker, async (req, res) => {
	const username = req.params.username

    try {
		const user = await User.findOne({username: username});
		if (!user) {
			res.status(404).send("register")
		} else {   
			res.send({user})
		}
    } catch (error) {
    	if (isMongoError(error)) {
			res.status(500).send(error)
		}
    }
})

/*********** USERs ************/
// get all users
app.get('/api/users', mongoChecker, async (req, res)=>{
	try {
		const users = await User.find()
		res.send({users})
	} catch(error) {
		log(error)
		res.status(500).send("Internal Server Error")
	}
})

// get user by id
app.get('/api/users/:id', mongoChecker, async (req, res)=>{
	const id = req.params.id

	if (!ObjectId.isValid(id)) {
		res.status(404).send() 
		return;
	}
	try {
		const user = await User.findOne({_id: id})
		if (!user) {
			res.status(404).send('Resource not found')  // could not find this user
		} else { 
			res.send({user})
		}
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error')  // server error
	}
})


app.post('/api/addUser', mongoChecker, async (req, res)=>{ 
    const newUser = new User({
		username: req.body.username,
        password: req.body.password
	})
	// initially admin create
	if (req.body.type){
		newUser.type = req.body.type
	}

    try {
		const user = await newUser.save()
		res.send({user})
	} catch(error) {
		if (isMongoError(error)) {
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('Bad Request')
		}
	}
})


app.delete('/api/deleteUser/:userID',mongoChecker, async (req, res)=>{ 
    const user = req.params.userID

	try {
		const deleteUser = await User.findOneAndRemove({_id: user})
		if (!deleteUser) {
			res.status(404).send("no such a user")
		} else {   
			res.send({deleteUser})
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on delete user") // server error, could not delete.
	}
})



app.get('/user/template', mongoChecker, async (req, res)=>{
	try {
		res.sendFile(__dirname + '/public/html/user.html');
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error');
	}
})

// get user by id
app.get('/user/:userID', mongoChecker, async (req, res)=>{
	const id = req.params.userID
	if (!ObjectId.isValid(id)) {
		res.status(404).send() 
		return;
	}
	try {
		res.redirect('/user/template?userID=' + id);
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error')  // server error
	}
})


//todo
app.get('/user/:userID/:visitID', mongoChecker, async (req, res)=>{
	const userID = req.params.userID
	const visitID = req.params.visitID
	if (!ObjectId.isValid(userID) || !ObjectId.isValid(visitID)) {
		res.status(404).send() 
		return;
	}
	try {
		res.redirect('/user/template?visitID=' + visitID + '&userID=' + userID);
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error')  // server error
	}


})

// update user information (signature, profilePhoto, isActivate, lists)
app.patch('/api/users/:userID', async (req, res)=>{
    const userID = req.params.userID
    if (!ObjectId.isValid(userID)) {
		res.status(404).send('invalid user id type') 
		return
	}
	const operation = req.body.operation
	const value = req.body.value
	
	try {
		const user = await User.findOne({_id: userID})
		if (!user) {
			res.status(404).send("no such a user")
		} else {  
			if (operation == 'signature'){
				user.signature = value
			} else if (operation == 'profile') {
				user.profilePhoto = value
			} else if (operation == 'postList') {
				user.postList = value
			} else if (operation == 'booklistList') {
				user.booklistList = value
			} else if (operation == 'postCollection') {
				user.postCollection = value
			} else if (operation == 'booklistCollection') {
				user.booklistCollection = value
			}else if (operation == 'isActivate') {
				user.isActivate = value
			} else {
				res.status(404).send('invalid operation')
			}
		}
		user.save().then((updatedUser) => {
			res.send({user: updatedUser})
		})
	} catch(error) {
		log(error)
		res.status(500).send("server error on find user")
	}
})



/************** POSTS ************/
app.get('/api/posts', mongoChecker, async (req, res) => {
	try {
		const posts = await Post.find()
		res.send({ posts })
	} catch(error) {
		log(error)
		res.status(500).send("Internal Server Error")
	}
})


app.get('/api/posts/:postID', mongoChecker, async (req, res) => {
	const postID = req.params.postID

	if (!ObjectId.isValid(postID)) {
		res.status(404).send() 
		return;
	}
	try {
		const post = await Post.findOne({_id: postID})
		if (!post) {
			res.status(404).send('Resource not found')  // could not find this post
		} else { 
			res.send({post});
		}
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error')  // server error
	}
})

// delete post
app.delete('/api/posts/:postID', mongoChecker, async (req, res)=>{
    const postID = req.params.postID
    if (!ObjectId.isValid(postID)) {
		res.status(404).send('invalid post id type') 
		return
	}
	try {
		const forDelete = await Post.findOne({_id: postID})
		const user = await User.findOne({_id:forDelete.userID})
		if (!forDelete | !user) {
			res.status(404).send("no such a book or user")
		} else {
			const curr_posts = user.postList  
			const newValue = curr_posts.filter((post) => !post.equals(postID))
			const result = await Post.findByIdAndDelete({_id: postID})
			const update = await User.findOneAndUpdate({_id: forDelete.userID}, {$set: {postList:newValue}}, {new: true})
			const allUsers = await User.find()
			for (let i=0;i<allUsers.length;i++){
				const curr_postlists = allUsers[i].postCollection   
				const newValue = curr_postlists.filter((bl) => !bl.equals(postID))
				const update = await User.findOneAndUpdate({_id: allUsers[i]._id}, {$set: {postCollection:newValue}}, {new: true})
			}
			res.send({ postID:result, creator: update})
		}
		    // TODO: pending deleting collection list
			// const users = await User.find();
			// users.forEach(function(user){
			// 	let postIndex = user.postList.indexOf(postID)
			// 	if (postIndex != -1){
			// 		user.postList.splice(postIndex, 1);
			// 	}
			// 	let postCollectIndex = user.postCollection.indexOf(postID);
			// 	if (postCollectIndex != -1){
			// 		user.postCollection.splice(postCollectIndex, 1);
			// 	}
			// 	user.save();
			// }).then(
			// 	res.send({users})
			// )
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error')
	}
})

// create post
app.post('/api/addPost', mongoChecker, async (req, res)=>{
	const newPost = new Post({
		bookID: req.body.bookID,
		userID: req.body.userID,
		booktitle: req.body.booktitle,
		username: req.body.username,
	})
	if (req.body.pic){
		newPost.pic = req.body.pic
	}
	if (req.body.posterProfile){
		newPost.posterProfile = req.body.posterProfile
	}
	if (req.body.content){
		newPost.content = req.body.content
	}
	if (req.body.order){
		newPost.order = req.body.order
	}

    try {
		const result = await newPost.save()	
		const user1 = await User.findById(req.body.userID)
		if (!user1){
			res.status(404).send("no such user")
		}
		else{
			user1.postList.push(result)
			const user = await user1.save()
			res.send({post: result, user: user})
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error to create post")
	}

})

// update order
app.patch('/api/postsorder/:postID', async (req, res)=>{
    const postID = req.params.postID

	if (!ObjectId.isValid(postID)) {
		res.status(404).send('invalid post id type') 
		return
	}
	const value = req.body.value // value: order
	
	try {
		const post = await Post.findOne({_id: postID})
		if (!post) {
			res.status(404).send("no such a post or user")
		}
		else { 
			 post.order = value;
		}
		post.save().then((updatedPost) => {
				res.send({post: updatedPost})
		})
	} catch(error) {
		log(error)
		res.status(500).send("server error on find post")
	}
})



// update post
app.patch('/api/posts/:postID', async (req, res)=>{
    const postID = req.params.postID
    if (!ObjectId.isValid(postID)) {
		res.status(404).send('invalid post id type') 
		return
	}
	const operation = req.body.operation // operation: add, reduce
	const value = req.body.value // value: userID
	const target = req.body.target // target: likes, collects
	
	try {
		const post = await Post.findOne({_id: postID})
		const user = await User.findOne({_id:value})
		if (!post || !user) {
			res.status(404).send("no such a post or user")
		}
		 else { 
			if (target == 'likes') {
				if (operation == 'add'){
					if (!post.likedBy.includes(value)){
						post.likedBy.push(value);
					}
				} else if (operation == 'reduce'){
					let user_index = post.likedBy.indexOf(value);
					if (user_index != -1){
						post.likedBy.splice(user_index, 1);
					}
				} else {
					res.status(404).send('invalid operation in request body')
				}	
			} 
			else if (target == 'collects') {
				if (operation == 'add') {
					if (!post.collectedBy.includes(value) && !user.postCollection.includes(postID)){
						post.collectedBy.push(value);
						user.postCollection.push(postID);
					}
				} else if (operation == 'reduce') {
					let user_index = post.collectedBy.indexOf(value);
					let post_index = user.postCollection.indexOf(postID);
					if ((user_index != -1) && (post_index != -1)) {
						post.collectedBy.splice(user_index, 1)
						user.postCollection.splice(post_index, 1)
					}
				} else {
					res.status(404).send('invalid operation in request body')
				}
			} else {
				res.status(404).send('invalid target in request body')
			}
			
		}
		post.save().then((updatedPost) => {
			user.save().then((updatedUser) => {
				res.send({post: updatedPost, user: updatedUser})
			})
		})
	} catch(error) {
		log(error)
		res.status(500).send("server error on find post")
	}
})


/*********** BOOKs ************/

// get all books 
app.get('/api/books', mongoChecker, async (req, res)=>{
	try {
		const books = await Book.find()
		res.send({ books })
	} catch(error) {
		log(error)
		res.status(500).send("Internal Server Error")
	}
})

// display book main page
app.get('/BookMain/:userID?', async (req, res) => {
	const query = req.query
	const user = query.userID

	if (!user){
		res.sendFile(__dirname + '/public/html/BookMainPage.html')
	} else {
		try {
			const target = await User.findOne({_id: user})
			res.sendFile(__dirname + '/public/html/BookMainPage.html')
		} catch(error) {
			log(error)
			res.status(500).send("server error on find a book")
		}
	}
})

// find one book
app.get('/api/book', mongoChecker, async (req, res) => {
    const query = req.query
    const book = query.bookID
    if (!ObjectId.isValid(book)) {
		res.status(404).send('invalid book id type') 
		return
	}
	try {
		const target = await Book.findOne({_id: book})
		if (!target) {
			res.status(404).send("no such a book")
		} else {   
			res.send(target)
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on find a book")
	}
})

// delete book
app.delete('/api/book/:bookID', async (req, res)=>{
    const book = req.params.bookID
    if (!ObjectId.isValid(book)) {
		res.status(404).send('invalid book id type') 
		return
	}
	try {
		const deleteBook = await Book.findOneAndRemove({_id: book})
		if (!deleteBook) {
			res.status(404).send("no such a book")
		} else {   
			const allBooklist = await BookList.find() // delete book from all booklist involved
			for (let i=0;i<allBooklist.length;i++){
				const curr_books = allBooklist[i].books   
				const newValue = curr_books.filter((curr_book) => !curr_book._id.equals(book))
				const update = await BookList.findOneAndUpdate({_id: allBooklist[i]._id}, {$set: {books:newValue}}, {new: true})
			}
			let deletedPost = []
			const allPosts = await Post.find() // delete book from all booklist involved
			for (let i=0;i<allPosts.length;i++){
				if (allPosts[i].bookID == book){
					const update = await BookList.findOneAndDelete({_id: allPosts[i]._id}, {$set: {books:newValue}}, {new: true})
					deletedPost.push(allPosts[i]._id)
				}
			}
			const allUsers = await User.find() // delete book from all users postlist and post collection
			for (let i=0;i<allUsers.length;i++){
				const curr_post = allUsers[i].postList
				const curr_post_collect = allUsers[i].postCollection
				const new_post = curr_post.filter((post) => !post.equals(book))
				const new_post_collect = curr_post_collect.filter((post) => !post.equals(book))
				const update = await BookList.findOneAndUpdate({_id: allBooklist[i]._id}, 
					{$set: {postList:new_post, postCollection:new_post_collect}}, 
					{new: true})
			}
			res.send(deleteBook)
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on delete book")
	}
})

app.post('/api/book', async (req, res)=>{ // not sure the config for book id

    const newBook = new Book({
		name: req.body.name,
        author: req.body.author,
		year: req.body.year,
		coverURL: req.body.coverURL,
        description: req.body.description,
        postCollection: []
	})
    try {
		const result = await newBook.save()	
		res.send(result)
	} catch(error) {
		log(error) // log server error to the console, not to the client.
		if (isMongoError(error)) { // check for if mongo server suddenly dissconnected before this request.
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('Bad Request') // 400 for bad request gets sent to client.
		}
	}
})


/*********** Booklist ************/

// get all booklists
app.get('/api/booklists', mongoChecker, async (req, res)=>{
	try {
		const booklists = await BookList.find()
		res.send({ booklists })
	} catch(error) {
		log(error)
		res.status(500).send("Internal Server Error")
	}
})

app.get('/api/booklists/:booklistID', mongoChecker, async(req, res)=>{
    const booklistID = req.params.booklistID
    if (!ObjectId.isValid(booklistID)) {
		res.status(404).send('invalid book id type') 
		return
	}
	try {
		const booklist = await BookList.findOne({_id: booklistID})
		if (!booklist) {
			res.status(404).send("no such a booklist")
		} else {   
			res.send(booklist)
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on find a booklist")
	}
})

// add booklist & add into the creator's booklist collection
app.post('/api/booklist', mongoChecker, async (req, res)=>{
	const booksIDs = req.body.books
	// check books validation
	let books = []
	for (let i=0;i<booksIDs.length;i++){
		const book = await Book.findOne({_id: booksIDs[i]})
		if (!ObjectId.isValid(book)) {
			res.status(404).send("invalid book id")
		} else {   
			books.push(book)
		}
	}
	// check user validation
	let curr = []
	try{
		const user = await User.findOne({_id: req.body.creatorID})
		if(user.username != req.body.creator){
			res.status(400).send("unmatched creator info")
			return
		} else { // valid creator
			curr = user.booklistList
		}
	} catch(error){
		log(error) 
		if (isMongoError(error)) { 
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('no such a user could be creator') 
		}
	}

	// save the booklist
	let booklist = null
	if (books.length != booksIDs.length){
		res.status(404).send("Fail, has unfound book")
		return;
	} else {
		booklist = new BookList({
			listName: req.body.listName,
			listDescription: req.body.listDescription,
			creator: req.body.creator,
			creatorID: req.body.creatorID,
			books: books
		})
	}
    try {
		const result = await booklist.save()
		curr.push(result._id)
		const update = await User.findOneAndUpdate({_id: req.body.creatorID}, {$set: {booklistList:curr}}, {new: true})
		res.send({ booklist:result, creator:update })
	} catch(error) {
		log(error) 
		if (isMongoError(error)) { 
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('Bad Request') 
		}
	}
})

// delete a booklist & remove from the creator list & remove from all collected list in all users
app.delete('/api/booklist/:booklistID', async (req, res)=>{
    const booklist = req.params.booklistID
    if (!ObjectID.isValid(booklist)) {
		res.status(404).send('invalid booklist id type') 
		return
	}
	try {
		const forDelete = await BookList.findOne({_id: booklist})
		const user = await User.findOne({_id:forDelete.creatorID})
		if (!forDelete | !user) {
			res.status(404).send("no such a book or user")
		} else {
			const curr_booklists = user.booklistList   
			const newValue = curr_booklists.filter((bl) => !bl.equals(booklist))
			const result = await BookList.findByIdAndDelete({_id: booklist})
			const update = await User.findOneAndUpdate({_id: forDelete.creatorID}, {$set: {booklistList:newValue}}, {new: true})
			const allUsers = await User.find()
			for (let i=0;i<allUsers.length;i++){
				const curr_booklists = allUsers[i].booklistCollection   
				const newValue = curr_booklists.filter((bl) => !bl.equals(booklist))
				const update = await User.findOneAndUpdate({_id: allUsers[i]._id}, {$set: {booklistCollection:newValue}}, {new: true})
			}
			res.send({ booklist:result, creator: update})
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on delete booklist")
	}
})

// update post likes
// target: likes, collects
// operation: add, reduce
// value: userID
app.patch('/api/booklists/:booklistID', async (req, res)=>{
    const booklistID = req.params.booklistID;
    if (!ObjectId.isValid(booklistID)) {
		res.status(404).send('invalid booklist id type') 
		return
	}
	const operation = req.body.operation
	const value = req.body.value
	const target = req.body.target
	
	try {
		const booklist = await BookList.findOne({_id: booklistID})
		const user = await User.findOne({_id:value})
		if (!booklist || !user) {
			res.status(404).send("no such a booklist or user")
		} else { 
			if (target == 'likes') {
				if (operation == 'add'){
					if (!booklist.likedBy.includes(value)){
						booklist.likedBy.push(value);
					}	
				} else if (operation == 'reduce'){
					let user_index = booklist.likedBy.indexOf(value);
					if (user_index != -1){
						booklist.likedBy.splice(user_index, 1);
					}
				} else {
					res.status(404).send('invalid operation in request body')
				}	
			} else if (target == 'collects') {
				if (operation == 'add') {
					if (!booklist.collectedBy.includes(value)){
						booklist.collectedBy.push(value);
					}
					if (!user.booklistCollection.includes(booklistID)){
						user.booklistCollection.push(booklistID);
					}
					
					
				} else if (operation == 'reduce') {
					let user_index = booklist.collectedBy.indexOf(value);
					let booklist_index = user.booklistCollection.indexOf(booklistID);
					if ((user_index != -1) && (booklist_index != -1)) {
						booklist.collectedBy.splice(user_index, 1)
						user.booklistCollection.splice(booklist_index, 1)
					}
				} else {
					res.status(404).send('invalid operation in request body')
				}
			} else {
				res.status(404).send('invalid target in request body')
			}
			
		}
		booklist.save().then((updatedBooklist) => {
			user.save().then((updatedUser) => {
				res.send({booklist: updatedBooklist, user: updatedUser})
			})
			
		})
	} catch(error) {
		log(error)
		res.status(500).send("server error on find booklist")
	}
})

// update like/collect
app.patch('/api/booklist/:booklistID', booklistModifyValidation, async (req, res)=>{
    const booklist = req.params.booklistID
	const user = req.params.userID
    if (!ObjectID.isValid(booklist)) {
		res.status(404).send('invalid booklist id type') 
		return
	}
	const target = req.body.target
	const operation = req.body.operation
	const fieldsToUpdate = {}
	//let curr = 0
	let curr = []
	let who_result = null
	// check booklist validation
	try {
		const item = await BookList.findOne({_id: booklist})
		if (!item) {
			res.status(404).send("no such a booklist")
		} else {   
			curr = item[target]
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on find booklist")
	}

	// check the validation of the user who performs this update
	try {
		const who = req.body.who
		const user = await User.findOne({_id: who})
		if (!user) {
			res.status(404).send("no such a book")
		} else { // valid user, do valid operation
			// target = likedBy/collectedBy
			if (operation == 'add'){
				curr.push(user._id)
				fieldsToUpdate[target] = curr
			} else if(operation == 'reduce'){
				const newValue = curr.filter((userID) => !userID.equals(user._id))
				fieldsToUpdate[target] = newValue
			} else if(operation == 'new'){
				fieldsToUpdate[target] = req.body.value
			} else {
				res.status(404).send('invalid request body') 
				return;
			}
			// modify collect action into the booklistcolleciton
			let curr_collection = user.booklistCollection
			if( target == 'collectedBy' && operation == 'add'){ // validation check already done in the middleware
				curr_collection.push(booklist)
				who_result = await User.findOneAndUpdate({_id: user._id}, {$set: {booklistCollection:curr_collection}},{new: true})
			} else if (target == 'collectedBy' && operation == 'reduce'){
				const newValue = curr_collection.filter((bl) => !bl.equals(booklist))
				who_result = await User.findOneAndUpdate({_id: user._id}, {$set: {booklistCollection:newValue}},{new: true})
			}
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on find user")
	}
    
	try {
		const list = await BookList.findOneAndUpdate({_id: booklist}, {$set: fieldsToUpdate}, {new: true})
		if (!list) {
			res.status(404).send('Resource not found')
		} else {   
			res.send({ booklist:list, user:who_result})
		}
	} catch (error) {
		log(error)
		if (isMongoError(error)) {
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('Bad Request')
		}
	}
})

app.get('/BooklistMain', async (req, res) => {
	const query = req.query
	const user = query.userID

	if (!user){
		res.sendFile(__dirname + '/public/html/BooklistMainPage.html')
	} else {
		try {
			const target = await User.findOne({_id: user})
			res.sendFile(__dirname + '/public/html/BooklistMainPage.html')
		} catch(error) {
			log(error)
			res.status(500).send("server error on find a book")
		}
	}

})

/*********** Booklist detail ************/
app.get('/Booklist/Detail', async (req, res) => {
	const query = req.query
	const booklist = query.booklistID
	try{
		const user = query.userID
		if (!booklist){
			res.status(500).send("server error on display booklist detail page")
		}
		else { 
			res.sendFile(__dirname + '/public/html/BooklistDetail.html')
		}
	} catch {
			res.sendFile(__dirname + '/public/html/BooklistDetail.html')
		}
		
	})

app.patch('/api/booklist/content/:booklistID', booklistModifyValidation, async(req, res)=>{
	const booklist = req.params.booklistID
    if (!ObjectID.isValid(booklist)) {
		res.status(404).send('invalid booklist id type') 
		return
	}
	const target = req.body.target
	const operation = req.body.operation
	const fieldsToUpdate = {}
	try {
		const value = req.body.value
		if (!value) {
			res.status(404).send("no value")
		} else { // valid user, do valid operation
			// target = listDescription / books
			fieldsToUpdate[target] = value
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on find user")
	}
	
	try {
		const list = await BookList.findOneAndUpdate({_id: booklist}, {$set: fieldsToUpdate}, {new: true})
		if (!list) {
			res.status(404).send('Resource not found')
		} else {   
			res.send(list)
		}
	} catch (error) {
		log(error)
		if (isMongoError(error)) {
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('Bad Request')
		}
	}
})

/*********** Book detail ************/
app.get('/BookDetail', async (req, res) => {
	const query = req.query
	const book = query.bookID

	try{
		const user = query.userID
		if (!book){
			res.status(500).send("server error on display booklist detail page")
		}
		else { 
			res.sendFile(__dirname + '/public/html/BookDetail.html')
		}
	} catch {
			res.sendFile(__dirname + '/public/html/BookDetail.html')
		}

})

app.patch('/api/book/:bookID', async (req, res)=>{
	const bookID = req.params.bookID
	if (!ObjectID.isValid(bookID)) {
		res.status(404).send('invalid booklist id type') 
		return
	}
	
	const target = req.body.target
	const content = req.body.content
	const fieldsToUpdate = {}
	try {
		const item = await Book.findOne({_id: bookID})
		if (!item) {
			res.status(404).send("no such a book")
		}
	} catch(error) {
		log(error)
		res.status(500).send("server error on find booklist")
	}

	if (content){
		fieldsToUpdate[target] = content
	} else {
		res.status(404).send('invalid request body') 
		return;
 	}
	try {
		const book = await Book.findOneAndUpdate({_id: bookID}, {$set: fieldsToUpdate}, {new: true})
		if (!book) {
			res.status(404).send('Resource not found')
		} else {   
			res.send(book)
		}
	} catch (error) {
		log(error)
		if (isMongoError(error)) { // check for if mongo server suddenly dissconnected before this request.
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('Bad Request') // bad request for changing the student.
		}
	}
	
})


// a POST route to *create* an image
app.post("/api/images", multipartMiddleware, (req, res) => {

    // Use uploader.upload API to upload image to cloudinary server.
    cloudinary.uploader.upload(
        req.files.image.path, // req.files contains uploaded files
        function (result) {

            // Create a new image using the Image mongoose model
            var img = new Image({
                image_id: result.public_id, // image id on cloudinary server
                image_url: result.url, // image url on cloudinary server
            });

            // Save image to the database
            img.save().then(
                saveRes => {
                    res.send(saveRes);
                },
                error => {
                    res.status(400).send(error); // 400 for bad request
                }
            );
        });
});

// a GET route to get all images
app.get("/api/images", (req, res) => {
    Image.find().then(
        images => {
            res.send({ images }); // can wrap in object if want to add more properties
        },
        error => {
            res.status(500).send(error); // server error
        }
    );
});


/*************************************************/
// get all book and lists
app.get('/api/two', mongoChecker, async (req, res)=>{
	try {
		const books = await Book.find()
		const lists = await BookList.find()
		res.send({ books, lists})
	} catch(error) {
		log(error)
		res.status(500).send("Internal Server Error")
	}
})


/*************************************************/

// 404 route at the bottom for anything not found.
app.get('*', (req, res) => {
    res.status(404).send("404 Error: We cannot find the page you are looking for.");
    // you could also send back a fancy 404 webpage here.
  });


/*************************************************/
// Express server listening...
const port = process.env.PORT || 50001
app.listen(port, () => {
	log(`Listening on port ${port}...`)
}) 

