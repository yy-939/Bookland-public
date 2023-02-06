const log = console.log
// global variables
let BooksNum = 0; 
let BooksList = [] 

// class for saving json retrieved results
class Book {
	constructor(name, author, year, coverURL, description,id) {
		this.name = name;
		this.author = author;
		this.year = year;
		this.coverURL = coverURL; 
        this.description = description;
        this.postCollection = [] // collection of post ids associated with the book
		this.bookID = id;
		BooksNum++;
	}
}

/*********************************** DOM functions *************************************/

// get all books (defaul on load function )
function getBooks(){
    const url = '/api/books'
    fetch(url).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            alert('faild to get all books.')
       }                
    }).then((json) => {
        const books = json.books

        for (each of books){
            BooksList.push(new Book(each.name, each.author, each.year, each.coverURL, each.description, each._id))
        }
        ifNeedDeleteForm(_getUserID())
        displayAllBooks(BooksList,_getUserID())
    }).catch((error) => {
        log(error)
    })
}

// display all books according to user id and booklist collection order
function displayAllBooks(BooksList, userID) {
    const bookTable = document.querySelector('#bookTable')
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
        let userType = "guest"
        try { // check if logined
            userType = userInfo.split("\"type\":\"")[1].split("\"")[0]
            const username = userInfo.split("\"username\":\"")[1].split("\"")[0]
            if(userType === 'Admin'){ // admin has additonal operation allowed
                document.querySelector('#tableResult').addEventListener('click', deleteBook)
                document.querySelector('#addButton').addEventListener('click', addNewBook)
                //document.getElementById('coverButton').addEventListener('change', _uploadPicture)
            } else {
                document.querySelector('#adminActionsWrap').parentElement.removeChild(document.querySelector('#adminActionsWrap'))
            }
        } catch { // guest
            const userType = "guest"
            document.querySelector('#adminActionsWrap').parentElement.removeChild(document.querySelector('#adminActionsWrap'))
            document.querySelector('.quit').parentElement.removeChild(document.querySelector('.quit'))
        }
        
        // construct book card
        const tableResultTBODY = document.querySelector('#tableResultTBODY')
        for(let i = 0; i < BooksNum; i++) {
            const tr = document.createElement('tr')
            const div = document.createElement('div')
            div.className = 'book_card'

            if (userType === 'Admin'){// admin only: admin delete button
            const div1 = document.createElement('div')
            div1.className = 'delete'
            const button = document.createElement('button')
            button.className = "deleteButton, btn btn-danger" 
            button.setAttribute('data-toggle','model')
            button.setAttribute('data-target','#exampleModalCenter')

            button.appendChild(document.createTextNode("Delete the book"))
            div1.appendChild(button)
            div.appendChild(div1)
            }
            
            // book name 
            const p1 = document.createElement('p')
            const strong1 = document.createElement('strong')
            const name = document.createTextNode("Book Name: ")
            strong1.appendChild(name)
            p1.appendChild(strong1)

            const span1 = document.createElement('span')
            span1.className="bookTitle"
            const a = document.createElement('a')
            a.className = "linkColor"
            a.href = "/BookDetail?bookID=" + String(BooksList[i].bookID)
            if (userType === 'Admin' | userType === 'User'){
                a.href += ("&userID="+_getUserID())
            }
            a.onclick = function open(e){e.preventDefault(); window.location.href = (a.href)}
            const nameContent = document.createTextNode(BooksList[i].name)
            a.appendChild(nameContent)
            span1.appendChild(a)
            p1.appendChild(span1)
            div.appendChild(p1)

            // cover img
            const img = document.createElement('img')
            img.className = "cover"
            img.src = BooksList[i].coverURL
            img.alt = "cover"
            div.appendChild(img)

            // description
            const p2 = document.createElement('p')
            p2.className = "descriptionsBox"
            const strong2 = document.createElement('strong')
            const descri = document.createTextNode("Descriptions: ")
            strong2.appendChild(descri)
            p2.appendChild(strong2)

            const span2 = document.createElement('span')
            const descriContent = document.createTextNode(BooksList[i].description)
            span2.appendChild(descriContent)
            p2.appendChild(span2)
            div.appendChild(p2)

            // info table
            const table = document.createElement('table')
            table.className = "bookinfo"
            const tbody = document.createElement('tbody')
            const tr1 = document.createElement('tr')
            const ID = document.createElement('th')
            ID.innerText = 'Book ID'
            ID.className = 'th'
            const author = document.createElement('th')
            author.innerText = 'Author'
            author.className = 'th'
            const year = document.createElement('th')
            year.innerText = 'Publish year'
            year.className = 'th'
            tr1.appendChild(ID)
            tr1.appendChild(author)
            tr1.appendChild(year)
            tbody.appendChild(tr1)

            const tr2 = document.createElement('tr')
            const IDcontent = document.createElement('td')
            IDcontent.innerText = BooksList[i].bookID
            IDcontent.className = 'td'
            const authorContent = document.createElement('td')
            authorContent.innerText = BooksList[i].author
            authorContent.className = 'td'
            const yearContent = document.createElement('td')
            yearContent.innerText = BooksList[i].year
            yearContent.className = 'td'
            tr2.appendChild(IDcontent)
            tr2.appendChild(authorContent)
            tr2.appendChild(yearContent)
            tbody.appendChild(tr2)
            table.appendChild(tbody)
            div.appendChild(table)

            tr.appendChild(div)
            tableResultTBODY.appendChild(tr)
        }
        _flipPage(1,3)
    }).catch((error)=>{log(error)})
    
}

