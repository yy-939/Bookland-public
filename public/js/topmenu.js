let t_user;
let t_usertype;
let t_username;
const t_allBooks = [];
let t_booklistsList = [];

class TBook {
	constructor(bid, title, author, cover, description) {
        this.bookId = bid; // get it from book detail page
		this.title = title;
		this.author = author;
        this.cover = cover;
        this.description = description;
        this.link = null; // link to book detail page
    }
}

class TDataBooklist {
	constructor(lid, listName, creator, bookCollection) {
        this.booklistID = lid;
		this.listName = listName
		this.creator = creator; 
        this.books = bookCollection; // list of DataBook here, list of Book object in BooklistMain
        this.link = null;
	}
}

/*************** link handler ********************/
function t_blinkHandler(bid, usertype, userid){
    // handler for book *Detail* page link
    let result;
    if (usertype == 'guest'){
        result = '/BookDetail?bookID='+bid
    }
    else{
        result = '/BookDetail?bookID='+bid+"&userID="+userid
    }
    return result; 
}  

function t_llinkHandler(lid, usertype, userid){
    // handler for book *list* page link
    let result;
    if (usertype == 'guest'){
        result = '/Booklist/Detail?booklistID='+lid 
    }
    else{           
        result = '/Booklist/Detail?booklistID='+lid+'&userID='+userid
    }
    return result;
}   

/*************** Footer ********************/
function footer(){
    const mybutton = document.getElementById("myBtn");
    window.onscroll = function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
          } else {
            mybutton.style.display = "none";
          }
    };
}

function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }

/*************** display ********************/
function displayMenu(usertype, username, userid){
    const ul = document.querySelector("#topMenu").children[0]
    const lis = ul.children
    const homea = lis[1].firstChild
    const booksa = lis[2].firstChild
    const booklistsa = lis[3].firstChild
    const li = document.createElement("li")
    const a = document.createElement("a")   
    const li2 = document.createElement("li")
    li2.className = 'addUserIdToLink'
    li2.id = 'userLoginInfo'
    const a2 = document.createElement("a")   
    if (usertype == 'guest'){
        homea.setAttribute('href', '/index.html')
        booksa.setAttribute('href', '/BookMain') 
        booklistsa.setAttribute('href', '/BooklistMain') 
        a.setAttribute("href", "/public/html/login.html")
        a.innerText = 'Login/Register'
        li.appendChild(a)
        ul.appendChild(li)
    }
    else{
        homea.setAttribute('href', '/index.html?userID='+userid) 
        booksa.setAttribute('href', '/BookMain?userID='+userid) 
        booklistsa.setAttribute('href', '/BooklistMain?userID='+userid) 
        a.setAttribute("href","/logout")
        a.innerText = 'QUIT'
        li.append(a)
        li.className = 'quit'
        a2.setAttribute("href", "/user/"+userid)
        a2.innerText = username // dynamic
        li2.append(a2)
        ul.appendChild(li)
        ul.appendChild(li2)
    }
}

function displaySearchbox(){
    const bookoptionfield = document.querySelector(".search-book #myDropdown")
    for (let i=0; i<t_allBooks.length; i++){
        if (t_allBooks[i] != null){
            const id1 = t_allBooks[i].bookId
            const name1 = t_allBooks[i].title
            const a1 = document.createElement("a")

            let link1 = t_allBooks[i].link
            a1.setAttribute("href", link1)
            a1.innerText = name1
            bookoptionfield.appendChild(a1)
        }
    }

    const listoptionfield = document.querySelector('.search-list #myDropdown')
    for (let i=0; i<t_booklistsList.length; i++){
        if (t_booklistsList[i] != null){
            const id2 = t_booklistsList[i].booklistID
            const name2 = t_booklistsList[i].listName +" -- " +t_booklistsList[i].creator
            const a2 = document.createElement("a")

            let link2 = t_booklistsList[i].link
            a2.setAttribute("href", link2)
            a2.innerText = name2
            listoptionfield.appendChild(a2)
        }
    }
}

