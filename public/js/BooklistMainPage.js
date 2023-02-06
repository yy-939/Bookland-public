const log = console.log
// global variables
let BooklistsNum = 0; 
let BooklistsList = [] 

// class for saving json retrieved results
class Booklist {
	constructor(listName, listDescription, creator, bookCollection, id, likedBy, collectedBy, createTime, creatorID) {
		this.listName = listName;
        if (listDescription.length === 0){
            this.listDescription = '__The creator hasn\'t add description yet...__'
        } else {
            this.listDescription = listDescription
        }
		this.creator = creator // username
        this.creatorID = creatorID // user id
        this.books = bookCollection; // list of Book object
		this.booklistID = id;
		BooklistsNum++;
        this.likedBy = likedBy;
        this.collectedBy = collectedBy;
        this.createTime = createTime
	}
}

/*********************************** DOM functions *************************************/

// get all booklist
function getBooklists(){
    const url = '/api/booklists'
    fetch(url).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            res.status(500).send("Internal Server Error")
       }                
    }).then((json) => { 
        const booklists = json.booklists
        for (each of booklists){
            BooklistsList.push(
                new Booklist(each.listName, each.listDescription, 
                    each.creator, each.books, 
                    each._id, each.likedBy, 
                    each.collectedBy, each.createTime,
                    each.creatorID))
        }
        displayAllBooklists(BooklistsList, _getUserID())
        addFormForDelete()
    }).catch((error) => {
        log(error)
    })
}
// display all availble booklists:
function displayAllBooklists(BooklistsList, userID) {
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
        try {
            const userType = userInfo.split("\"type\":\"")[1].split("\"")[0]
            const username = userInfo.split("\"username\":\"")[1].split("\"")[0]
            document.querySelector('#userLoginInfo').innerText = username
            booklistTable.addEventListener('click', deleteBooklist)
            const endUserActionsWrap = document.querySelector('#endUserActionsWrap')
            endUserActionsWrap.addEventListener('click', addNewBooklist)  
            _loadCards(BooklistsList, userID, userType)
        } catch (error){ // guest 
            document.querySelector('#endUserActionsWrap').style.visibility = 'hidden' // hide create booklist bar
            _loadCards(BooklistsList, "", "guest")
            try{
                document.querySelector('.quit').parentElement.removeChild(document.querySelector('.quit'))
            } catch{
                log('no need remove quit button')
            }
        }
    }).catch((error) => {
        log(error)
    })
    
}

// sort by default id ordering
function sortDefault() {
    document.querySelector('#sort_a_z').className = "btn btn-secondary"
    document.querySelector('#sort_default').className = "btn btn-secondary active"
    const nowBooks = document.querySelector('#tableResultTBODY')
    const allBooklists = document.querySelectorAll('.booklist')
    for (each of allBooklists){
        nowBooks.removeChild(each.parentElement)
    }
    displayAllBooklists(BooklistsList, _getUserID())
}

// sort by list name from a to z
function sortByAtoZ(){
    document.querySelector('#sort_a_z').className = "btn btn-secondary active"
    document.querySelector('#sort_default').className = "btn btn-secondary"
    let nameArr = BooklistsList.map((list)=> list.listName)
    let sortedBooklistsList = []
    const num = BooklistsList.length
    nameArr = nameArr.sort((x,y)=>x.localeCompare(y))
    for (let i=0; i<num; i++) {
        for (let j=0; j<num; j++){
            if (nameArr[i] == BooklistsList[j].listName) {
                sortedBooklistsList.push(BooklistsList[j])
            }
        }
    }
    const nowBooks = document.querySelector('#tableResultTBODY')
    const allBooklists = document.querySelectorAll('.booklist')
    for (each of allBooklists){
        nowBooks.removeChild(each.parentElement)
    }
    displayAllBooklists(sortedBooklistsList, _getUserID())
    addFormForDelete()
}

