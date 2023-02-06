const log = console.log;
// global variables
var BooklistsNum = 0;



var BooksNum = 0; 
let BooksList = [] 
var booksID = []
class Book {
	constructor(name, author, year, coverURL, description, id) {
		this.name = name;
		this.author = author;
		this.year = year;
		this.coverURL = coverURL;
        this.description = description       
        this.postCollection = [] // collection of post ids associated with the book
		this.bookID = id;
		BooksNum++;
	}
}
// get all books 
function getBooks(){
    const url = '/api/books'
    fetch(url).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            alert('faild to get all books.')
       }                
    }).then((json) => {  //pass json into object locally
        const books = json.books
        // log(books)

        for (each of books){
            BooksList.push(new Book(each.name, each.author, each.year, each.coverURL, each.description, each._id))
        }
        selectBookToPlay(BooksList)
    }).catch((error) => {
        log(error)
    })
}

class Post {
	constructor(pid, bid, booktitle, userid, postername, posterProfile, pic, content, time, likedBy, collectedBy) {
		this.postID = pid;
        this.bookID = bid;
        this.booktitle = booktitle;
        this.userid = userid;
		this.poster = postername;
        this.posterProfile = posterProfile;
        this.pic = pic;
        this.content = content; 
        this.time = time;
        this.likes = likedBy.length; 
        this.likedBy = likedBy;
        this.collectedBy = collectedBy;
        this.booklink = null;
        this.posterlink = null;
    }
}

const posts = []; // all posts
const homeposts = []; // for admin edit
const collectedPosts = []; // collection of posts made by current user
const postul = document.querySelector('#posts ul');

let puser;
let pusertype;
let pusername;

function getPosts(){
    puser = getUserID();
    let book = getBookID();
    if (puser != 'guest') {
        const url = '/api/users/' + puser
        fetch(url).then((res) => {
            if (res.status === 200) {
                return res.json()
            } else {
                alert('Could not get this user')
            }
        }).then((json) => {
            pusertype = json.user.type
            pusername = json.user.username
            let url2 = '/api/posts'
            fetch(url2).then((res2) => {
                if (res2.status === 200) {
                    return res2.json()
                } else {
                    console.log("not found")
                }
            }).then((json2) => {
                const jsonposts = json2.posts
                for (each of jsonposts) {
                    if (each.bookID == book) {
                        // log(each)
                        posts.push(new Post(each._id, each.bookID, each.booktitle, each.userID, each.username, each.posterProfile, each.pic, each.content, each.time, each.likedBy, each.collectedBy))
                    }
                }
                // log(posts)
                for (let i = 0; i < posts.length; i++) {
                    posts[i].booklink = blinkHandlerinPost(posts[i].bookID, pusertype, getUserID())
                    posts[i].posterlink = ulinkHandler(posts[i].userid, pusertype, puser)
                }
                homepostsCreate();
                // log(posts)
                displayPosts(pusertype, posts)
                likeHandler()
                collectHandler();
                ifNeedaddButton(getUserID())
                addHandler();
                addFormForDelete()
                addActive()
                if(pusertype == 'Admin'){
                    deleteHandler();
                }
            })
        })
    }else{
        pusertype= 'guest'
        const url5 = '/api/posts'
        fetch(url5).then((res) => {
            if (res.status === 200) {
                return res.json()
            } else {
                console.log("not found")
            }
        }).then((json) => {  //pass json into object locally
            log(json)
            const jsonposts = json.posts
            for (each of jsonposts) {
                if (each.bookID == book) {
                    posts.push(new Post(each._id, each.bookID, each.booktitle, each.userID, each.username, each.posterProfile, each.pic, each.content, each.time, each.likedBy, each.collectedBy))
                }
            }

            // handle links
            for (let i = 0; i < posts.length; i++) {
                posts[i].booklink = blinkHandlerinPost(posts[i].bookID, pusertype, puser)
                posts[i].posterlink = ulinkHandler(posts[i].userid, pusertype, puser)
            }
            homepostsCreate()
            displayPosts(pusertype, posts)
        })
            .catch((error) => {
                log(error)
            })
    }
}

function homepostsCreate(){
    for (let i=0; i<posts.length; i++){
        homeposts.push(posts[i])
    }
}