function bookFunction() {
    const bookdropdown = document.querySelector(".search-book #myDropdown")
    if (bookdropdown.classList.contains("hide")){
        bookdropdown.classList.remove("hide")
        bookdropdown.classList.add("dropdown-content")
    }
    else{
        bookdropdown.classList.remove("dropdown-content")
        bookdropdown.classList.add("hide")
    }  
}

function listFunction() {
    const listdropdown = document.querySelector(".search-list #myDropdown")
    if (listdropdown.classList.contains("hide")){
        listdropdown.classList.remove("hide")
        listdropdown.classList.add("dropdown-content")
    }
    else{
        listdropdown.classList.remove("dropdown-content")
        listdropdown.classList.add("hide")
    } 
}

function t_bookfilterFunction() {
    let input, filter, ul, li, a, i;
    input = document.querySelector(".search-book #myInput")
    filter = input.value.toUpperCase();
    div = document.querySelector(".search-book #myDropdown")
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
        } else {
        a[i].style.display = "none";
        }
    }
}

function t_listfilterFunction() {
    let input, filter, ul, li, a, i;
    input = document.querySelector(".search-list #myInput")
    filter = input.value.toUpperCase();
    div = document.querySelector(".search-list #myDropdown")
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
        } else {
        a[i].style.display = "none";
        }
    }
}

/*************** display ********************/

if ((!String(window.location.href).includes("userID")) || !String(window.location.href).includes("?")){
    t_usertype = "guest"
    const url0 = '/api/two'
    fetch(url0).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            console.log("not found")
       }                
    }).then((json) => { 
        const books = json.books
        for (each of books){
            t_allBooks.push(new TBook(each._id, each.name, each.author, each.coverURL, each.description))
        }
        const lists = json.lists
        for (each of lists){
           t_booklistsList.push(new TDataBooklist(each._id, each.listName, each.creator, each.books))
        }

        // handle links
        for (let i=0; i<t_allBooks.length; i++){
            t_allBooks[i].link = t_blinkHandler(t_allBooks[i].bookId, t_usertype, t_user)
        }
        for (let i=0; i<t_booklistsList.length; i++){
            t_booklistsList[i].link = t_llinkHandler(t_booklistsList[i].booklistID, t_usertype, t_user)
        }  

        footer()
        displayMenu(t_usertype, t_username, t_user)
        displaySearchbox()

        })
    .catch((error) => {
        console.log(error)})
}
else{
    if (String(window.location.href).includes("&")){
        t_user = String(window.location.href).split('?')[1].split('&')[1].split('=')[1]
    }
    else{
        t_user= String(window.location.href).split('?')[1].split('=')[1]
    }
    const url = '/api/users/'+t_user
    fetch(url).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
           alert('Could not get this user')
       }   
    }).then((json) => {  
        t_usertype = json.user.type.toLowerCase()
        t_username = json.user.username
        const url2 = '/api/two'
        fetch(url2).then((res) => { 
            if (res.status === 200) {
               return res.json() 
           } else {
                console.log("not found")
           }                
        }).then((json) => {  
            const books = json.books
            for (each of books){
                t_allBooks.push(new TBook(each._id, each.name, each.author, each.coverURL, each.description))
            }
            const lists = json.lists
            for (each of lists){
                t_booklistsList.push(new TDataBooklist(each._id, each.listName, each.creator, each.books))
            }

            // handle links
            for (let i=0; i<t_allBooks.length; i++){
                t_allBooks[i].link = t_blinkHandler(t_allBooks[i].bookId, t_usertype, t_user)
            }
            for (let i=0; i<t_booklistsList.length; i++){
                t_booklistsList[i].link = t_llinkHandler(t_booklistsList[i].booklistID, t_usertype, t_user)
            }  
            footer()
            displayMenu(t_usertype, t_username, t_user)
            displaySearchbox()

            })
        }).catch((error) => {
        log(error)})


}



