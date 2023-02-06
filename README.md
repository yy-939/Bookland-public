# BookLand

## Overall Purpose
The overall objective of the project is to build a website for readers to share their thoughts on readings with others. Through this platform, readers can view various kinds of book lists made by other readers, create their own book lists, and make friends that have similar reading tastes.

## Main Features
### Regular User
* a basic user profile with a unique username, a signature (a short description of themselves), and a photo (the user's head portrait)
* edit signature
* make posts to share their opinions about books
* collect or like posts
* customize multiple book lists regarding different demands, as well as a collection of their favorite posts and booklists.

### Admin User
* all regular users' features
* manage the account status of regular users, including deactivating and reactivating accounts. Deactivated users cannot login
* add or remove books from the database and update book descriptions
* manage posts (specifically, delete posts of users)

## Instructions
### Online access
* link: https://csc309-book-land.herokuapp.com/

* database link: `mongodb+srv://team10:bookland@cluster0.ur99l.mongodb.net/BookLandAPI?retryWrites=true&w=majority`
### Local access
Please `cd` to the repo and run following cmds:  
Start your local Mongo database.  For example, in a separate terminal window:


#### create and run local Mongo database in the root directory of the repo
`mkdir mongo-data`
`mongod --dbpath mongo-data`  
`npm install`  
`npm init`  
`npm start`  
then port **50001** is running, can access the page by this link :**localhost:50001**

## Page Details
### Home Page (Index)
 - The home page is index.html. They can view recommended books and posts demostrated in home page. They can also use top menu to visit other pages and login/register.
 - There is a welcome header for signed in users (Hello [username], what would you like to read today), the username will be dynamically. 
 - Three books appears most frequently among users' created booklists will become recommended books displayed in the home page (including homepage for end users & admin uses)
 - There should be maximum of 3 posts demostrated in home page.
 - Guests cannot visit profiles of users whose posts are demostrated in this home page. Guests have to login/register first.
 - Admin user can manage posts demostrated in the home page. They can choose which post needs to be replaced in the first select box, and the replacement in the second select box.
 
### Login/Register
  - If a use is blocked (deactivated by admin users), this user cannot sign in
  - Guests can register to be a end-user. The required username or password has max length of 10

    
  ### User
  - **Regular User**
    - When logged in as regular user, the right corner of the top menu bar will show as user's name.
    - When a regular user accesses to his own main profile page, user can edit signature and delete his own posts and booklists.
    - When reviewing regular user's profile, the 'edit signature' buttons will be hidden.
  - **Admin User**
    - The right corner of the top menu bar will show as 'Admin'.
    - Has all feature as regular user.
    - When accessing to admin's own main profile page, admin has two more buttons than regular user, where they can manage user's status, and direct to 'manage books' page.
    - When reviewing admin user's profile, the two extra buttons will be hidden.
    - When an admin review regular user's profile page, he can still delete their posts and booklists.

  ### BooklistDetail
  - **Guest**
    - All guests have top menu bar that allows to navigate specific book detail or booklist detail pages for guests.
    - All guests have login/register button at the top-right corner that allows to login or register.
    - All information of the booklist is displayed on the main area. Booklist section have links of books that allow the guest navigate to the associated book in guest permission. 
  - **Regular User**
    - All end users have the same functionalities and displayings as the guest.
    - Besides, they could edit their own booklists by changing book collections, or edit the description
  - **Admin User**
    - All admins have the same functionalities and displayings as the end users.
  
  ### BookMainPage
  - **Guest**
    - All guests have top menu bar that allows to navigate specific book detail or booklist detail pages for guests.
    - All guests have login/register button at the top-right corner that allows to login or register.
    - All books are listed on the main section in different pages. Each page have at most 3 book cards. 
    - The bottom of each page has button to flip to different pages.
  - **Regular User**
    - All end users have top menu bar that allows to navigate specific book detail or booklist detail pages for end users.
    - All end users have quit button at the top-right corner that allows to quit the sign-in. Or a grey button that naigate to their own user page.
    - All books are listed on the main section in different pages. Each page have at most 3 book cards. 
    - The bottom of each page has button to flip to different pages.
  - **Admin User**
    - All admin users have top menu bar that allows to navigate specific book detail or booklist detail pages for admin.
    - All admin users have quit button at the top-right corner that allows to quit the sign-in. Or a grey button that naigate to their own user page.
    - All books are listed on the main section in different pages. Each page have at most 3 book cards. 
    - The bottom of each page has button to flip to different pages.
    - All admin users have functions to add or delete books over the website.
    - For adding books, all parameters are required except Cover URL. If no specifying of Cover URL, the default cover picture would be assigned for the new added book.

  ### BooklistMainPage
  - **Guest**
    - All guests have top menu bar that allows to navigate specific book detail or booklist detail pages for guests.
    - All guests have login/register button at the top-right corner that allows to login or register.
    - All booklists are listed on the main section in different pages. Each page have at most 3 booklist cards. 
    - The bottom of each page has button to flip to different pages.
    - Two buttons below the page title that allows to change the sorting ways of all booklist cards, either by list ID or alphabetically. The default soring order is by list ID. 
    - All booklist cards have links that allow to navigate to specific booklist detail, creator, book detail pages for guests.
    - There are like or collect button, but not allow guest to perform the actions. Once they click, it will raise a box and allow guest to register/log-in.
  - **Regular User**
    - All end users have top menu bar as well. 
    - All end users have quit button at the top-right corner that allows to quit the sign-in. Or a grey button that naigate to their own user page.
    - All booklist cards displaying and fliping pages are same as guest. 
    - All booklist cards have links that allow to navigate to specific booklist detail, creator, book detail pages for end users.
    - Like and collect buttons are availble to end users for like or collect. It only allows to like or collect once, double click will cancel the previous action.
    - Below the sorting buttons, Add new booklist columns allows end users to create new booklist. List name is required, description is optional. 
    - Inside adding booklist prompted box, all books are listed as reference, end users will click browser button to randomly discover their new booklist, click the book name button to load the book IDs into input box, and then create.
    - End users could delete their own created booklist, once deleted all users that have collected or liked the list will be removed.
  - **Admin User**
    - All admin users have all the end users functionalities and displayings. 
    - Besides, admins could delete every booklists.

  ### BookDetailnPage
  - **Guest**
    - All guests have top menu bar that allows to navigate specific book detail or booklist detail pages for guests.
    - All guests have login/register button at the top-right corner that allows to login or register. 
    - The bottom of each page has button to flip to different pages.
    - There are no like or collect button for guests
  - **Regular User**
    - All end users have top menu bar as well. 
    - All end users have quit button at the top-right corner that allows to quit the sign-in. Or a grey button that naigate to their own user page.
    - Users can add post for book they like. 
    - All posts have links that allow to navigate to specific creator, book detail pages for end users.
    - Like and collect buttons are availble to end users for like or collect. It only allows to like or collect once, double click will cancel the previous action.
  - **Admin User**
    - All admin users have all the end users functionalities and displayings. 
    - Besides, admins could delete every posts.
    - admin users can edit book description

## Routers
----------------
- app.get('/'): redirect to home page
- app.get('/logout'): for user logout
- app.get('/login'): redirect to login page
- app.get('/register'): redirect to register page
- app.get('/BookMain'): redirect to book main page
- app.get('/BooklistMain'): redirect to booklist main page
- app.get('/Booklist/Detail'): redirect to individual booklist detail page, but with the query of booklistID(i.e. '/Booklist/Detail?booklistID=<booklistID>')
-

### User
----------------
- app.get('/login/:username/:password'): will verify if the user can be found by the provided parameter username and password. In addition, if the user exists, it will check if the user is currently blocked. If all passed, it will send the corresponding user. Used in Page: login
- app.get('/register/:username'): for register verify. If a user can be found by the provided parameter username, it will send the corresponding user. If not, it will send error then register page will handle. Used in Page: register
- app.get('/api/users'): return all users. Used in Page: 
- app.get('/api/users/:id')： return the corresponding user if user exists. Used in Page: 
- app.post('/api/addUser'): add a user. Request body must include username and password. If the type is not provided, will be 'User' by default. Used in Page: register
- app.delete('/api/deleteUser/:userID'): delete a user by userID.
-

### Post
----------------
- app.get('/api/posts'): get all posts. Used in Page: index
- app.get('/api/posts/:postID'): get post by postID. Used in Page: index
- app.post('/api/addPost'): create a post. Request body must indluce bookID, userID, booktitle, username. Used in Page:
- app.patch('/api/postsorder/:postID'): update a post's order. Order is used to keep track of the display order in index page. Used in Page: index
- app.patch('/api/posts/:postID'): update a post's info and related user's info. Request body should provides: operation (add/reduce), value (userID), target(likes, collects). Used in Page: index

### Book
----------------
- app.get('/api/books'): get all books. Used in Page: book main page, etc.
- app.get('/api/book'): get individual book. Used in Page: book detail page, etc.
- app.post('/api/book'): post individual book. Used in Page: book main page add new book function, etc.
- app.delete('/api/book/:bookID'): delete individual book. Used in Page: book main page delete book function, etc.
- app.patch('/api/book/:bookID): edit the description of the book, etc. 

### Booklist
----------------
- app.get('/api/booklists'): get all booklists. Used in Page: booklist main page, etc.
- app.get('/api/booklists/:booklistID'): get individual booklist. Used in Page: booklist detail page, etc.
- app.post('/api/booklist'): post individual booklist. Used in Page: booklist main page add new booklist function, etc.
- app.delete('/api/booklist/booklistID'): delete individual booklist. Used in Page: booklist main page delete booklist function, etc.
- app.patch('/api/booklist/booklistID'): update individual booklist infomation for who liked or collected. Used in Page: booklist main page click like/collect function, etc.
- app.patch('/api/booklist/content/:booklistID'): update individual booklist content operated by the creator. Used in Page: booklist detail page edit description/books function, etc.

## Copyright
this project is written by @Yuewei Wang @Yongyi Xu @Yiyun Ding @Siwei Tang