function blinkHandlerinPost(bid, usertype, userid){
    // handler for book *Detail* page link
    let result;
    if (usertype == 'guest'){
        result = '/public/html/BookDetail.html?bookID='+bid
    }
    else{
        result = '/public/html/BookDetail.html?bookID='+bid+"&userID="+userid
    }
    return result; 
} 

function ulinkHandler(uid, usertype, userid){
    // handler for book *Detail* page link
    let result;
    if (usertype == 'guest'){
        result = '/public/html/login.html'
    }
    else{
        if (uid == userid){
            // visit myself
            result = "/public/html/user.html?userID="+userid
        }
        else{
            result = '/public/html/user.html?visitID='+uid+"&userID="+userid
        }
    }
    return result; 
}  

function myFunction(){
    var x = document.getElementById("myFile");
    var txt = "";
    if ('files' in x) {
      if (x.files.length == 0) {
        txt = "Select one or more files.";
      } else {
        for (var i = 0; i < x.files.length; i++) {
          txt += "<br><strong>" + (i+1) + ". file</strong><br>";
          var file = x.files[i];
          if ('name' in file) {
            txt += "name: " + file.name + "<br>";
          }
          if ('size' in file) {
            txt += "size: " + file.size + " bytes <br>";
          }
        }
      }
    } 
    else {
      if (x.value == "") {
        txt += "Select one or more files.";
      } else {
        txt += "The files property is not supported by your browser!";
        txt  += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
      }
    }
    document.getElementById("demo").innerHTML = txt;
}

function displayBookDetail(BooksList, bookID) {
    displayBookDescription(BooksList, bookID);
    // displayPosts(bookID, user);
    flipPage(1, 3);
}

// // display the book information like book cover, author...
function displayBookDescription(BooksList, id) {
    const book = BooksList.filter((book)=> book.bookID == id)
    const bookInfo = document.querySelector('#bookInfo');

    const coverContainer = document.createElement('div');

    coverContainer.className = 'coverContainer';
    const bookCover = document.createElement('img');
    bookCover.className = 'cover';
    bookCover.src = book[0].coverURL;
    coverContainer.appendChild(bookCover);
    bookInfo.appendChild(coverContainer);

    const bookIntro = document.createElement('div');
    bookIntro.className = 'bookIntro';

    const bookName = document.createElement('span');
    bookName.innerText = 'Name: ' + book[0].name

    const bookAuthor = document.createElement('span');
    bookAuthor.className = "bookAuthor";
    bookAuthor.innerText = 'Author: ' + book[0].author;
    const bookId = document.createElement('span');
    bookId.className = "bookId";
    bookId.innerText = 'bookID: ' + book[0].bookID; 
    const publish = document.createElement('span');
    publish.className = "publish" ;
    publish.innerText = "publish: " + book[0].year;

    bookIntro.appendChild(bookName);
    bookIntro.appendChild(document.createElement('br'));
    bookIntro.appendChild(bookAuthor);
    bookIntro.appendChild(document.createElement('br'));
    bookIntro.appendChild(publish);
    bookInfo.appendChild(bookIntro);

    const bookDescription = document.querySelector('#bookDescription');

    const descriContent = document.createTextNode(book[0].description)
    bookDescription.appendChild(descriContent)
}

function addDesButton(){
    const bookDescription = document.querySelector('#bookDescription');
    const editDes = document.createElement('button');
    editDes.id = "DesButton"
    editDes.className = "btn btn-light"
    editDes.innerText = "Edit Description"
    editDes.addEventListener('click', profileButtonsOnClick)
    insertAfter(editDes, bookDescription)
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}


