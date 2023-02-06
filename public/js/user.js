// get 'posts' variable

/********** global variables **********/
let numberOfUsers = 0;
let numberOfPosts = 0;
var BooklistsNum = 0; 
var BooksNum = 0; 
const users = [];
const posts = [];
const booklists = [];
const books = [];

/********************** Object ***********************/
class User {
	constructor(username, password) {
		this.username = username;
        this.password = password;
        this.signature = null;
        this.profilePhoto = null;
        this.postList = [];
        this.booklistList = [];
        this.postCollectionList = [];
        this.booklistCollectionList = []
        this.userID = numberOfUsers;
        this.isAdmin = false;
		numberOfUsers++;
    }
}

class AdminUser extends User {
    constructor(username, password) {
        super(username, password);
        this.isAdmin = true;
    }
}

class Post {
	constructor(postID, bookID, booktitle, booklink, poster, posterProfile, pic, content, time, likes) {
		this.postID = postID;
        this.bookID = bookID;
        this.booktitle = booktitle;
        this.booklink = booklink;
		this.poster = poster;
        this.posterProfile = posterProfile;
        this.pic = pic;
        this.content = content; 
        this.time = time;
        this.likes = likes; 
    }
}

class Book {
	constructor(name, author, coverURL, description) {
		this.name = name;
		this.author = author;
		this.coverURL = coverURL; 
        this.description = description;
        this.postCollection = [] // collection of post ids associated with the book
		this.bookID = BooksNum;
		BooksNum++;
	}
}

class Booklist {
	constructor(listName, listDescription, creator, bookCollection) {
		this.listName = listName;
		this.listDescription = listDescription;
		this.creator = creator; // user id?
        this.books = bookCollection; // list of bids
		this.booklistID = BooklistsNum;
		BooklistsNum++;
        this.likes = 0;
        this.collect = 0;
        const date = new Date() 
        this.createTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
	}
}

/********************** Functions On Click ***********************/
function menuButtonsOnClick(e) {
    console.log(e.target)
    // Change button color
    changeButtonColor(e.target);
    let userID;
    if (window.location.href.indexOf('visitID') !== -1) {
        userID = window.location.href.split('?')[1].split('&')[0].split('=')[1];
    } else{
        userID = window.location.href.split('?')[1].split('=')[1];
    }
    const url = '/api/users/' + userID;
    fetch(url).then((res) => { 
        if (res.status === 200) {
            fetch(url).then((res) => { 
                if (res.status === 200) {
                   return res.json() 
               } else {
                    console.log("Could not get this user.")
               }                
            }).then((user) => {
                user = user.user
                console.log(user)
                if (e.target.innerHTML.indexOf('Posts') !== -1) {
                    displayUserPosts(user);
                }
                else if (e.target.innerHTML.indexOf('Booklists') !== -1) {
                    displayUserBooklists(user);
                }
                else if (e.target.innerHTML.indexOf('Post Collections') !== -1) {
                    displayCollectedPost(user);
                }
                else if (e.target.innerHTML.indexOf('Booklist Collections') != -1) {
                    displayCollectedBooklist(user);
                }
                else if (e.target.innerHTML.indexOf('Manage') !== -1) {
                    displayManageWindow();
                }
                else {
                    displayEditBooksWindow();
                }
            })
        }
    })
}
    
/* If 'Edit' is clicked, display edition page.
   If 'Submit' is clicked, display confirmed information */
function profileButtonsOnClick(e) {
    let userInfo = e.target.parentElement;
    let profileButton = document.getElementById('profileButton');
    if (e.target.innerHTML == 'Edit Signature') {
        userInfo.removeChild(document.getElementById('signature'));
        let sigForm = document.createElement('textarea');
        sigForm.id = 'sigForm';
        sigForm.innerHTML = "Enter signature here..";
        userInfo.insertBefore(sigForm, profileButton);
        profileButton.innerHTML = 'Submit';
    }
    else if (e.target.innerHTML == 'Submit') {
        let signature = document.getElementById('sigForm').value;
        
        userInfo.removeChild(document.getElementById('sigForm'));
        let newSignature = document.createElement('div');
        newSignature.id = 'signature';
        newSignature.innerHTML = signature;
        userInfo.insertBefore(newSignature, profileButton);
        profileButton.innerHTML = 'Edit Signature';
        
        let userID = window.location.href.split('?')[1].split('=')[1];

        let url = '/api/users/' + userID
        let request = new Request(url, {
            method: 'PATCH',
            body: JSON.stringify({'operation': 'signature', 'value': signature}),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }

        });
        fetch(request).then(function(res){
            if (res.status === 200) {
                console.log('updated')
            } else {
                console.log('failed to update')
            }
        })

    }
}


