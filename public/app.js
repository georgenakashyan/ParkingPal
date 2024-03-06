document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
        console.log("auth state changed")
        checkUserPageRequest();
    });
});

async function checkUserPageRequest() {
    const user = firebase.auth().currentUser;
    await getAccountType()
    .then((userType) => {
        if (userType == "Unfinished"
                && location.href.indexOf("AccountSetup") == -1 ) {
            mainPage();
        } else if (location.href.indexOf("index.html") > -1 
                || location.href.indexOf("SignUp.html") > -1 
                || location.href.indexOf("PasswordReset.html") > -1) {
            mainPage();
        } else if (userType != "Unfinished" 
                && location.href.indexOf(userType) == -1) {
            mainPage();
        }
    })
    .catch((error) => {
        if (location.href.indexOf("index.html") == -1 
                && location.href.indexOf("SignUp.html") == -1 
                && location.href.indexOf("PasswordReset.html") == -1) {
            location.href = "index.html";
        }
    });
}

function googleLogin() {
    return new Promise((resolve, reject) => {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        firebase.auth().signInWithPopup(provider)
        .then((userCredential) => {
            const user = userCredential.user;
            const displayName = user.displayName;
            const accountRef = firebase.firestore().collection("Account").doc(user.uid);
            accountRef.get()
            .then((doc) => {
                if (!doc.exists) {
                    return createAccountDocument(user, user.email, displayName, "");
                } else {
                    resolve();
                }
            })
            .then(() => {
                mainPage();
                resolve();
            })
            .catch((error) => {
                console.error("Error creating or fetching account document:", error);
                reject(error);
            });
        })
        .catch((error) => {
            console.error("Error in googleLogin:", error);
            reject(error);
        });
    });
}

function emailAndPasswordLogin(email, password) {
    return new Promise((resolve, reject) => {
        var errorField = document.getElementById("notification-text");
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            errorField.innerHTML = "";
            document.getElementById("login-form").reset(); 
            mainPage();
            resolve("Login successful");
        })
        .catch((error) => {
            switch (error.code) {
                case 'auth/invalid-credential':
                    document.getElementById("password").innerHTML = "";
                    errorField.innerHTML = "Email or password is incorrect.";
                    break;
                case 'auth/invalid-email':
                    document.getElementById("password").innerHTML = "";
                    errorField.innerHTML = "Email address is invalid.";
                    break;
                case 'auth/missing-password':
                    document.getElementById("password").innerHTML = "";
                    errorField.innerHTML = "Enter your password.";
                    break;
                case 'auth/operation-not-allowed':
                    document.getElementById("password").innerHTML = "";
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
        Type_ID: ""
    };
    firebase.firestore().collection("Account").doc(user.uid).set(newAccount)
    .then(() => {
        console.log("document created");
        mainPage();
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