// admin & creator only: pop up form for "delete booklist"---form for confirming delete
function addFormForDelete(){
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
            const list = BooklistsList.filter((list)=> list.booklistID == ID )
            const url = '/api/booklist/'+ID
        
            let data = {
                _id: list[0].booklistID
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
                    console.log('delete booklist')    
                } else {
                    console.log('Failed to delete the booklist')
                }
                log(res)
            }).catch((error) => {
                log(error)
            })

            for (let i=0; i<BooklistsNum; i++){
                if (BooklistsList[i].booklistID == ID){
                    BooklistsList.splice(i, 1)
                    BooklistsNum--
                }
            }
            document.getElementById("deleteForm").style.display="none"
            location.reload()
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

// login-in user only: randomly display existed books for user to load books when they are editing booklists
function changeBooks(){
    let result = []
    const url = '/api/books'
    fetch(url).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            res.status(500).send("Internal Server Error")
       }                
    }).then((json) => {
        const books = json.books

        for (each of books){
            result.push({
                "bookID": each._id,
                "name": each.name
            })
        }
        return result
    }).then((result)=>{
    const ul = document.querySelector('#randomBooks')
    const random3 = []
    while (random3.length<3){
        const idx = Math.floor(Math.random() * result.length)
        if (!random3.includes(idx)){
            random3.push(idx)
        }
    }
    for (let i=0;i<3;i++){
        ul.children[i].children[0].innerHTML =  result[random3[i]].name
        const span = document.createElement('span')
        span.className = 'bookIDhide'
        span.innerText = result[random3[i]].bookID
        ul.children[i].appendChild(span)
    }
    }).catch((error) => {
        log(error)
    })
}


/*********************************** event listener functions for DOM *************************************/

// select the list sorting way
const sort_default = document.querySelector('#sort_default')
const sort_a_z = document.querySelector('#sort_a_z')
sort_default.addEventListener("click",sortDefault)
sort_a_z.addEventListener("click", sortByAtoZ)

// universal event to trigger alert for guest login
const booklistTable = document.querySelector('#booklistTable')
function alertGuestToLogin(e){
    e.preventDefault();
    if (e.target.className == 'collectIcon' | e.target.className == 'likeIcon') {
        _alertPop()
    }
}

// increase like or collect (logined user only)
function increaseLikeOrCollect(e){
    e.preventDefault();
    const iconName = e.target.className
    if (iconName == 'collectIcon' || iconName == 'likeIcon') {
        const index = (e.target.parentElement.parentElement.parentElement.parentElement.children[0].children[0].innerText)
        const selectedBookList = BooklistsList.filter((booklist) => booklist.booklistID == index)
        const allBooklists = document.querySelectorAll('.booklist')
        for (let i = 0; i < allBooklists.length; i++){
            const pageIndex = (allBooklists[i].children[0].children[0].innerHTML)
            const type = e.target.parentElement.nextSibling.innerText
            const selfUserID = _getUserID()
            if (pageIndex === index && iconName == 'collectIcon' && type.includes("Collects")){ // haven't collected
                _modifyLikeOrCollect(index, "collectedBy", "add", selfUserID)
                selectedBookList[0].collectedBy.push(_getUserID())
                allBooklists[i].children[4].children[1].children[1].innerText = "Collected: " + selectedBookList[0].collectedBy.length
                allBooklists[i].children[4].children[1].children[1].previousSibling.className = 'collectedButton, btn btn-success' // for button color change
            } else if (pageIndex === index && iconName == 'likeIcon' && type.includes("Likes")){ // haven't liked
                _modifyLikeOrCollect(index, "likedBy", "add", selfUserID)
                selectedBookList[0].likedBy.push(_getUserID())
                allBooklists[i].children[4].children[0].children[1].innerText = "Liked: " + selectedBookList[0].likedBy.length
                allBooklists[i].children[4].children[0].children[1].previousSibling.className = 'likedButton, btn btn-outline-success' // for button color change
                allBooklists[i].children[4].children[0].children[1].previousSibling.children[0].src = "../img/static/heart_icon.png"
            } else if (pageIndex === index && iconName == 'collectIcon' && type.includes('Collected')){ // collected already
                _modifyLikeOrCollect(index, "collectedBy", "reduce", selfUserID)
                const newCollect = selectedBookList[0].collectedBy.filter((user)=> user != selfUserID)
                selectedBookList[0].collectedBy = newCollect
                allBooklists[i].children[4].children[1].children[1].innerText = "Collects: " + selectedBookList[0].collectedBy.length
                allBooklists[i].children[4].children[1].children[1].previousSibling.className = 'collectedButton, btn btn-light' // for button color change
            } else if (pageIndex === index && iconName == 'likeIcon' && type.includes('Liked')){ // liked already
                _modifyLikeOrCollect(index, "likedBy", "reduce", selfUserID)
                const newLike = selectedBookList[0].likedBy.filter((user)=> user != selfUserID)
                selectedBookList[0].likedBy = newLike
                allBooklists[i].children[4].children[0].children[1].innerText = "Likes: " + selectedBookList[0].likedBy.length
                allBooklists[i].children[4].children[0].children[1].previousSibling.className = 'likedButton, btn btn-light' // for button color change
                allBooklists[i].children[4].children[0].children[1].previousSibling.children[0].src = "../img/static/like_icon.png"
            }
        }
    }
    
}

