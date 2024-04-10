//contains all functions pertaining to Firebase Auth
//Include AccountSetup.js, SignUp.js, ResetPassword.js
/**
 * Updates the user inforemation based on type selected
 */
function updateUserType(type) {
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const accountDoc = db.collection("Account").doc(user.uid);
    const typeDoc = db.collection(type);
    const managerBoolean = type == "Manager";
    //Notice switch was changed to if statement
    if(managerBoolean){
        typeDoc.add({
            Account: "Account/" + user.uid,
            Billing: "",
            Garages: []
        }).then((doc) => {
            accountDoc.set({
                Type_ID: type,
                Profile: "Manager/" + doc.id
            }, { merge: true });
            mainPage();
        });
    }else{
        typeDoc.add({
            Accessibility: false,
            Account: "Account/" + user.uid,
            Favorites: [],
            Payments: [],
            Reservations: [],
            Reviews: [],
            Vehicles: [],
        }).then((doc) => {
            accountDoc.set({
                Type_ID: type,
                Profile: "Customer/" + doc.id
            }, { merge: true });
            mainPage();
        });
    }
}
/**
 * Allows user to reset their password using their email address
 */
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
        errorField.style.setProperty("color", "red");
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
/**
 * Creates user account based on information filled out by user
 */
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
                    errorField.innerHTML = "Some went wrong";
                    console.log(error.message);
                    break;
            }
        });
    }
}
//TODO Delete other JS and use this one