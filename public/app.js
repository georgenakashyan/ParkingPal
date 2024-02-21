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
    var error = document.getElementById("notification-text");
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        mainPage();
    })
    .catch((error) => {
        switch (error.code) {
            case 'auth/email-already-in-use':
                error.innerHTML = "Email address is already in use.";
                break;
            case 'auth/invalid-email':
                error.innerHTML = "Email address is invalid.";
                break;
            case 'auth/operation-not-allowed':
                error.innerHTML = "Error during sign up.";
                break;
            case 'auth/weak-password':
                error.innerHTML = "Password is not strong enough. Add additional characters including special characters and numbers.";
                break;
            default:
                console.log(error.message);
                break;
        }
    });
}

function resetPassword(email) {
    var error = document.getElementById("notification-text");
    const user = firebase.auth().currentUser;
    if (user) {
        let email = user.email;
    }
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
        // Password reset email sent!
    })
    .catch((error) => {
        switch (error.code) {
            case 'auth/email-already-in-use':
                error.innerHTML = "Email address is already in use.";
                break;
            case 'auth/invalid-email':
                error.innerHTML = "Email address is invalid.";
                break;
            case 'auth/operation-not-allowed':
                error.innerHTML = "Error during sign up.";
                break;
            case 'auth/weak-password':
                error.innerHTML = "Password is not strong enough. Add additional characters including special characters and numbers.";
                break;
            default:
                console.log(error.message);
                break;
        }
    });
}

function mainPage() {
    location.href="Parking-Pal.html";
}

function makeAccountEmailAndPassword(email, firstName, lastName, password, retypePassword) {
    var error = document.getElementById("notification-text");
    if (inputNullOrEmpty(firstName)) {
        error.innerHTML = "Please enter your first name";
    } else if (inputNullOrEmpty(lastName)) {
        error.innerHTML = "Please enter your last name";
    } else if (password != retypePassword) {
        error.innerHTML = "Your passwords do not match";
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Auth Account successfully created");
                createAccountDocument(userCredential, email, firstName, lastName);
                mainPage();
            })
            .catch((error) => {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        error.innerHTML = "Email address is already in use.";
                        break;
                    case 'auth/invalid-email':
                        error.innerHTML = "Email address is invalid.";
                        break;
                    case 'auth/operation-not-allowed':
                        error.innerHTML = "Error during sign up.";
                        break;
                    case 'auth/weak-password':
                        error.innerHTML = "Password is not strong enough. Add additional characters including special characters and numbers.";
                        break;
                    default:
                        console.log(error.message);
                        break;
                }
            });
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

function inputNullOrEmpty(input) {
    return (input == null || input === "");
}