/********************** DOM Functions ************************/
function displayUserInfo(isVisit) {
    let currentUserID;
    if (window.location.href.indexOf('visitID') !== -1) {
        currentUserID = window.location.href.split('?')[1].split('&')[0].split('=')[1];
    } else{
        currentUserID = window.location.href.split('?')[1].split('=')[1];
    }
    const url = '/api/users/' + currentUserID;
    fetch(url).then((res) => { 
        if (res.status === 200) {
            fetch(url).then((res) => { 
                if (res.status === 200) {
                   return res.json() 
               } else {
                    console.log("Could not get this user.")
               }                
            }).then((user) => {  //pass json into object locally
                user = user.user;
                console.log(user);
                if (isVisit == true) {
                    document.getElementById('userInfo').removeChild(document.getElementById('profileButton'));
                }
                document.getElementById('username').innerHTML = user.username;
                document.getElementById('id').innerHTML = 'user ID: ' + String(user.userID);
                if (user.signature != null) {
                    document.getElementById('signature').innerHTML = user.signature;
                }
                if (user.profilePhoto != null) {
                    userInfo.getElementsByClassName('profilePic')[0].src = user.profilePhoto;
                }
                if (user.type == 'Admin' && isVisit == false) {
                    let buttons = document.getElementById('menubar').children[0];
                    let manageButtonLi = document.createElement("li");
                    let manageButton = document.createElement("button");
                    manageButton.innerHTML = 'Manage';
                    manageButton.className = 'btn btn-light';
                    manageButton.addEventListener('click', menuButtonsOnClick);
                    manageButtonLi.appendChild(manageButton);
                    buttons.appendChild(manageButtonLi);
                    let editBookButtonLi = document.createElement("li");
                    let editBookButton = document.createElement("button");
                    editBookButton.className = 'btn btn-light';
                    editBookButton.innerHTML = 'Edit Books';
                    editBookButton.addEventListener('click', menuButtonsOnClick);
                    editBookButtonLi.appendChild(editBookButton);
                    buttons.appendChild(editBookButtonLi);
                }
                displayUserPosts(user);

            }).catch((error) => {
                console.log(error)
            })
        }
    })          
}

function changeButtonColor(target) {
    let changeBackTarget = document.getElementsByClassName('selected')[0];
    changeBackTarget.className = 'btn btn-light';
    target.className = 'selected btn btn-dark';
}

/************ Search Bar Functions */
function blinkHandler(bid){
    // handler for book Detail page
        for (let i =0; i<books.length; i++){
            if (books[i].bookId == bid){
                let result;
                if (window.location.href.indexOf('user.html') != -1) {
                    return '../BookDetail/'+books[i].bookId+'/'+books[i].bookId+'_end_after.html'
                } else if (window.location.href.indexOf('admin.html') != -1){
                    return '../BookDetail/'+books[i].bookId+'/'+books[i].bookId+'_admin_after.html'
                } else{
                    return '../BookDetail/'+books[i].bookId+'/BookDetail-'+books[i].bookId+'.html';
                }
            }
        }   
    }
function displaySearchbox(){
    const searchbookArea = document.querySelector('.search-book')
    const t = searchbookArea.children[0]
    for (let i=0; i<books.length; i++){
        if (books[i] != null){
            const id = books[i].bookID
            const name = books[i].name
            const option = document.createElement('option')
            option.value = id
            option.innerText = name
            t.appendChild(option)
        }
    }
    const searchlistArea = document.querySelector('.search-list')
    const column = searchlistArea.children[0]
    for (let i=0; i<BooklistsNum; i++){
        if (booklists[i] != null){
            const id = booklists[i].booklistID
            const name = "[" + booklists[i].listName + "] -- " + booklists[i].creator
            const option = document.createElement('option')
            option.value = id
            option.innerText = name
            column.appendChild(option)
        }
    }
}

/********** Display functions ************ */
function _getUserByName(username) {
    let user;
    for (user of users) {
        if (user.username == username) {
            return user;
        }
    }
}