// check if the current user need the pop up form to delete
function ifNeedDeleteForm(userID){
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
            if(userType == 'Admin'){
                addFormForDelete()
            }
        } catch {
            log("guest")
        }
        
    }).catch((error)=>{
        log(error)
        return
    })
}

// admin only: pop up form for "delete book"---form for confirming delete
function addFormForDelete(){
    const wrapper = document.createElement('div')
    wrapper.id ='myForm'
    wrapper.className='form-popup'

    const form = document.createElement('form')
    form.className='form-container'

    const h5 = document.createElement('h5')
    h5.innerText= 'Confirm to delete the book?'
    form.appendChild(h5)

    const submit = document.createElement('button')
    submit.type = "submit"
    submit.className='addSubmit, btn'
    submit.id = 'submit'
    submit.innerText='Confirm'
    submit.onclick = function confirmDelete(e){
        e.preventDefault();
        if (e.target.id == 'submit'){
            const ID = document.getElementById("myForm").name
            _deleteBookFromAdminUser(ID)
            _renewBooklist();
            document.getElementById("myForm").style.display="none";
            location.reload();
        }
    }
    form.appendChild(submit)

    const cancel = document.createElement('button')
    cancel.type = "button"
    cancel.className='btn cancel'
    cancel.id = "cancel"
    cancel.onclick = function cancelDelete(e){e.preventDefault; document.getElementById("myForm").style.display='none'}
    cancel.innerText='Cancel'
    form.appendChild(cancel)
    wrapper.appendChild(form)
    document.querySelector('body').appendChild(wrapper)
}


/*********************************** event listener functions for DOM *************************************/

// admin only: add book event 
function addNewBook(e){
    e.preventDefault();
    if (e.target.className == 'addSubmit, btn btn-primary'){
        const bookname = document.getElementById('bookNameInput').value
        const author = document.getElementById('bookAuthorInput').value
        const year = parseInt(document.getElementById('publishYearInput').value)
        const description = document.getElementById('descriptionInput').value
        // cover is not required
        let cover = 'https://www.freeiconspng.com/uploads/violet-book-icon--somebooks-icons--softiconsm-11.png'
        if (document.getElementById('coverInput').value.length > 0){
            cover = document.getElementById('coverInput').value
        }

        //check validation
        const all = Array(bookname, author, year, description)
        const required = all.filter((each) => each.length === 0)
        if (required.length > 0 ){
            document.querySelector('#reflect').innerText=('Missing required input, please re-enter information.')
            document.querySelector('#reflect').className = 'fail'
        } else {
            const url = '/api/book'
            let data = {
                name: bookname,
                author: author,
                year: year,
                description: description,
                coverURL: cover,
                postCollection:[]
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
                log(res)
            }).catch((error) => {
                log(error)
            })
            //clear input boxes:
            document.getElementById('bookNameInput').value = ""
            document.getElementById('bookAuthorInput').value = ""
            document.getElementById('publishYearInput').value = null
            document.getElementById('descriptionInput').value = ""
            document.getElementById('coverInput').value = ""
            document.querySelector('#reflect').innerText=("Added successfully.")
            document.querySelector('#reflect').className = 'success'
            setTimeout(()=>{
                document.querySelector('#reflect').innerText=""
            }, 2 * 1000)
            location.reload();
        }
    }
}