function displayPosts(user, newposts){
    // clean all before display
    postul.innerHTML = ''
    
    for (let i=0; i<100; i++){
        if (newposts[i] != null){
            let li = document.createElement('li')

            let postDiv = document.createElement('div')
            postDiv.className = 'post'
            let userDiv = document.createElement('div')
            userDiv.className = 'userProfileContainer'
            let contentDiv = document.createElement('div')
            contentDiv.className ='postContent'

            let title = newposts[i].booktitle
            let userName = newposts[i].poster
            let userProfile = newposts[i].posterProfile
            let pic = newposts[i].pic
            let content = newposts[i].content
            let time = newposts[i].time
            let likes = newposts[i].likedBy.length
            let plink = newposts[i].posterlink
            let pid = newposts[i].postID
            let bid = newposts[i].bookID
            let blink = newposts[i].booklink

            let img1 = document.createElement('img')
            img1.className='userProfile'
            img1.setAttribute('src', userProfile)
            img1.setAttribute('alt', 'profile')
            userDiv.appendChild(img1)

            let userh3 = document.createElement('h3')
            let a1 = document.createElement('a')
            a1.className = 'linkColor'
            a1.setAttribute('href', plink)
            a1.innerText = userName
            a1.onclick = function open(e){
                e.preventDefault();
                window.location.href=(a1.href)
            }
            let spanid2 = document.createElement('span')
            spanid2.className = 'postId'
            spanid2.innerText = pid
            userh3.appendChild(a1)
            userh3.appendChild(spanid2) // Post id is here

            contentDiv.appendChild(userh3)

            let pbook = document.createElement('p')
            pbook.innerText = 'Book Name: '
            let span1 = document.createElement('span')
            let a2 = document.createElement('a')
            a2.className = 'linkColor'
            a2.setAttribute('href', blink)
            a2.innerText = title
            a2.onclick = function open(e){
                e.preventDefault();
                window.location.replace(a2.href)
            }
            span1.appendChild(a2)
            let span2 = document.createElement('span')
            span2.className = 'postTime'
            span2.innerText = time

            let spanid3 = document.createElement('span')
            spanid3.className = 'bookId'
            spanid3.innerText = ' bookID: '
            let spanid4 = document.createElement('span')
            spanid4.className = 'bookId'
            spanid4.innerText = bid

            pbook.appendChild(span1)
            pbook.appendChild(span2)
            pbook.appendChild(spanid3) 
            pbook.appendChild(spanid4) // Book id is here
            contentDiv.appendChild(pbook)

            let p = document.createElement('p')
            p.innerText = content
            contentDiv.appendChild(p)

            if (pic != ''){
                let img2 = document.createElement('img')
                img2.className='postContentPicture'
                img2.setAttribute('src', pic)
                img2.setAttribute('alt', 'pic')
                contentDiv.appendChild(img2)
            }

            let br = document.createElement('br')
            contentDiv.appendChild(br)

            if(user != 'guest'){
                let likeh5 = document.createElement('h5')
                let icon = document.createElement('i')
                icon.className = 'fa fa-heart'
                icon.innerText = ' '+likes
                let button = document.createElement('button')
                button.className = 'btn btn-outline-primary'
                button.classList.add('like')
                button.innerText = 'Like'
                let button2 = document.createElement('button')
                button2.className = 'btn btn-outline-success'
                button2.classList.add('collect')
                button2.innerText = 'Collect'
                likeh5.appendChild(icon)

                if (newposts[i].likedBy.indexOf(getUserID()) != -1){
                    button.classList.add('dislike')
                    button.classList.remove('like')
                    button.innerText = 'Dislike'
                } else {
                    button.classList.add('like')
                    button.classList.remove('dislike');
                    button.innerText = 'Like'
                }

                if (newposts[i].collectedBy.indexOf(getUserID()) != -1){
                    button2.classList.remove('collect');
                    button2.classList.add('collected');
                    button2.innerText = 'Collected!';
                } else {
                    button2.classList.remove('collected');
                    button2.classList.add('collect');
                    button2.innerText = 'Collect';
                }

                let button3 = document.createElement('button')
                if(user == 'Admin'){
                    button3.innerText = 'Delete'
                    button3.className = 'btn btn-outline-danger'
                    button3.id = 'delete3'
                    likeh5.appendChild(button3)
                }
                likeh5.appendChild(button2)
                likeh5.appendChild(button)
                contentDiv.appendChild(likeh5)
            }

            postDiv.appendChild(userDiv)
            postDiv.appendChild(contentDiv)

            li.appendChild(postDiv)
            postul.appendChild(li)
        }
    }
    flipPage(1,3)
}