function _createPostDiv(post) {
    post = post.post;
    let userID;
    if (window.location.href.indexOf('visitID') !== -1) {
        userID = window.location.href.split('?')[1].split('&')[1].split('=')[1];
    } else{
        userID = window.location.href.split('?')[1].split('=')[1];
    }
    function likeOnClick(e){
        e.preventDefault(); // prevent default action
        let icon = e.target.parentElement.getElementsByClassName('fa fa-heart')[0];
        console.log(post._id);
        let url = '/api/posts/' + post._id;
        fetch(url).then((res) => {
            if (res.status === 200) {
                fetch(url).then((res) => { 
                    if (res.status === 200) {
                       return res.json() 
                   } else {
                        console.log("Could not get this post.")
                   }                
                }).then((post) => {
                    post = post.post
                    if (e.target.classList.contains('like')){
                        likeNum = post.likedBy.length + 1
                        icon.innerText = ' '+ likeNum; //TODO: update db
                        e.target.classList.remove('like');
                        e.target.classList.add('dislike');
                        e.target.innerText = 'Dislike';

                        let request = new Request('/api/posts/' + post._id, {
                            method: 'PATCH',
                            body: JSON.stringify({'operation': 'add', 'target': 'likes', 'value': String(userID)}),
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
                            console.log(post.likedBy);

                        })    
                    }
                    else if (e.target.classList.contains('dislike')){
                        likeNum = post.likedBy.length - 1;
                        icon.innerText = ' '+ likeNum;
                        e.target.classList.remove('dislike');
                        e.target.classList.add('like');
                        e.target.innerText = 'Like';
                        let request = new Request('/api/posts/' + post._id, {
                            method: 'PATCH',
                            body: JSON.stringify({'operation': 'reduce', 'target': 'likes', 'value': String(userID)}),
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
                            console.log(post.likedBy);

                        })    
                    }    
                }).catch((error) => {
                    console.log(error)
                })
            }
        })
    }


    function collectOnClick(e){
        e.preventDefault(); // prevent default action
        if (e.target.classList.contains('collect')){
            e.target.classList.remove('collect');
            e.target.classList.add('collected');
            e.target.innerText = 'Collected!';
            let request = new Request('/api/posts/' + post._id, {
                method: 'PATCH',
                body: JSON.stringify({'operation': 'add', 'target': 'collects', 'value': String(userID)}),
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
        else if (e.target.classList.contains('collected')){
            e.target.classList.remove('collected');
            e.target.classList.add('collect');
            e.target.innerText = 'Collect';
            let request = new Request('/api/posts/' + post._id, {
                method: 'PATCH',
                body: JSON.stringify({'operation': 'reduce', 'target': 'collects', 'value': String(userID)}),
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
    }

    function deletePostButtonOnClick(e) {
        let deletePostDiv = e.target.parentElement.parentElement.parentElement.parentElement;
        addFormForDelete('post', deletePostDiv, post._id)
        const form = document.getElementById("myForm")
        form.style.display="block"
        

    }

    let postDiv = document.createElement('div');
    postDiv.className = 'post';
    let userDiv = document.createElement('div');
    userDiv.className = 'userProfileContainer';
    let contentDiv = document.createElement('div');
    contentDiv.className ='postContent';
    

    let title = post.booktitle;
    let username = post.username;
    let userProfile = post.posterProfile;
    let pic = post.pic;
    let content = post.content;
    let time = post.time;
    let likes = post.likedBy.length;
    let pid = post._id;
    let bid = post.bookID;

    let img1 = document.createElement('img');
    img1.className='userProfile';
    img1.setAttribute('src', userProfile);
    img1.setAttribute('alt', 'profile');
    userDiv.appendChild(img1);

    let userh3 = document.createElement('h3');
    let a1 = document.createElement('a');
    a1.className = 'linkColor';
    a1.innerText = username;
    a1.onclick = function open(e){
        e.preventDefault();
        let userID;
        if (window.location.href.indexOf('visitID') !== -1) {
            userID = window.location.href.split('?')[1].split('&')[1].split('=')[1];
        } else{
            userID = window.location.href.split('?')[1].split('=')[1];
        }
        
        console.log(userID);
        console.log(post.userID);
        if (userID == post.userID){
            window.location.href = '/public/html/user.html?userID=' + userID; 
        } else{
            window.location.href = '/public/html/user.html?visitID=' + post.userID + '&userID=' + userID;
        }
    }
    let spanid2 = document.createElement('span');
    spanid2.className = 'postId';
    spanid2.innerText = pid;
    userh3.appendChild(a1);
    userh3.appendChild(spanid2); // Post id is here

    contentDiv.appendChild(userh3);

    let pbook = document.createElement('p');
    pbook.innerText = 'Book Name: ';
    let span1 = document.createElement('span');
    let a2 = document.createElement('a');
    a2.className = 'linkColor';

    let blink = '/public/html/BookDetail.html?bookID=' + bid + '&userID=' + userID;
    
    a2.setAttribute('href', blink);
    a2.innerText = title;
    a2.onclick = function open(e){
        e.preventDefault();
        window.location.href = a2.href;
    }
    span1.appendChild(a2);
    let span2 = document.createElement('span');
    span2.className = 'postTime';
    span2.innerText = time;

    let spanid3 = document.createElement('span');
    spanid3.className = 'bookId';
    spanid3.innerText = ' bookID: ';
    let spanid4 = document.createElement('span');
    spanid4.className = 'bookId';
    spanid4.innerText = bid;

    pbook.appendChild(span1);
    pbook.appendChild(span2);
    pbook.appendChild(spanid3); 
    pbook.appendChild(spanid4); // Book id is here
    contentDiv.appendChild(pbook);

    let p = document.createElement('p');
    p.innerText = content;
    contentDiv.appendChild(p);

    if (pic != null && pic != ''){
        let img2 = document.createElement('img');
        img2.className='postContentPicture';
        img2.setAttribute('src', pic);
        img2.setAttribute('alt', 'pic');
        contentDiv.appendChild(img2);
    }

    let br = document.createElement('br');
    contentDiv.appendChild(br);

    let likeh5 = document.createElement('h5')
    likeh5.className = 'likeBar'
    let icon = document.createElement('i')
    icon.className = 'fa fa-heart'
    icon.innerText = ' '+likes
    let button = document.createElement('button')
    let button2 = document.createElement('button')
    button.className = 'btn btn-outline-primary'
    button2.className = 'btn btn-outline-success'
    if (post.likedBy.indexOf(userID) != -1){
        button.classList.add('dislike')
        button.innerText = 'Dislike'
    } else {
        button.classList.add('like')
        button.innerText = 'Like'
    }

    if (post.collectedBy.indexOf(userID) != -1){
        button2.classList.add('collected')
        button2.innerText = 'Collected!'    
    } else {
        button2.classList.add('collect')
        button2.innerText = 'Collect'
    }


    
    button.addEventListener('click', likeOnClick);
    button2.addEventListener('click', collectOnClick);
    
    
    
    
    // end user: delete button only for lists created by self
    
    likeh5.appendChild(icon)
    let button3 = document.createElement('button');
    const url = '/api/users/' + userID;
    fetch(url).then((res) => { 
        if (res.status === 200) {
            fetch(url).then((res) => { 
                if (res.status === 200) {
                   return res.json() 
               } else {
                    console.log("Could not get this user.")
               }                
            }).then((user) => {
                if (userID == post.userID || user.type == 'Admin') {
                    button3.className = "btn btn-outline-danger";
                    button3.classList.add('delete');
                    button3.addEventListener('click', deletePostButtonOnClick);
                    button3.innerText = 'Delete';
                }
            })
        }
    })
    likeh5.appendChild(button3);
    likeh5.appendChild(button2)
    likeh5.appendChild(button)
    contentDiv.appendChild(likeh5)

    postDiv.appendChild(userDiv);
    postDiv.appendChild(contentDiv);
    return postDiv;
}
function displayUserPosts(user) {
    let content = document.getElementById('contents');
    content.innerHTML = ''; // Clean up contents
    if (user.postList.length == 0){
        content.innerHTML = "Don't have any post.";
        return
    }

    let ul = document.createElement('ul');
    
    let postID;
    let pageFliper = document.createElement('div');
    pageFliper.id = 'pageFliper';
    content.appendChild(ul);
    content.appendChild(pageFliper);
    for (postID of user.postList) {
        let url = '/api/posts/' + postID;
        console.log(postID);
        fetch(url).then((res) => {
            if (res.status === 200) {
                return res.json() 
            } else {
                 console.log("Could not get this post.")
            }  
        }).then((post) => {
            let li = document.createElement('li');
            li.appendChild(_createPostDiv(post));
            ul.appendChild(li);
            filpPage(1, 2);
        })
    }   
}

function _createBooklistDiv(booklist) {
    console.log(booklist);
    let userID;
    if (window.location.href.indexOf('visitID') !== -1) {
        userID = window.location.href.split('?')[1].split('&')[1].split('=')[1];
    } else{
        userID = window.location.href.split('?')[1].split('=')[1];
    }
    function likeOnClick(e){
        e.preventDefault(); // prevent default action
        let url = '/api/booklists/' + booklist._id
        fetch(url).then((res) => {
            if (res.status === 200) {
                fetch(url).then((res) => {
                    if (res.status === 200) {
                        return res.json() 
                    } else {
                        console.log("Could not get this booklist.")
                    }                
                }).then((booklist) => {
                    if (e.target.parentElement.classList.contains('likeButton')){
                        let likeNum = e.target.parentElement.parentElement.getElementsByClassName('likeNum')[0];
                        let likeNumData = booklist.likedBy.length + 1;
                        likeNum.innerText = 'Liked: '+ likeNumData
                        e.target.parentElement.classList.remove('likeButton');
                        e.target.parentElement.classList.add('dislikeButton');
                        e.target.src = '../img/static/heart_icon.png'
                        
                        let request = new Request('/api/booklists/' + booklist._id, {
                            method: 'PATCH',
                            body: JSON.stringify({'operation': 'add', 'target': 'likes', 'value': String(userID)}),
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                            }
                        });
                        fetch(request).then(function(res){
                            if (res.status === 200) {
                                console.log('updated')
                            } else {
                                console.log('failed to update')
                            }
                        })

                    }
                    else if (e.target.parentElement.classList.contains('dislikeButton')){
                        let likeNum = e.target.parentElement.parentElement.getElementsByClassName('likeNum')[0];
                        let likeNumData = booklist.likedBy.length - 1;
                        likeNum.innerText = 'Liked: '+ likeNumData
                        e.target.parentElement.classList.remove('dislikeButton');
                        e.target.parentElement.classList.add('likeButton');
                        e.target.src = '../img/static/like_icon.png';
                        let request = new Request('/api/booklists/' + booklist._id, {
                            method: 'PATCH',
                            body: JSON.stringify({'operation': 'reduce', 'target': 'likes', 'value': String(userID)}),
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                            }
                        });
                        fetch(request).then(function(res){
                            if (res.status === 200) {
                                console.log('updated')
                            } else {
                                console.log('failed to update')
                            }
                        })
                    }   
                }).catch((error) => {
                    console.log(error)
                })
            }
        })
    } 

    function collectOnClick(e){
        e.preventDefault(); // prevent default action
        let url = '/api/booklists/' + booklist._id
        fetch(url).then((res) => {
            if (res.status === 200) {
                fetch(url).then((res) => {
                    if (res.status === 200) {
                        return res.json() 
                    } else {
                        console.log("Could not get this booklist.")
                    }                
                }).then((booklist) => {
                    if (e.target.parentElement.classList.contains('collectButton')){
                        let collectNum = e.target.parentElement.parentElement.getElementsByClassName('collectNum')[0];
                        let collectNumData = booklist.collectedBy.length + 1;
                        collectNum.innerText = 'Collected: '+ collectNumData;
                        e.target.parentElement.classList.remove('collectButton');
                        e.target.parentElement.classList.add('uncollectButton');
                        e.target.parentElement.classList.remove('btn-outline-success');
                        e.target.parentElement.classList.add('btn-success');
                        
                        let request = new Request('/api/booklists/' + booklist._id, {
                            method: 'PATCH',
                            body: JSON.stringify({'operation': 'add', 'target': 'collects', 'value': String(userID)}),
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                            }
                        });
                        fetch(request).then(function(res){
                            if (res.status === 200) {
                                console.log('updated')
                            } else {
                                console.log('failed to update')
                            }
                        })

                    }
                    else if (e.target.parentElement.classList.contains('uncollectButton')){
                        let collectNum = e.target.parentElement.parentElement.getElementsByClassName('collectNum')[0];
                        let collectNumData = booklist.collectedBy.length - 1;
                        collectNum.innerText = 'Collected: '+ collectNumData;
                        e.target.parentElement.classList.remove('uncollectButton');
                        e.target.parentElement.classList.add('collectButton');
                        e.target.parentElement.classList.add('btn-outline-success');
                        e.target.parentElement.classList.remove('btn-success');
                        
                        let request = new Request('/api/booklists/' + booklist._id, {
                            method: 'PATCH',
                            body: JSON.stringify({'operation': 'reduce', 'target': 'collects', 'value': String(userID)}),
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                            }
                        });
                        fetch(request).then(function(res){
                            if (res.status === 200) {
                                console.log('updated')
                            } else {
                                console.log('failed to update')
                            }
                        })
                    }   
                }).catch((error) => {
                    console.log(error)
                })
            }
        })
       
    }

    function deleteBooklistButtonOnClick(e) {
        let booklistDiv = e.target.parentElement.parentElement.parentElement.parentElement;
        addFormForDelete('booklist', booklistDiv, booklist._id)
        const form = document.getElementById("myForm")
        form.style.display="block"
    }

    const div = document.createElement('div')
    div.className = 'booklist'

    // <p>  list id
    const id = document.createElement('p')
    id.className = "listID"
    id.appendChild(document.createTextNode("List ID: "))
    const IDcontent = document.createElement('span')
    IDcontent.appendChild(document.createTextNode(booklist._id))
    id.appendChild(IDcontent)
    div.appendChild(id)
    

    const url = '/api/users/' + userID;
    fetch(url).then((res) => { 
        if (res.status === 200) {
            fetch(url).then((res) => { 
                if (res.status === 200) {
                   return res.json() 
               } else {
                    console.log("Could not get this user.")
               }                
            }).then((user) => {
                user = user.user
                if (user.username.toLowerCase() == booklist.creator.toLowerCase() || user.type == 'Admin'){
                    const div1 = document.createElement('div')
                    div1.className = 'delete'
                    const button3 = document.createElement('button')
                    button3.className = "deleteButton btn btn-danger" 
                    button3.appendChild(document.createTextNode("Delete this list"))
                    button3.addEventListener('click', deleteBooklistButtonOnClick);
                    div1.appendChild(button3)
                    id.appendChild(div1)
                }
            })
        }
    })
    div.appendChild(id);
    // infoWrap
    const ul1 = document.createElement('ul')
    ul1.className = "infoWrap"

    // li1: booklist name
    const li1 = document.createElement('li')
    li1.className = "listname"
    const strong1 = document.createElement('strong')
    const name = document.createTextNode("Booklist Name: ")
    strong1.appendChild(name)
    const span1 = document.createElement('span')
    const a1 = document.createElement('a')
    a1.className = "linkColor"
    

    a1.href = '/public/html/BooklistDetail.html?booklistID=' + booklist._id + '&userID=' + userID;


    const nameContent = document.createTextNode(booklist.listName)
    a1.appendChild(nameContent)
    span1.appendChild(a1)
    li1.appendChild(strong1)
    li1.appendChild(span1)
    ul1.appendChild(li1)

    // li2: list creator
    const li2 = document.createElement('li')
    li2.className = "listCreator"
    const strong2 = document.createElement('strong')
    const creator = document.createTextNode("Created by: ")
    strong2.appendChild(creator)
    const span2 = document.createElement('span')
    const a2 = document.createElement('a')
    a2.className = "linkColor"
    

    // TODO: creatorID
    fetch(url).then((res) => { 
        if (res.status === 200) {
            fetch(url).then((res) => { 
                if (res.status === 200) {
                   return res.json() 
               } else {
                    console.log("Could not get this user.")
               }                
            }).then((user) => {
                user = user.user;
                if (user.username.toLowerCase() == booklist.creator.toLowerCase()) { 
                    a2.href = "/public/html/user.html?userID=" + userID;
                } else {
                    a2.href = "/public/html/user.html?visitID=" + booklist.creatorID + "&userID=" + userID;
                    // TODO: booklist creator id.
                }
            })
        }
    })
    
    const creatorContent = document.createTextNode(booklist.creator)
    a2.appendChild(creatorContent)
    span2.appendChild(a2)
    li2.appendChild(strong2)
    li2.appendChild(span2)
    ul1.appendChild(li2)

    // li3: creat time
    const li3 = document.createElement('li')
    li3.className = "createTime"
    const strong3 = document.createElement('strong')
    const time = document.createTextNode("Created when: ")
    strong3.appendChild(time)
    const span3 = document.createElement('span')
    span3.className = "timeContent"
    const timeContent = document.createTextNode(booklist.createTime)
    span3.appendChild(timeContent)
    li3.appendChild(strong3)
    li3.appendChild(span3)
    ul1.appendChild(li3)

    div.appendChild(ul1)

    // list description
    const p = document.createElement('p')
    p.className = "descriptionsBox"
    const strong4 = document.createElement('strong')
    const descri = document.createTextNode("List Description: ")
    strong4.appendChild(descri)
    p.appendChild(strong4)
    const span4 = document.createElement('span')
    const descriContent = document.createTextNode(booklist.listDescription)
    span4.appendChild(descriContent)
    p.appendChild(span4)
    div.appendChild(p)

    // bookshelf
    const table = document.createElement('table')
    table.className = "bookshelf"
    const tbody = document.createElement('tbody')
    const tr1 = document.createElement('tr')
    const tr2 = document.createElement('tr')
    
    // TODO: flip pages
    let book;
    for (book of booklist.books){
        const newImg = document.createElement('th')
        const img = document.createElement('img')
        img.className = "bookimg"
        img.src = book.coverURL
        newImg.appendChild(img)
        tr1.appendChild(newImg)
        const newBookLink = document.createElement('th')
        const bookLink = document.createElement('a')
        bookLink.className = "book"
        let bid = book._id;
        bookLink.href = '/public/html/BookDetail.html?bookID=' + bid + '&userID=' + userID;

        bookLink.appendChild(document.createTextNode(book.name))
        newBookLink.appendChild(bookLink)
        tr2.appendChild(newBookLink)
    }
    tbody.appendChild(tr1)
    tbody.appendChild(tr2)
    table.appendChild(tbody)
    div.appendChild(table)

    // icon wrap
    const ul2 = document.createElement('ul')
    ul2.className = "iconWrap"

    // li1: like
    const liLike = document.createElement('li')
    liLike.className = "infoElement"
    const button1 = document.createElement('button')
    button1.className = 'btn btn-outline-success'
    if (booklist.likedBy.indexOf(userID) != -1){
        button1.classList.add('dislikeButton');

    } else {
        button1.classList.add('likeButton');
    }
    
    button1.addEventListener('click', likeOnClick);
    const iconImgLike = document.createElement('img')
    iconImgLike.className = "likeIcon"   
    if (booklist.likedBy.indexOf(userID) != -1){
        iconImgLike.src = '../img/static/like_icon.png';

    } else {
        iconImgLike.src = '../img/static/heart_icon.png'
    }
    iconImgLike.src = '../img/static/like_icon.png'
    button1.appendChild(iconImgLike)
    liLike.appendChild(button1)

    const spanLike = document.createElement('span')
    spanLike.className = "likeNum"
    const likeNum = document.createTextNode("Liked: "+booklist.likedBy.length)
    spanLike.appendChild(likeNum)
    liLike.appendChild(spanLike)

    // li2: collect
    const liCollect = document.createElement('li')
    liCollect.className = "infoElement"
    const button2 = document.createElement('button')
    if (booklist.collectedBy.indexOf(userID) != -1){
        button2.classList.add('uncollectButton');
        button2.classList.add('btn');
        button2.classList.add('btn-success');

    } else {
        button2.classList.add('collectButton');
        button2.classList.add('btn');
        button2.classList.add('btn-outline-success');
    }
    button2.addEventListener('click', collectOnClick);
    const iconImgCollect = document.createElement('img')
    iconImgCollect.className = "collectIcon"
    iconImgCollect.src = '/public/img/static/click-&-collect.png'
    button2.appendChild(iconImgCollect)
    liCollect.appendChild(button2)

    const spanCollect = document.createElement('span')
    spanCollect.className = "collectNum"
    const collectNum = document.createTextNode("Collected: " + booklist.collectedBy.length)
    spanCollect.appendChild(collectNum)
    liCollect.appendChild(spanCollect)
    
    ul2.appendChild(liLike)
    ul2.appendChild(liCollect)

    div.appendChild(ul2)
    
    return div;
    
}

function displayUserBooklists(user) {
    let content = document.getElementById('contents');
    content.innerHTML = ''; // Clean up contents
    if (user.booklistList.length == 0){
        content.innerHTML = "Don't have any booklist.";
        return;
    }
    let ul = document.createElement('ul');
    let booklistID;
    let pageFliper = document.createElement('div');
    pageFliper.id = 'pageFliper';
    content.appendChild(ul);
    content.appendChild(pageFliper);
    for (booklistID of user.booklistList) {
        let url = '/api/booklists/' + booklistID;
        fetch(url).then((res) => {
            if (res.status === 200) {
                return res.json() 
            } else {
                 console.log("Could not get this booklist.")
            }  
        }).then((booklist) => {
            let li = document.createElement('li');
            li.appendChild(_createBooklistDiv(booklist));
            ul.appendChild(li);
            filpPage(1, 2);
        })        
    }

}

function displayCollectedPost(user){
    let content = document.getElementById('contents');
    content.innerHTML = ''; // Clean up contents
    if (user.postCollection.length == 0) {
        content.innerHTML = "Don't have any post collection.";
        return;
    }

    let ul = document.createElement('ul');
    let postCollectionID;
    let pageFliper = document.createElement('div');
    pageFliper.id = 'pageFliper';
    content.appendChild(ul);
    content.appendChild(pageFliper);
    for (postCollectionID of user.postCollection) {
        let url = '/api/posts/' + postCollectionID;
        console.log(url);
        fetch(url).then((res) => {
            if (res.status === 200) {
                return res.json() 
            } else {
                 console.log("Could not get this post.")
            }  
        }).then((post) => {
            let li = document.createElement('li');
            li.appendChild(_createPostDiv(post));
            ul.appendChild(li);
            filpPage(1, 2);
        })
    }    
}

function displayCollectedBooklist(user){
    let content = document.getElementById('contents');
    content.innerHTML = ''; // Clean up contents
    if (user.booklistCollection.length == 0) {
        content.innerHTML = "Don't have any booklist collection.";
        return;
    }

    let ul = document.createElement('ul');
    let booklistCollectionID;
    let pageFliper = document.createElement('div');
    pageFliper.id = 'pageFliper';
    content.appendChild(ul);
    content.appendChild(pageFliper);
    for (booklistCollectionID of user.booklistCollection) {
        console.log(booklistCollectionID);
        let url = '/api/booklists/' + booklistCollectionID;
        fetch(url).then((res) => {
            if (res.status === 200) {
                return res.json() 
            } else {
                 console.log("Could not get this post.")
            }  
        }).then((booklist) => {
            let li = document.createElement('li');
            li.appendChild(_createBooklistDiv(booklist));
            ul.appendChild(li);
            filpPage(1, 2);
        })        
    }
}


function _getRegularUserList() {
    const url = '/api/users';
    let regularUserList = [];
    fetch(url).then((res) => {
        if (res.status === 200) {
            fetch(url).then((res) => { 
                if (res.status === 200) {
                   return res.json() 
               } else {
                    console.log("Could not get users.")
               }                
            }).then((users) => {
                users = users.users
                let user;
                for (user of users) {
                    if (user.type == 'User') {
                        regularUserList.push(user);
                    }
                }
            })
        }
    })
    return regularUserList;
    
}        
    

function displayManageWindow() {
    function manageButtonOnClick(e) {
        if (e.target.innerHTML == 'inactivate'){
            e.target.className = 'manageButton activate btn btn-outline-primary';
            e.target.innerHTML = 'activate';
            e.target.parentElement.getElementsByClassName('green')[0].innerHTML = '&nbsp; inactivate';
            e.target.parentElement.getElementsByClassName('green')[0].className = 'red';
            let userID = e.target.parentElement.getElementsByClassName('manageUserId')[0].innerHTML;
            let url = '/api/users/' + userID
            let request = new Request(url, {
                method: 'PATCH',
                body: JSON.stringify({'operation': 'isActivate', 'value': false}),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }

            });
            fetch(request).then(function(res){
                if (res.status === 200) {
                    console.log('updated')
                } else {
                    console.log('failed to update')
                }
            })

        }else{
            e.target.className = 'manageButton inactivate btn btn-outline-primary';
            e.target.innerHTML = 'inactivate';

            e.target.parentElement.getElementsByClassName('red')[0].innerHTML = '&nbsp; activate';
            e.target.parentElement.getElementsByClassName('red')[0].className = 'green';
            let userID = e.target.parentElement.getElementsByClassName('manageUserId')[0].innerHTML;
            let url = '/api/users/' + userID
            let request = new Request(url, {
                method: 'PATCH',
                body: JSON.stringify({'operation': 'isActivate', 'value': true}),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }

            });
            fetch(request).then(function(res){
                if (res.status === 200) {
                    console.log('updated')
                } else {
                    console.log('failed to update')
                }
            })
        }
        
    }   
    let content = document.getElementById('contents');
    content.innerHTML = ''; // Clean up contents

    let ul = document.createElement('ul');
    ul.id = 'userManage';
    content.appendChild(ul);
    let pageFliper = document.createElement('div');
    pageFliper.id = 'pageFliper';
    content.appendChild(pageFliper);
    const url = '/api/users';
    fetch(url).then((res) => {
        if (res.status === 200) {
            fetch(url).then((res) => { 
                if (res.status === 200) {
                   return res.json() 
               } else {
                    console.log("Could not get users.")
               }                
            }).then((users) => {
                users = users.users
                let user;
                for (user of users) {
                    if (user.type == 'User') {
                        let li = document.createElement('li');

                        let userInfoDiv = document.createElement('div');
                        userInfoDiv.className = 'userInfo';
                        let h3 = document.createElement('h3');
                        spanId = document.createElement('div');
                        spanId.innerHTML = user._id;
                        spanId.className = 'manageUserId';
                        let a = document.createElement('a');
                        a.className = 'userLink linkColor';

                        let currUserID;
                        if (window.location.href.indexOf('visitID') !== -1) {
                            currUserID = window.location.href.split('?')[1].split('&')[1].split('=')[1];
                        } else{
                            currUserID = window.location.href.split('?')[1].split('=')[1];
                        }

                        a.href = '/public/html/user.html?visitID=' + user._id + '&userID=' + currUserID;
                        a.innerHTML = user.username;
                        let divName = document.createElement('div');
                        divName.className = 'userNameDiv';
                        divName.appendChild(a);
                        
                        let span1 = document.createElement('span');
                        span1.innerHTML = 'status:'
                        let span2 = document.createElement('span');
                        if (user.isActivate == true){
                            span2.innerHTML = '&nbsp; activate';
                            span2.className = 'green';
                        } else if (user.isActivate == false){
                            span2.innerHTML = '&nbsp; inactivate';
                            span2.className = 'red';
                        }
                        h3.appendChild(spanId);
                        h3.appendChild(divName);
                        h3.appendChild(span1);
                        h3.appendChild(span2);
                        userInfoDiv.appendChild(h3);
                        
                        let manageButton = document.createElement('button');
                        if (user.isActivate == true){
                            manageButton.className = 'manageButton inactivate btn btn-outline-primary';
                            manageButton.innerHTML = 'inactivate';
                            manageButton.addEventListener('click', manageButtonOnClick);
                        } else if (user.isActivate == false){
                            manageButton.className = 'manageButton activate btn btn-outline-primary';
                            manageButton.innerHTML = 'activate';
                            manageButton.addEventListener('click', manageButtonOnClick);
                        }
                        
                        li.appendChild(userInfoDiv);
                        li.appendChild(manageButton);
                        ul.appendChild(li);
                        filpPage(1, 8);
                    }
                }
            })
        }
    })
}

