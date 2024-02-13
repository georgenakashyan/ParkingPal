document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
});
  
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(userCredential => {
        const user = userCredential.user;
        mainPage();
    })
    .catch(console.log)
}

function emailAndPasswordLogin() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        mainPage();
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorcode + " --- " + errorMessage)
    });
}

function mainPage(){
    location.href="Parking-Pal.html";
}


