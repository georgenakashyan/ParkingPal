document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
});
  
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    firebase.auth().signInWithPopup(provider).then(userCredential => {
        const user = userCredential.user;
        const accountExists = firebase.firestore().collection("Account").doc(user.uid);
        if (accountExists != null) {
            createAccountDocument(userCredential, user.email, "Anonymous", "Customer");
        }
        mainPage();
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + " --- " + errorMessage);
    });
}

function emailAndPasswordLogin(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        mainPage();
    })
    .catch((error) => {
        switch (error.code) {
            case 'auth/email-already-in-use':
              console.log(`Email address ${this.state.email} already in use.`);
              break;
            case 'auth/invalid-email':
              console.log(`Email address ${this.state.email} is invalid.`);
              break;
            case 'auth/operation-not-allowed':
              console.log(`Error during sign up.`);
              break;
            case 'auth/weak-password':
              console.log('Password is not strong enough. Add additional characters including special characters and numbers.');
              break;
            default:
              console.log(error.message);
              break;
          }
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
        console.log(errorCode + " --- " + errorMessage);
    });
}

function mainPage() {
    location.href="Parking-Pal.html";
}

function makeAccountEmailAndPassword(email, firstName, lastName, password, retypePassword) {
    if (password == retypePassword) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Auth Account successfully created");
            createAccountDocument(userCredential, email, firstName, lastName);
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode + " --- " + errorMessage);
        });
    } else {
        console.log("Mismatch password")
    }
}

function createAccountDocument(userCredential, email, firstName, lastName) {
    var user = userCredential.user;
    var newAccount = {
        Email: email,
        FirstName: firstName,
        LastName: lastName,
        Profile: "",
        Type_ID: "Unfinished",
    }
    firebase.firestore().collection("Account").doc(user.uid).set(newAccount);
}

function isCustomerExist() {

}

function isManagerExist() {

}