function displayEditBooksWindow() {
    let content = document.getElementById('contents');
    content.innerHTML = ''; // Clean up contents

    let userID;
    if (window.location.href.indexOf('visitID') !== -1) {
        userID = window.location.href.split('?')[1].split('&')[1].split('=')[1];
    } else{
        userID = window.location.href.split('?')[1].split('=')[1];
    }
    window.location.href = "/public/html/BookMainPage.html?userID=" + userID;
}

// page flip
function filpPage(pageNo, pageLimit) {
    const contents = document.getElementById("contents").children[0];
    const totalSize = contents.children.length;
    let totalPage = 0
    const pageSize = pageLimit
    
    // calculate the page num and set up every page:
    if (totalSize / pageSize > parseInt(totalSize / pageSize)) {
        totalPage = parseInt(totalSize / pageSize) + 1;
    } else {
        totalPage = parseInt(totalSize / pageSize);
    }
    // log(totalPage)

    // build every page label and assign onclick function
    const curr = pageNo
    const startRow = (curr - 1) * pageSize + 1
    // log(startRow)
    let endRow = curr * pageSize
    endRow = (endRow > totalSize) ? totalSize : endRow;
    // log(endRow)
    let strHolder = ""
    let previousStr = "Previous&nbsp;&nbsp;&nbsp;&nbsp;"
    let spaceStr = "&nbsp;&nbsp;&nbsp;&nbsp;"
    let nextStr = "Next&nbsp;&nbsp;&nbsp;&nbsp;"
    let setupStr = "<a class=\"pagelink\" href=\"#\" onClick=\"filpPage("
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
        const each = contents.children[i - 1];
        if (i >= startRow && i <= endRow) {
            each.className="normalTR"
        } else {
            each.className="endTR"
        }
    }
    document.getElementById("pageFliper").innerHTML = strHolder;
}

