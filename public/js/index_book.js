/******************* Index Book *******************/
let user;
let usertype;
let username;
const allBooks = [];
let BooklistsList = [];
const recommendedBooks = [];

class Book {
	constructor(bid, title, author, cover, description) {
        this.bookId = bid; // get it from book detail page
		this.title = title;
		this.author = author;
        this.cover = cover;
        this.description = description;
        this.link = null; // link to book detail page
    }
}
 
class DataBooklist {
	constructor(lid, listName, creator, bookCollection) {
        this.booklistID = lid;
		this.listName = listName
		this.creator = creator; 
        this.books = bookCollection; // list of DataBook here, list of Book object in BooklistMain
        this.link = null;
	}
}


try { 
    user= String(window.location.href.split('?')[1].split('=')[1])
    //try user = String ...
    const url = '/api/users/'+user
    fetch(url).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
           alert('Could not get this user')
       }   
    }).then((json) => { 
        usertype = json.user.type.toLowerCase()
        username = json.user.username

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
                allBooks.push(new Book(each._id, each.name, each.author, each.coverURL, each.description))
            }
            const lists = json.lists
            for (each of lists){
            BooklistsList.push(new DataBooklist(each._id, each.listName, each.creator, each.books))
            }

            // handle links
            for (let i=0; i<allBooks.length; i++){
                allBooks[i].link = blinkHandler(allBooks[i].bookId, usertype, user)
            }
            for (let i=0; i<BooklistsList.length; i++){
                BooklistsList[i].link = llinkHandler(BooklistsList[i].booklistID, usertype, user)
            }  

            /******************* Index Book *******************/
            welcome(username)
            RecommendBooksCreate()
            displayTop()
            displayRecommendations()
            })
        }).catch((error) => {
        console.log(error)})
} catch { 
    usertype= 'guest'
    const url0 = '/api/two'
    fetch(url0).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            console.log("not found")
       }                
    }).then((json) => {  //pass json into object locally
        const books = json.books
        for (each of books){
            allBooks.push(new Book(each._id, each.name, each.author, each.coverURL, each.description))
        }
        const lists = json.lists
        for (each of lists){
            BooklistsList.push(new DataBooklist(each._id, each.listName, each.creator, each.books))
        }

        // handle links
        for (let i=0; i<allBooks.length; i++){
            allBooks[i].link = blinkHandler(allBooks[i].bookId, usertype, user)
        }
        for (let i=0; i<BooklistsList.length; i++){
            BooklistsList[i].link = llinkHandler(BooklistsList[i].booklistID, usertype, user)
        }  

        /******************* Index Book *******************/
        RecommendBooksCreate()
        displayTop()
        displayRecommendations()
       
        })
    .catch((error) => {
    console.log(error)})
}

/*************** Welcome Section ********************/
function welcome(username){
    const div = document.createElement("div")
    div.className = 'welcome'
    const h2 = document.createElement("h2")
    h2.className = "fancychar2"
    h2.innerText = 'Hello '
    const span = document.createElement("span")
    const b = document.createElement("b")
    b.innerText = username+ ','
    span.appendChild(b)
    h2.appendChild(span)

    const h4 = document.createElement("h4")
    h4.className = "fancychar2"
    h4.innerText = 'what would you like to read today?'
    div.appendChild(h2)
    div.appendChild(h4)

    const top = document.querySelector(".search-list")
    top.parentElement.insertBefore(div, top.nextElementSibling)
}

/*************** link handler ********************/

