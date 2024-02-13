document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
});
  
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(userCredential => {
        const user = userCredential.user;
    })
    .catch(console.log)
}