// admin only action: remove book---form for confirming delete
// type: post/booklist
function addFormForDelete(type, deletedDiv, objectID){
    //// dialog modal
    const wrapper = document.createElement('div')
    wrapper.id ='myForm'
    wrapper.className='form-popup'

    const form = document.createElement('form')
    form.className='form-container'

    const h5 = document.createElement('h5')
    h5.innerText= 'Confirm to delete the ' + type + '?'
    form.appendChild(h5)

    const submit = document.createElement('button')
    submit.type = "submit"
    submit.className='addSubmit, btn'
    submit.id = 'submit'
    submit.innerText='Confirm'
    submit.onclick = function confirmDelete(e){
        e.preventDefault();
        document.getElementById('contents').children[0].removeChild(deletedDiv);
        let url;
        if (type == 'post'){
            url = '../../api/posts/' + objectID
        } else {
            url = '../../api/booklist/' + objectID
        }
        
        console.log(url);
        let request = new Request(url, {
            method: 'DELETE',
        });
        fetch(request).then(function(res){
            if (res.status === 200) {
                console.log('deleted')
            } else {
                console.log('failed to delete')
            }
        })
        document.querySelector('body').removeChild(document.querySelector('body').lastElementChild);
    }
    form.appendChild(submit)

    const cancel = document.createElement('button')
    cancel.type = "button"
    cancel.className='btn cancel'
    cancel.id = "cancel"
    cancel.onclick = function cancelDelete(e){
        e.preventDefault; 
        document.querySelector('body').removeChild(document.querySelector('body').lastElementChild)

    }
    cancel.innerText='Cancel'
    form.appendChild(cancel)
    wrapper.appendChild(form)
    document.querySelector('body').appendChild(wrapper)
}

displayUserInfo(window.location.href.indexOf('visitID') !== -1);


// Setup onclick
const menuButtons = document.getElementsByClassName('btn btn-light');
const profileButtons = document.querySelector('#profileButton');
const menuButtonSelected = document.querySelector('.selected');
let menuButton;
for (menuButton of menuButtons) {
    menuButton.addEventListener('click', menuButtonsOnClick);
}
menuButtonSelected.addEventListener('click', menuButtonsOnClick);
if (profileButtons != null) {
    profileButtons.addEventListener('click', profileButtonsOnClick);
}