// delete list (admin & creator only)
function deleteBooklist(e){
    e.preventDefault();
    if (e.target.className == 'deleteButton, btn btn-danger'){
        const ID = e.target.parentElement.parentElement.children[0].innerText
        const form = document.getElementById("deleteForm")
        form.children[0].children[0].innerText="Confirm to delete this booklist?"
        form.name = ID
        form.style.display="block"
    }
}

// onclick function: pop up edit form
function openForm() {
    document.getElementById("myForm").style.display = "block";
}
 
// onclick function: close the pop up edit form
function closeForm() {
    document.getElementById("myForm").style.display = "none"
    document.getElementById('booklistNameInput').value =''
    description = document.getElementById('descriptionInput').value = ''
    document.getElementById('booklists').value = ''
    document.querySelector('#bookInputHelp').innerText = "Please enter book ID list and using ; to seperate"
}

// event to load clicked book button into booklist input box
const ul = document.querySelector('#randomBooks')
ul.addEventListener('click', loadBook)
function loadBook(e){
    e.preventDefault;
    if(e.target.className == 'addListID btn btn-outline-info'){
        document.querySelector("#booklists").value += (e.target.nextSibling.innerText+';')
        e.target.className += " active"
    } else if (e.target.className == 'addListID btn btn-outline-info active'){
        let curr = document.querySelector("#booklists").value
        curr = curr.replace((e.target.nextSibling.innerText+';'),'')
        document.querySelector("#booklists").value = curr
        e.target.className = "addListID btn btn-outline-info"
    }
}

// add new booklist
function addNewBooklist(e){
    e.preventDefault();
    if (e.target.className == 'addSubmit, btn'){
        const listName = document.getElementById('booklistNameInput').value
        if (listName.length === 0){
            const bookInputHelp = document.querySelector('#bookInputHelp')
            bookInputHelp.innerText = ("No list name, your booklist name cannot be empty.")
            return;
        }
        const description = document.getElementById('descriptionInput').value
        let result = document.getElementById('booklists').value
        if (result.length === 0){
            bookInputHelp.innerText = ("No book loaded, your booklist must has at least one book.")
            return;
        }
        let ids = []
        const url = '/api/books'
        fetch(url).then((res) => { 
            if (res.status === 200) {
            return res.json() 
        } else {
                res.status(500).send("Internal Server Error")
        }                
        }).then((json) => {
            const all = json.books

            for (each of all){
                ids.push({
                    "bookID": each._id
                })
            }
            return ids
        }).then((ids)=>{
            const books = result.split(";")
            if (books[books.length-1] == ''){
                books.pop()
            }
            // check id validation
            let validInputs = []
            for (item of books) {
                const valid = ids.filter((each) => each.bookID === item)
                if (valid.length === 1) {
                    validInputs.push(valid[0])
                }
            }
            if (validInputs.length === books.length){
                // avoid duplicates
                const uniqueInput = Array.from(new Set(validInputs))
                const bookinput = uniqueInput.map((each)=>each.bookID)
                addBooklist(listName, description, bookinput)
                document.getElementById('booklistNameInput').value =""
                document.getElementById('descriptionInput').value = ""
                closeForm()
                location.reload() 
            } else {
                document.querySelector('#bookInputHelp').innerText = ("Invalid input! Please re-check all your book IDs.")
                return
            }
        }).catch((error)=>{
            log(error)
        })
    }
}