function displayAddPost(){
    let addPostTitle = document.getElementById('addPostTitle');
    addPostTitle.innerText = 'Add Post';
    let addPostContent = document.getElementsByClassName("mb-0, justify")[0];

    addPostContent.innerHTML = '';

    let br = document.createElement('br');
    addPostContent.innerHTML += 'Thoughts:' +'<br>'

    let textarea = document.createElement('textarea');
    textarea.id = 'postContent';
    textarea.rows = '5';
    textarea.cols = '40';
    textarea.name = 'description';
    textarea.placeholder = 'Enter details here...';
    addPostContent.appendChild(textarea)
    addPostContent.appendChild(br)

    addPostContent.innerHTML += 'Picture:' +'<br>'
    
    let pic = document.createElement('input');
    pic.type = 'file';
    pic.id = 'myFile';
    pic.size = '1';
    pic.name = 'postImage'
    pic.onchange = "myFunction()";
    pic.multiple = true;
    addPostContent.appendChild(pic) 

    let demo = document.createElement('p');
    demo.id = 'demo';
    addPostContent.appendChild(demo);

    let submit = document.createElement('button');
    submit.type = 'submit';
    submit.id = 'addPost';
    submit.innerText = 'Add';
    submit.className = "addSubmit, btn btn-outline-dark";

    addPostContent.appendChild(submit)
}


// page flip
function flipPage(pageNo, pageLimit) {
    const allPosts = document.getElementById("post-body")
    const totalSize = allPosts.children.length
    let totalPage = 0
    const pageSize = pageLimit
    
    // calculate the page num and set up every page:
    if (totalSize / pageSize > parseInt(totalSize / pageSize)) {
        totalPage = parseInt(totalSize / pageSize) + 1;
    } else {
        totalPage = parseInt(totalSize / pageSize);
    }

    // build every page label and assign onclick function
    const curr = pageNo
    const startRow = (curr - 1) * pageSize + 1
    let endRow = curr * pageSize
    endRow = (endRow > totalSize) ? totalSize : endRow;
    let strHolder = ""
    let previousStr = "Previous&nbsp;&nbsp;&nbsp;&nbsp;"
    let spaceStr = "&nbsp;&nbsp;&nbsp;&nbsp;"
    let nextStr = "Next&nbsp;&nbsp;&nbsp;&nbsp;"
    let setupStr = "<a class=\"pagelink\" href=\"#\" onClick=\"flipPage("
    // single page is enough
    if (totalPage <= 1){
        strHolder = previousStr + setupStr + totalPage + "," + pageLimit + ")\">" + "1" + spaceStr + "</a>" + nextStr
    } else { //multipages
        if (curr > 1) {
            strHolder += setupStr + (curr - 1) + "," + pageLimit + ")\">"+previousStr+"</a>"
            for (let j = 1; j <= totalPage; j++) {
                strHolder += setupStr+ j + "," + pageLimit + ")\">" + j + spaceStr + "</a>"
            }
        } else {
            strHolder += previousStr;
            for (let j = 1; j <= totalPage; j++) {
                strHolder += setupStr+ j + "," + pageLimit + ")\">" + j + spaceStr +"</a>"
            }
        }
        if (curr < totalPage) {
            strHolder += setupStr + (curr + 1) + "," + pageLimit + ")\">"+nextStr+"</a>"
            
        } else { strHolder += nextStr }
    }

    // separate different display style for different tr element
    for (let i = 1; i < (totalSize + 1); i++) {
        const each = allPosts.children[i - 1];
        if (i >= startRow && i <= endRow) {
            each.className="normalTR"
        } else {
            each.className="endTR"
        }
    }
    document.getElementById("pageFliper").innerHTML = strHolder;
}

function selectBookToPlay(BooksList){
    if (window.location.href.split('?')[1] == null){
        return;
    } else if (window.location.href.split('?')[1].split('&').length === 1){ // guest visit any booklist
        const currentBookID = window.location.href.split('?')[1].split('bookID=')[1].split('.')[0]
        displayBookDetail(BooksList, currentBookID)
    } else { // admin & user
        const currentBookID = getBookID()
        displayBookDetail(BooksList, currentBookID)
    }
}