function blinkHandler(bid, usertype, userid){
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

function llinkHandler(lid, usertype, userid){
    // handler for book *list* page link
    let result;
    if (usertype == 'guest'){
        result = '/BooklistDetail.html?booklistID='+lid 
    }
    else{
        result = '/Booklist/Detail?booklistID='+lid+'&userID='+userid
    }
    return result;
}    

/********** Recommendation book display **********/

function RecommendBooksCreate() {
    //Create RecommendedBooklist according to the frequency of the book put in some booklists
    let popularity = new Array(allBooks.length).fill(0)
    for(let i=0; i<allBooks.length; i++){
            const bid = allBooks[i].bookId
            for (let j=0; j<BooklistsList.length; j++){
                const result = BooklistsList[j].books.filter((Book) => Book.bookId == bid)
                popularity[i] += result.length;
            }
        }
        for (let k=0; k<3; k++){
            let max = popularity.reduce(function(a, b) {
                return Math.max(a, b);
            }, -Infinity);
            let index = popularity.indexOf(max)
            recommendedBooks.push(allBooks[index])
            popularity[index] = -1
        }
        }
    

function displayTop(){
        const div = document.getElementsByClassName('p-4 p-md-5 mb-4 text-white rounded bg-dark')
        if (recommendedBooks[0] !=null){
            const bookName = recommendedBooks[0].title;
            const bookAuthor = recommendedBooks[0].author;
            const bookCover = recommendedBooks[0].cover;
            const description = recommendedBooks[0].description;
            const bid = recommendedBooks[0].bookId;
            const booklink = recommendedBooks[0].link;

            let img = document.createElement('img')
            img.className = 'TopbookCover'
            img.setAttribute('src', bookCover)

            let h1 = document.createElement('h1')
            h1.className = 'display-4 fst-italic'
            h1.classList.add('fancychar1')
            h1.innerText = bookName
            let span = document.createElement('span')
            span.className = 'transparent'
            span.innerText = bid
            h1.appendChild(span)

            let h4 = document.createElement('h4')
            h4.className = 'fancychar2'
            h4.innerText = bookAuthor

            let p1 = document.createElement('p')
            p1.className = 'lead my-3'
            p1.innerText = description

            let p2 = document.createElement('p')
            p2.className = 'lead mb-0'
            let a = document.createElement('a')
            a.className = 'text-white fw-bold'
            a.setAttribute('href', booklink)
            a.onclick = function open(e){
                e.preventDefault();
                window.location.href=(a.href)
            }
            a.innerText = 'Learn more about it...'
            p2.appendChild(a)

            div[0].appendChild(img)
            div[0].appendChild(h1)
            div[0].appendChild(h4)
            div[0].appendChild(p1)
            div[0].appendChild(p2)
        }
 }


function displayRecommendations(){

    for (let i=1; i<3; i++){
        if (recommendedBooks[i] != null){
        const area = document.getElementsByClassName('row mb-2')

        const bookName = recommendedBooks[i].title;
        const bookAuthor = recommendedBooks[i].author;
        const bookCover = recommendedBooks[i].cover;
        const description = recommendedBooks[i].description;
        const bid = recommendedBooks[i].bookId;

        const booklink = recommendedBooks[i].link

        let outerdiv = document.createElement('div')
        outerdiv.className = 'col-md-6'
        let innerdiv1 = document.createElement('div')
        innerdiv1.className = 'row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative'
        let innerdiv2 = document.createElement('div')
        innerdiv2.className = 'col p-4 d-flex flex-column position-static'
        
        let h3 = document.createElement('h3')
        h3.className = 'fancychar2'
        h3.innerText = bookName
        let span = document.createElement('span')
        span.className = 'transparent'
        span.innerText = bid
        h3.appendChild(span)

        let div1 = document.createElement('div')
        div1.className = 'mb-1 text-muted'
        div1.innerText = bookAuthor

        let img = document.createElement('img')
        img.className = 'RecommendationbookCover'
        img.setAttribute('src', bookCover)

        let br = document.createElement('br')

        let p = document.createElement('p')
        p.className = 'card-text mb-auto'
        p.classList.add('justify')
        p.innerText = description
        
        let a = document.createElement('a')
        a.setAttribute('href', booklink)
        a.className = 'stretched-link'
        a.innerText = 'Learn more'
        a.onclick = function open(e){
            e.preventDefault();
            window.location.href=(a.href)
        }

        innerdiv2.appendChild(h3)
        innerdiv2.appendChild(div1)
        innerdiv2.appendChild(img)
        innerdiv2.appendChild(br)
        innerdiv2.appendChild(p)
        innerdiv2.appendChild(a)

        innerdiv1.appendChild(innerdiv2)
        outerdiv.appendChild(innerdiv1)

        area[0].appendChild(outerdiv)

        }
    }
}

