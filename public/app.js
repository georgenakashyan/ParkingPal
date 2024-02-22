document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
});
  
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    firebase.auth().signInWithPopup(provider).then(userCredential => {
        const user = userCredential.user;
        const accountExists = firebase.firestore().collection("Account").doc(user.uid);
        if (accountExists == null) {
            createAccountDocument(user, user.email, "Anonymous", "Customer");
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
    var errorField = document.getElementById("notification-text");
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        errorField.innerHTML = "";
        mainPage();
    })
    .catch((error) => {
        switch (error.code) {
            case 'auth/invalid-credential':
                errorField.innerHTML = "Email or password is incorrect.";
                break;
            case 'auth/invalid-email':
                errorField.innerHTML = "Email address is invalid.";
                break;
            case 'auth/missing-password':
                errorField.innerHTML = "Enter your password.";
                break;
            case 'auth/operation-not-allowed':
                errorField.innerHTML = "Error during sign up.";
                break;
            default:
                console.log(error.message);
                break;
        }
    });
}

function resetPassword(email) {
    var errorField = document.getElementById("notification-text");
    const user = firebase.auth().currentUser;
    if (user) {
        let email = user.email;
    }
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
        errorField.style.setProperty("color", "green");
        errorField.innerHTML = "Sent password reset email";
    })
    .catch((error) => {
        switch (error.code) {
            case 'auth/missing-email':
                errorField.innerHTML = "Enter your email.";
                break;
            case 'auth/invalid-email':
                errorField.innerHTML = "Email address is invalid.";
                break;
            case 'auth/operation-not-allowed':
                errorField.innerHTML = "Error during sign up.";
                break;
            default:
                errorField.innerHTML = "";
                console.log(error.message);
                break;
        }
    });
}

function mainPage() {
    location.href="Parking-Pal.html";
}

function makeAccountEmailAndPassword(email, firstName, lastName, password, retypePassword) {
    var errorField = document.getElementById("notification-text");
    if (inputNullOrEmpty(firstName)) {
        errorField.innerHTML = "Please enter your first name";
    } else if (inputNullOrEmpty(lastName)) {
        errorField.innerHTML = "Please enter your last name";
    } else if (password != retypePassword) {
        errorField.innerHTML = "Your passwords do not match";
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Auth Account successfully created");
                createAccountDocument(user, email, firstName, lastName);
                errorField.innerHTML = "";
                mainPage();
            })
            .catch((error) => {
                switch (error.code) {
                    case 'auth/missing-email':
                        errorField.innerHTML = "Enter your email.";
                        break;
                    case 'auth/missing-password':
                        errorField.innerHTML = "Enter your password.";
                        break;
                    case 'auth/email-already-in-use':
                        errorField.innerHTML = "Email address is already in use.";
                        break;
                    case 'auth/invalid-credential':
                        errorField.innerHTML = "Email or password is incorrect.";
                        break;
                    case 'auth/invalid-email':
                        errorField.innerHTML = "Email address is invalid.";
                        break;
                    case 'auth/operation-not-allowed':
                        errorField.innerHTML = "Error during sign up.";
                        break;
                    case 'auth/weak-password':
                        errorField.innerHTML = "Password is not strong enough. Add additional characters including special characters and numbers.";
                        break;
                    default:
                        errorField.innerHTML = "";
                        console.log(error.message);
                        break;
                }
            });
    }
}

function createAccountDocument(user, email, firstName, lastName) {
    var newAccount = {
        Email: email,
        FirstName: firstName,
        LastName: lastName,
        Profile: "",
        Type_ID: "Unfinished"
    };
    firebase.firestore().collection("Account").doc(user.uid).set(newAccount)
    .then(() => {
        console.log("document created");
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + " --- " + errorMessage);
    });
}

function isCustomerExist() {

}

function isManagerExist() {

}

function inputNullOrEmpty(input) {
    return (input == null || input === "");
}