function addActive(){
    const userBlock = document.getElementById('userLoginInfo');
    log(000)
    if(pusertype != 'guest'){
        log(111)
        if(userBlock && userBlock.children){
            log(222)
            userBlock.children[0].className = 'active';
        }
    }
}

/* If 'Edit' is clicked, display edition page.
   If 'Submit' is clicked, display confirmed information */
function profileButtonsOnClick(e) {
    let userInfo = e.target.parentElement;
    let profileButton = document.getElementById('DesButton');
    if (e.target.innerHTML == 'Edit Description') {
        userInfo.removeChild(document.getElementById('bookDescription'));
        let sigForm = document.createElement('input');
        sigForm.type = 'text';
        sigForm.id = 'sigForm';
        userInfo.insertBefore(sigForm, profileButton);
        profileButton.innerHTML = 'Submit';
    }
    else if (e.target.innerHTML == 'Submit') {
        let signature = document.getElementById('sigForm').value;
        const selectedBook = BooksList.filter((book) => book.bookID == getBookID())
        modifyDescription(getBookID(), 'description', signature)
        userInfo.removeChild(document.getElementById('sigForm'));
        let newSignature = document.createElement('div');
        newSignature.id = 'bookDescription';
        newSignature.className = 'bookDescription';
        // log(selectedBook[0].description)
        newSignature.innerHTML = selectedBook[0].description;
        userInfo.insertBefore(newSignature, profileButton);
        profileButton.innerHTML = 'Edit Description';
    }
}

function likeHandler(){
    const likefield = document.querySelector('#left-part')
    likefield.addEventListener('click', like)
}

function like(e){
    e.preventDefault(); // prevent default action
    let contentDiv
    if(e.target.parentElement){
        contentDiv = e.target.parentElement.parentElement
    }
    let icon
    if(e.target.parentElement){
        icon = e.target.parentElement.getElementsByClassName('fa fa-heart')[0];
    }
    let onePost 
    if(e.target.parentElement){
        onePost = e.target.parentElement.parentElement.parentElement.parentElement
    } 
    let i
    if(e.target.parentElement && onePost.parentElement){
        i = Array.from(onePost.parentElement.children).indexOf(onePost)
    }
    let postID
    if(e.target.parentElement && e.target.parentElement.parentElement.children[0].children[1]){
        postID = e.target.parentElement.parentElement.children[0].children[1].innerText
    }
    // log(posts[i])
    if (e.target.classList.contains('like')) {
        posts[i].likes++;
        log(posts[i].likes)
        icon.innerText = ' ' + posts[i].likes;
        e.target.classList.remove('like');
        e.target.classList.add('dislike');
        e.target.innerText = 'Dislike';
        // log(posts[i].postID)
        modifyLikeorCollect(postID, 'likes', "add", getUserID())
    }
    else if (e.target.classList.contains('dislike')) {
        posts[i].likes--;
        log(posts[i])
        icon.innerText = ' ' + posts[i].likes;
        e.target.classList.remove('dislike');
        e.target.classList.add('like');
        e.target.innerText = 'Like';
        modifyLikeorCollect(postID, 'likes', "reduce", getUserID())
    }
}

function collectHandler(){
    const collectfield = document.querySelector('#left-part')
    collectfield.addEventListener('click', collect);
}


function collect(e){
    e.preventDefault(); // prevent default action
    let contentDiv
    if(e.target.parentElement){
        contentDiv = e.target.parentElement.parentElement
    }
    let h3
    if(contentDiv && contentDiv.children[0]){
        h3 = contentDiv.children[0]
    }
    let pid
    if(h3 && h3.children[1]){
        pid = h3.children[1].innerText
    }

    if (e.target.classList.contains('collect')) {
        e.target.classList.remove('collect');
        e.target.classList.add('collected');
        e.target.innerText = 'Collected!';
        modifyLikeorCollect(pid, 'collects', "add", getUserID())
	}
    else if (e.target.classList.contains('collected')){
        e.target.classList.remove('collected');
        e.target.classList.add('collect');
        e.target.innerText = 'Collect';
        modifyLikeorCollect(pid, 'collects', "reduce", getUserID())
    }
}
function deleteHandler(){
    const deletefield = document.querySelector('#left-part')
    deletefield.addEventListener('click', delete_post)
}

