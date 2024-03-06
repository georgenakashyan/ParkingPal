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