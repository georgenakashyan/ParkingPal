var userLocation = [40.78343000, -73.96625000];
document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
        console.log("auth state changed")
        checkUserPageRequest();
    });
});

function checkUserPageRequest() {
    const user = firebase.auth().currentUser;
    if (!user && location.href.indexOf("index.html") == -1 && location.href.indexOf("SignUp.html") == -1 && location.href.indexOf("PasswordReset.html") == -1) {
        location.href = "index.html";
    } else if (user && (location.href.indexOf("index.html") > -1 || location.href.indexOf("SignUp.html") > -1 || location.href.indexOf("PasswordReset.html") > -1)) {
        mainPage();
    }
}

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    firebase.auth().signInWithPopup(provider)
    .then((userCredential) => {
        const user = userCredential.user;
        const accountRef = firebase.firestore().collection("Account").doc(user.uid);
        accountRef.get()
        .then((doc) => {
            if (!doc.exists) {
                createAccountDocument(user, user.email, user.displayname, "");
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        });
        mainPage();
    })
    .catch((error) => {
        console.log("Error in googleLogin");
    });
}

function emailAndPasswordLogin(email, password) {
    return new Promise((resolve, reject) => {
        var errorField = document.getElementById("notification-text");
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            errorField.innerHTML = "";
            mainPage();
            resolve("Login successful");
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
                    console.error(error.message);
                    break;
            }
            reject(error);
        });
    });
}

function logOut() {
    firebase.auth().signOut();
    location.href = "index.html";
}

function mainPage() {
    return new Promise((resolve, reject) => {
        getAccountType()
        .then((accType) => {
            switch (accType) {
                case "Customer":
                    location.href = "CustomerView.html";
                    break;
                case "Manager":
                    location.href = "ManagerView.html";
                    break;
                default:
                    location.href = "AccountSetup.html";
                    break;
            }
            resolve();
        })
        .catch((error) => {
            console.error("Error in mainPage:", error);
            reject(error);
        });
    });
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
        console.log("Error in createAccountDocument");
    });
}

function inputNullOrEmpty(input) {
    return (input == null || input === "");
}

function getAccountType() {
    return new Promise((resolve, reject) => {
        const user = firebase.auth().currentUser;
        if (!user) {
            reject("User not logged in");
            return;
        }
        const db = firebase.firestore();
        const accountDoc = db.collection("Account").doc(user.uid);
        accountDoc.get().then((doc) => {
            if (doc.exists) {
                const typeID = doc.data().Type_ID;
                if (typeID.includes("Customer")) {
                    resolve("Customer");
                } else if (typeID.includes("Manager")) {
                    resolve("Manager");
                } else {
                    resolve("Unfinished");
                }
            } else {
                reject("Account document does not exist");
            }
        }).catch((error) => {
            reject(error);
        });
    });
}