function delete_post(e){
    e.preventDefault(); // prevent default action
    if (e.target.className == 'btn btn-outline-danger') {
        const contentDiv = e.target.parentElement.parentElement
        const h3 = contentDiv.children[0]
        const pid = h3.children[1].innerText
        if(e.target.innerText == 'Delete'){
            const ID = e.target.parentElement.parentElement.children[0].children[1].innerText
            log(ID)
            const form = document.getElementById("deleteForm")
            form.children[0].children[0].innerText="Confirm to delete this Post?"
            form.name = ID
            form.style.display="block"
        }
    }
}

function addHandler() {
    const addArea = document.querySelector('#addPost');
    if (addArea) {
        addArea.addEventListener('click', addNewPost)
    }
}
function addNewPost(e){
    e.preventDefault();
    const userID = getUserID();
    const currentBookID = getBookID()
    const url = '/api/books'
    const url2 = '/api/users/'+userID
    const url3 = '/api/posts'
    let book = []
    let filterPosts = []
    if (e.target.classList.contains('addSubmit,')){
        const postContent = document.getElementById('postContent').value
        fetch(url).then((res) => { 
            if (res.status === 200) {
            return res.json() 
        } else {
                res.status(500).send("Internal Server Error") // not sure
        }                
        }).then((json) => {
            const all = json.books
            for(each of all){
                if(each._id == currentBookID){
                    book.push(new Book(each.name, each.author, each.year, each.coverURL, each.description, each._id))
                }
            }
            // log(book)
            fetch(url2).then((res) => { 
                if (res.status === 200) {
                   return res.json() 
               } else {
                    console.log("not found")
               }                
            }).then((json) => {
                pusertype = json.user.type
                pusername = json.user.username
                posterProfile = json.user.profilePhoto
                const x = document.getElementById('myFile')
                var src = ''
                if(x.files.length > 0){
                    src = URL.createObjectURL(x.files[0]);
                }
                let pic = '' //gonna change in future
                booktitle = book[0].name
                modifyPost(currentBookID,userID,booktitle, pusername,posterProfile,pic,postContent);
                fetch(url3).then((res) => { 
                    if (res.status === 200) {
                       return res.json() 
                   } else {
                        console.log("not found")
                   }                
                }).then((json) =>{
                    const jsonposts = json.posts
                    for(each of jsonposts){
                        if(each.content == postContent && each.userID == userID){
                            filterPosts.push(new Post(each._id, each.bookID, each.booktitle, each.userID, each.username, each.posterProfile, each.pic, each.content, each.time, each.likedBy, each.collectedBy))
                        }
                    }
                    let newPost 
                    newPost= new Post(filterPosts[0].postID, currentBookID, booktitle, userID, pusername,posterProfile, src, postContent, filterPosts[0].time, [], [])
                    newPost.booklink = blinkHandlerinPost(currentBookID, pusertype, getUserID())
                    newPost.posterlink = ulinkHandler(puser, pusertype, puser)
                    posts.push(newPost);
                    const postContentInput = document.getElementById('postContent')
                    postContentInput.value = 'add successfully!'
                    postContentInput.style = 'color: red'
                    document.getElementById('myFile').value = null
                    document.getElementById('demo').innerHTML = ''
                    setTimeout(() => {
                        displayPosts(pusertype, posts)
                        postContentInput.value = '';
                        postContentInput.style = 'color: black'
                    }, 3 * 1000)
                    
                })
            })
        })
    }
}

// helper: get user id
function getUserID(){
    try { 
        return (window.location.href.split('?')[1].split('&')[1].split('=')[1].split('.')[0])
    } catch { 
        return 'guest'
    }
}

// helper: get book id
function getBookID(){
    return window.location.href.split('?')[1].split('&')[0].split('=')[1]
}

function ifNeedaddButton(userID){
    const url = '/api/users/'+userID
    fetch(url).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            log('faild to get user info. as guest.')
       }                
    }).then((json) => {
        return JSON.stringify(json)
    }).then((userInfo)=>{
        try{
            const userType = userInfo.split("\"type\":\"")[1].split("\"")[0]
            if(userType == 'User'){
                displayAddPost()
                addHandler()
            }else if(userType == 'Admin'){
                addDesButton();
                displayAddPost()
                addHandler()
            }
        } catch {
            log("guest")
        }
        
    }).catch((error)=>{
        log(error)
        return
    })
}

