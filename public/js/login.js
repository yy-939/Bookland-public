const log = console.log;

/****** User signin ******/

// button trigger
const signin = document.querySelector('#signin');
signin.addEventListener('click', change_page);

// press key enter trigger
const passwordfield = document.querySelector('#password')
passwordfield.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        change_page();
    }
});


function change_page(){  
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;  
    const url = '/login/'+username+'/'+password
    fetch(url).then((res) => { 
        console.log(res.status)
        if (res.status === 200) {
           return res.json() 
       } 
       else {
        if (res.status == 404){
            const p = document.querySelector('p')
            p.innerText = 'username or password not correct, please try again'
            log("invalid input")
           }
           else if (res.status == 400){
            const p = document.querySelector('p')
            p.innerText = 'your account is blocked'
            log("status invalid")
           }  
       }   
    }).then((json) => { 
        if (json != null){
            window.location.href = "/index.html?userID=" + json.user._id
        }
    }).catch((error) => {
        log(error)
    })
}


    

  