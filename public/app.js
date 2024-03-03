var userLocation = [40.78343000, -73.96625000];
document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
        if (!user && location.href.indexOf("index.html") == -1 && location.href.indexOf("SignUp.html") == -1 && location.href.indexOf("PasswordReset.html") == -1) {
            location.href = "index.html";
        }
    });
});

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    firebase.auth().signInWithPopup(provider)
    .then(userCredential => {
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

function logOut() {
    firebase.auth().signOut();
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
    location.href="ManagerView.html";
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

function initMap() {
    setLocation();
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        streetViewControl: false,
        mapTypeControl: false,
        center: {lat: userLocation[0], lng: userLocation[1]}
    });
    removedPOI = [
        {featureType: "poi.business", stylers: [{ visibility: "off" }],},
        {elementType: "labels.icon", stylers: [{ visibility: "off" }],}
    ];
    map.setOptions({styles: removedPOI});

    // Add fictional parking garages as markers
    //TODO: add areaCode based on latitude and longitude (probably with google maps API)
    var areaCode = 10024;
    var garageList = findGarages(areaCode);
    fillGarages(map, garageList);
}

async function findGarages(areaCode) {
    try {
        // Query Firestore collection "Garage" for documents with matching areaCode
        firebase.firestore().collection("Garage").where("AreaCode", "==", areaCode)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    console.log(doc.id + " => " + doc.data());
                });
            })
            .catch((error) => {
                console.log("Error getting garages: " + error);
            });
    
        // Array to store matching documents
        const matchingGarages = [];
    
        // Iterate through query results and add documents to matchingGarages array
        querySnapshot.forEach((doc) => {
          matchingGarages.push({ id: doc.id, data: doc.data() });
        });
    
        // Return array of matching documents
        return matchingGarages;
    } catch (error) {
        // Handle errors
        console.error("Error searching garages:", error);
        return []; // Return empty array in case of error
    }
}

function setLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setCoordinates, setDefaultCoordinates)
    }
}

function setCoordinates(position) {
    userLocation = [position.coords.latitude, position.coords.longitude];
}

function setDefaultCoordinates() {
    userLocation = [40.78343000, -73.96625000];
}

function fillGarages(map, garageList) {
    garageList.forEach(function(parkingGarage) {
        var marker = new google.maps.Marker({
            position: parkingGarage.location,
            map: map,
            title: parkingGarage.name
        });

        var infoWindow = new google.maps.InfoWindow({
            content: '<div><strong>' + parkingGarage.name + '</strong><br>' +
                    'Some information about the garage</div>'
        });

        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
    });
}