// patch modify
function modifyDescription(id, target, content){
    const url = '/api/book/'+id

    let data = {
        target: target,
        content: content
    }
    const request = new Request(url, {
        method: 'PATCH', 
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
    .then(function(res) {
        log(res)
        if (res.status === 200) {
            console.log('updated')    
        } else {
            console.log('Failed to updated')
        }
        log(res)
    }).catch((error) => {
        log(error)
    })
    location.reload()
}

function modifyLikeorCollect(id, target, operation, userID){
    let request = new Request('/api/posts/' + id, {
        method: 'PATCH',
        body: JSON.stringify({'operation': operation, 'target': target, 'value': String(userID)}),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }

    });
    fetch(request).then(function(res){
        if (res.status === 200) {
            console.log('updated')
        } else {
            console.log('failed to updated')
        }
    })
}

function modifyPost(bid, uid, bookName, username, posterProfile, pic, content){
    const url = '/api/addPost'
    let data = {
        bookID: bid,
        userID: uid,
		booktitle: bookName,
        username: username,
		posterProfile: posterProfile,
		pic: pic,
        content: content,
    }
    const request = new Request(url, {
        method: 'post', 
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
    .then(function(res) {
        if (res.status === 200) {
            console.log('added book')    
        } else {
            console.log('Failed to add')
        }
        // log(res)
    }).catch((error) => {
        log(error)
    })
}

function modifyUserpostList(postID, operation){
    const url = '/api/users/' + getUserID();
    fetch(url).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
           alert('Could not get this user')
       }   
    }).then((json) => {
        let postList = json.user.postList
        log(postList)
        if(operation == 'add'){
            postList.push(postID)
        }else if(operation == 'reduce'){
            postList.splice(postID, 1)
        }
        log(postList)
        let request = new Request(url, {
            method: 'PATCH',
            body: JSON.stringify({'operation': 'postList', 'value': postList}),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
    
        });
        fetch(request).then(function(res){
            if (res.status === 200) {
                console.log('updated')
            } else {
                console.log('failed to updated')
            }
        })
    })
}

function addFormForDelete(){
    //// dialog modal
    const wrapper = document.createElement('div')
    wrapper.id ='deleteForm'
    wrapper.className='form-popup'

    const form = document.createElement('form')
    form.className='form-container'

    const h5 = document.createElement('h5')
    h5.innerText= 'Confirm to delete the book?'
    form.appendChild(h5)

    const submit = document.createElement('button')
    submit.type = "submit"
    submit.className='addSubmit, btn'
    submit.id = 'submit_delete'
    submit.innerText='Confirm'
    submit.onclick = function confirmDelete(e){
        e.preventDefault();
        if (e.target.id == 'submit_delete'){
            const ID =document.getElementById("deleteForm").name
            const list = posts.filter((post)=> post.postID == ID )
            log(ID)
            const url = '/api/posts/'+ID
        
            let data = {
                _id: list[0].postID
            }
            const request = new Request(url, {
                method: 'delete', 
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
            });
            fetch(request)
            .then(function(res) {
                if (res.status === 200) {
                    console.log('delete post')    
                } else {
                    console.log('Failed to delete the post')
                }
                // log(res)
            }).catch((error) => {
                log(error)
            })

            for (let i=0; i<posts.length; i++){
                if (posts[i].postID == ID){
                    posts.splice(i, 1)
                }
            }
            document.getElementById("deleteForm").style.display="none"
            modifyUserpostList(list[0].postID, 'reduce')
            displayPosts(pusertype, posts)
        }
    }
    form.appendChild(submit)

    const cancel = document.createElement('button')
    cancel.type = "button"
    cancel.className='btn cancel'
    cancel.id = "cancel"
    cancel.onclick = function cancelDelete(e){e.preventDefault; document.getElementById("deleteForm").style.display='none'}
    cancel.innerText='Cancel'
    form.appendChild(cancel)
    wrapper.appendChild(form)
    document.querySelector('body').appendChild(wrapper)
}

getBooks();
getPosts();
flipPage(1,3)