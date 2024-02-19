document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
});
  
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(userCredential => {
        const user = userCredential.user;
        mainPage();
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorcode + " --- " + errorMessage);
    });
}

function emailAndPasswordLogin(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        mainPage();
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorcode + " --- " + errorMessage);
    });
}

function resetPassword(email) {
    const user = firebase.auth().currentUser;
    if (user) {
        let email = user.email;
    }
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
        // Password reset email sent!
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

function mainPage() {
    location.href="Parking-Pal.html";
}


