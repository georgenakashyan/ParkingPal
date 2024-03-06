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