// send post request for add new booklist
function addBooklist(bookname, description, books){
    const url = '/api/booklist'
    let data = {
        listName: bookname,
        listDescription: description,
        creator: _getUserName(),
        creatorID: _getUserID(),
        books: books
    }
    log(data)
    const request = new Request(url, {
        method: 'POST', 
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
    .then(function(res) {
        if (res.status === 200) {
            console.log('added booklist')    
        } else {
            console.log('Failed to add booklist')
        }
        log(res)
    }).catch((error) => {
        log(error)
    })
}


/*********************************** helper functions for DOM *************************************/

// helper for displayAllBooklists: load every booklist card
function _loadCards(lists, userID, userType){
    const tableResultTBODY = document.querySelector('#tableResultTBODY')
    const num = lists.length
    for(let i = 0; i < num; i++) {
        const tr = addBooklistCard(lists[i],userID, userType)
        tableResultTBODY.appendChild(tr)
    }
    _flipPage(1,3)
}

// helper for loadCards: build invidual booklist card
function addBooklistCard(booklist, userID, userType){
    const tr = document.createElement('tr')
    const div = document.createElement('div')
    div.className = 'booklist'

    // <p>  list id
    const id = document.createElement('p')
    id.className = "listID"
    id.appendChild(document.createTextNode("List ID: "))
    const IDcontent = document.createElement('span')
    IDcontent.appendChild(document.createTextNode(booklist.booklistID))
    id.appendChild(IDcontent)

    const userInfo = _getUserName()
    if (userInfo == booklist.creator){ // both users, creator is self
        id.appendChild(_addDeleteButton())
    } else if (userType == 'Admin'){// admin only: delete booklist
        id.appendChild(_addDeleteButton())
    } 
    div.appendChild(id)

    // infoWrap
    const ul1 = document.createElement('ul')
    ul1.className = "infoWrap"

    // li1: booklist name
    const li1 = _addBooklistInfo(booklist.booklistID,booklist.listName,userID,userType)
    ul1.appendChild(li1)

    // li2: list creator
    const selfName = _getUserName()
    const li2 = _addCreator(booklist.creator, selfName, userType, booklist.creatorID)
    ul1.appendChild(li2)

    // li3: create time
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
    const table = _addBookShelf(booklist.books, userID, userType)
    div.appendChild(table)

    // icon bar for like and collect
    const ul2 = _addIconBar(userType, booklist)
    div.appendChild(ul2)

    tr.appendChild(div)
    return tr
}

// pop up for alert guest
function _alertPop(){
    if (confirm("Please login to complete the action.") == true) {
        window.location.href = "/login"
    } else {
        return
    }
}

// flip page helper 
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

// get user id, if no id => guest
function _getUserID(){
    try{
        return (window.location.href.split('?')[1].split('userID=')[1])
    } catch{
        return 'guest'
    }
}

//helper: get user name
function _getUserName(){
    return document.querySelector('.addUserIdToLink').innerText 
}

// helper for addBooklistCard: delete icon for each booklist card (admin or author user only)
function _addDeleteButton(){
    const div1 = document.createElement('div')
    div1.className = 'delete'
    const button3 = document.createElement('button')
    button3.className = "deleteButton, btn btn-danger" 
    button3.appendChild(document.createTextNode("Delete this list"))
    div1.appendChild(button3)
    return div1
}

// helper for addBooklistCard: li element for booklist info
function _addBooklistInfo(booklistID, listName, userID, userType){
    const li1 = document.createElement('li')
    li1.className = "listname"
    const strong1 = document.createElement('strong')
    const name = document.createTextNode("Booklist Name: ")
    strong1.appendChild(name)
    const span1 = document.createElement('span')
    const a1 = document.createElement('a')
    a1.className = "linkColor"
    if (userType === 'Admin' | userType === 'User'){
        a1.href = "/Booklist/Detail?booklistID=" + booklistID + "&userID="+ userID
    } else {
        a1.href = "/Booklist/Detail?booklistID=" + booklistID
    }
    a1.onclick = function open(e){e.preventDefault(); window.location.href = a1.href}
    const nameContent = document.createTextNode(listName)
    a1.appendChild(nameContent)
    span1.appendChild(a1)
    li1.appendChild(strong1)
    li1.appendChild(span1)
    return li1
}

// helper for addBooklistCard: li element for creator info
function _addCreator(creatorName, selfName, userType, authorID){
    const li2 = document.createElement('li')
    li2.className = "listCreator"
    const strong2 = document.createElement('strong')
    const creator = document.createTextNode("Created by: ")
    strong2.appendChild(creator)
    const span2 = document.createElement('span')
    const a2 = document.createElement('a')
    a2.className = "linkColor"
    if (userType === 'Admin' | userType === 'User'){
        if (creatorName == selfName){ 
            a2.href = "/user/"+_getUserID() // go to self-main-page
        } else { // visit other user
            a2.href = "/user/"+_getUserID()+"/"+authorID
        }
        a2.onclick = function open(e){e.preventDefault(); window.location.href = a2.href}
    } else { // guest
        a2.href = ""
        a2.onclick = function alert(e){e.preventDefault(); _alertPop()} // redirect to login
    }
    const creatorContent = document.createTextNode(creatorName)
    a2.appendChild(creatorContent)
    span2.appendChild(a2)
    li2.appendChild(strong2)
    li2.appendChild(span2)
    return li2
}

// helper for addBooklistCard: table element for bookshelf
function _addBookShelf(books, userID, userType){
    const table = document.createElement('table')
    table.className = "bookshelf"
    const tbody = document.createElement('tbody')
    tbody.className = 'bookshelf tbody'
    const tr1 = document.createElement('tr')
    const tr2 = document.createElement('tr')

    let bookNum = books.length
    if (books.length > 3){
        bookNum = 3
    }

    for (let j = 0; j < bookNum; j++){
        const newImg = document.createElement('th')
        const img = document.createElement('img')
        img.className = "bookimg"
        img.src = books[j].coverURL
        newImg.appendChild(img)
        tr1.appendChild(newImg)
        const newBookLink = document.createElement('th')
        const bookLink = document.createElement('a')
        bookLink.className = "book"
        if (userType === 'Admin' | userType === 'User'){
            bookLink.href = "/BookDetail?bookID=" + books[j]._id +"&userID="+ _getUserID()
        } else {
            bookLink.href = "/BookDetail?bookID=" + books[j]._id
        }
        bookLink.onclick = function open(e){e.preventDefault(); window.location.href = bookLink.href}
        bookLink.appendChild(document.createTextNode(books[j].name))
        newBookLink.appendChild(bookLink)
        tr2.appendChild(newBookLink)
    }
    if (books.length > 3){
        const more = document.createElement('th')
        more.appendChild(document.createTextNode('......'))
        tr2.appendChild(more)
    }
    tbody.appendChild(tr1)
    tbody.appendChild(tr2)
    table.appendChild(tbody)
    return table
}

// helper for addBooklistCard: like/collect icon
function _addIconBar(userType, booklist){
    const likes = booklist.likedBy.length
    const collect = booklist.collectedBy.length
    // icon wrap
    const ul2 = document.createElement('ul')
    ul2.className = "iconWrap"

    // li1: like
    const liLike = document.createElement('li')
    liLike.className = "infoElement"
    const button1 = document.createElement('button')
    button1.className = "likeButton, btn btn-light"
    const iconImgLike = document.createElement('img')
    iconImgLike.className = "likeIcon"
    iconImgLike.src = "../img/static/like_icon.png"

    if (userType === 'Admin' | userType === 'User'){
        if (_hasLikedOrCollected(booklist,"likedBy")){
            iconImgLike.src = "../img/static/heart_icon.png"
            button1.className = "likeButton, btn btn-outline-success"
        }
    }
    button1.appendChild(iconImgLike)
    liLike.appendChild(button1)

    const spanLike = document.createElement('span')
    spanLike.className = "likeNum"
    let likeNum = document.createTextNode("Likes: "+likes)
    if (userType === 'Admin' | userType === 'User'){
        if (_hasLikedOrCollected(booklist,"likedBy")){
            likeNum = document.createTextNode("Liked: "+likes)
        }
    } 
    spanLike.appendChild(likeNum)
    liLike.appendChild(spanLike)

    // li2: collect
    const liCollect = document.createElement('li')
    liCollect.className = "infoElement"
    const button2 = document.createElement('button')
    button2.className = "collectButton, btn btn-light" 
    const iconImgCollect = document.createElement('img')
    iconImgCollect.className = "collectIcon"
    iconImgCollect.src = "../img/static/click-&-collect.png"
    if (userType === 'Admin' | userType === 'User'){
        if (_hasLikedOrCollected(booklist,"collectedBy")){
            button2.className = "collectButton, btn btn-success"
        }
    }
    button2.appendChild(iconImgCollect)
    liCollect.appendChild(button2)

    const spanCollect = document.createElement('span')
    spanCollect.className = "collectNum"
    let collectNum = document.createTextNode("Collected: " + collect)
    if (userType === 'Admin' | userType === 'User'){
        collectNum = document.createTextNode("Collects: " + collect)
        if (_hasLikedOrCollected(booklist,"collectedBy")){
            collectNum = document.createTextNode("Collected: " + collect)
        }
    }
    spanCollect.appendChild(collectNum)
    liCollect.appendChild(spanCollect)
    
    ul2.appendChild(liLike)
    ul2.appendChild(liCollect)

    // event listener
    if (userType === 'Admin' | userType === 'User'){
        booklistTable.addEventListener('click', increaseLikeOrCollect)
    } else { // guest
        booklistTable.addEventListener('click', alertGuestToLogin)
    }
    return ul2
}

// patch modify for like/collect
function _modifyLikeOrCollect(id, target, operation, who){
    const booklist = BooklistsList.filter((list)=> list.booklistID == id )
    if(!_hasLikedOrCollected(booklist[0], target) && operation == 'reduce'){
        log('error: invalid reduce')
        return
    } else if (_hasLikedOrCollected(booklist[0], target) && operation == 'add'){
        log('error: invalid add')
        return
    }
    const url = '/api/booklist/'+id
    let data = {
        target: target,
        operation: operation,
        who: who
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
        if (res.status === 200) {
            console.log('updated')    
        } else {
            console.log('Failed to updated')
        }
        log(res)
    }).catch((error) => {
        log(error)
    })
}

// helper for _modifyLikeOrCollect: checking if the current user has liked/collected for certain booklist
function _hasLikedOrCollected(booklistItem, target){
    const self = _getUserID()
    const contains = booklistItem[target].includes(self)
    if(contains){
        return true
    } else {
        return false
    }
}

/*********************************** on load function *************************************/
getBooklists()