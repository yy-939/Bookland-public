const log = console.log;

/****** User signUP ******/

const signup = document.querySelector('#signup');
signup.addEventListener('click', change_page);

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
    if (username!='' && password!=''){
        const url = '/register/'+username
        fetch(url).then((res) => { 
            console.log(res.status)
            if (res.status === 200) {
                const p = document.querySelector('p')
                p.innerText = 'username already been used, please try again'
           } 
           else {
                console.log("register")
                const url2 = '/api/addUser';
                console.log(url2)
                let data = {
                    username: username,
                    password: password,
                }
                const request = new Request(url2, {
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
                        return res.json()   
                    } else {
                        const p = document.querySelector('p')
                        p.innerText = 'register failed' // should never come here
                    }
                }).then((json) => { 
                    window.location.href = "/index.html?userID=" + json.user._id
                })
            }
        }).catch((error) => {
            log(error)
        })
    }
} 

    