// admin only: delete book event
function deleteBook(e){
    e.preventDefault();
    if (e.target.className == 'deleteButton, btn btn-danger'){
        const bookElement = e.target.parentElement.parentElement.parentElement
        const ID =(bookElement.children[0].children[4].children[0].children[1].children[0].innerText)
        const form = document.getElementById("myForm")
        form.children[0].children[0].innerText="Confirm to delete this book?"
        form.name = ID
        form.style.display="block"
    }
}


/*********************************** helper functions for DOM *************************************/

// admin only: delete book post request
function _deleteBookFromAdminUser(id){
    const book = BooksList.filter((book)=> book.bookID == id )
    const url = '/api/book/'+id

    let data = {
        _id: book[0].bookID
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
            console.log('delete book')    
        } else {
            console.log('Failed to delete')
        }
        log(res)
    }).catch((error) => {
        log(error)
    })
}

// add flip page
function _flipPage(pageNo, pageLimit) {
    const allBooks = document.getElementById("tableResultTBODY")
    const totalSize = allBooks.rows.length
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
    let previousStr = "Previous"
    let nextStr = "Next"
    let setupStr = "<li class=\"page-item\"><a class=\"page-link\" href=\"#\" onClick=\"_flipPage("
    let disabled = "<li class=\"page-item disabled\"> <span class=\"page-link\">" 
    // single page is enough
    if (totalPage <= 1){
        strHolder = disabled + previousStr + "</span></li>"+
        setupStr + totalPage + "," + pageLimit + ")\">" + "1" + "</a></li>" + disabled + nextStr + "</span></li>"
    } else { //multipages
        if (curr > 1) {
            strHolder += setupStr + (curr - 1) + "," + pageLimit + ")\">"+previousStr+"</a></li>"
            for (let j = 1; j <= totalPage; j++) {
                strHolder += setupStr+ j + "," + pageLimit + ")\">" + j + "</a></li>"
            }
        } else {
            strHolder += disabled + previousStr + "</span></li>"
            for (let j = 1; j <= totalPage; j++) {
                strHolder += setupStr+ j + "," + pageLimit + ")\">" + j +"</a></li>"
            }
        }
        if (curr < totalPage) {
            strHolder += setupStr + (curr + 1) + "," + pageLimit + ")\">"+nextStr+"</a></li>"
            
        } else { strHolder += disabled + nextStr + "</span></li>"}
    }


    //separate different display style for different tr element
    for (let i = 1; i < (totalSize + 1); i++) {
        const each = allBooks.rows[i - 1];
        if (i >= startRow && i <= endRow) {
            each.className="normalTR"
        } else {
            each.className="endTR"
        }
    }
    document.querySelector("#pageFliperUL").innerHTML = strHolder;

    // set up current page 
    const allPageButton = document.querySelectorAll(".page-item")
    for (each of allPageButton){
        if (each.children[0].innerText == pageNo){
            each.className = "page-item active"
            each.ariaCurrent = "page"
        }
    }
}

// update display
function _renewBooklist(){
    BooksList = []
    getBooks()
}

// get user id
function _getUserID(){
    try{
        return (window.location.href.split('?')[1].split('userID=')[1])
    } catch{
        return 'guest'
    }
}

/*********************************** on load function *************************************/
getBooks()