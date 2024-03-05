document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
        if (!user && location.href.indexOf("index.html") == -1 && location.href.indexOf("SignUp.html") == -1 && location.href.indexOf("PasswordReset.html") == -1) {
            location.href = "index.html";
        }
    });
});

/**
 * Main method for requesting information from firebase
 * call this instead of each method for getting information
 */
function main(){
    const auth = firebase.auth();
    const user=auth.currentUser;
    if(user){
        const uid=user.uid;
        console.log(uid);
        displayAccount(uid);
        //displayGarage();
    }else{
        console.log("The user is null");
    }
}

/**
 * pulls info from 'Account' and displays it
 * @param {*} userID 
 */
function displayAccount(userID){
    const db = firebase.firestore();
    const auth = firebase.auth();
    const user=auth.currentUser;
    const profileInfo = db.collection('Account').doc(userID);
    const doc = profileInfo.get();

    if(!doc.exists){
        console.log("The doc is null or "+userID);
    }
    else{
        document.getElementById("name").innerHTML = doc.data().FirstName;
        document.getElementById("email").innerHTML = doc.data().Email;
    }
}
/**
 * pulls info from 'Garage' and displays it
 * @param {*} userID 
 */
function displayGarage(profileLink){
    const profileInfo = db.collection('Manager').doc(profileLink);
    const doc = profileInfo.get();
    if(!doc.exists){
        console.log('No such document');
    }
    else{
        console.log('Document data:',doc.data());
    }
}

/**
 * this will add garages to the firebase database
 */
function addGarage(){
    //gets info about garage
    const user=firebase.auth().currentUser;
    var address=doc.getElementById(/*put in HTML references*/);
    var AreaCode=doc.getElementById(/*put in HTML references*/);
    var CloseTime=firebase.firestore.Timestamp.fromDate(new Date(doc.getElementById(/*put in HTML references*/)));
    var Manager=user.uid;
    var Name=doc.getElementById(/*put in HTML references*/);
    var OpenTime=firebase.firestore.Timestamp.fromDate(new Date(doc.getElementById(/*put in HTML references*/)));
    var garageData={
        Address: address,
        AreaCode: AreaCode,
        CloseTime: CloseTime,
        Manager: Manager,
        Name: Name,
        OpenTime: OpenTime
    };
    //double check that there is no existing garage
    const dbReference=db.collection("Garage").where('Address','==',address).where('AreaCode','==',AreaCode).get();
    var errorField = document.getElementById("notification-text");
    var managerAccount=db.collection("Account").doc(user.id);
    var managerInfo=db.collection("Manager").doc(user.uid);
    if(dbReference.empty){
        //puts info into database
        var errorField = document.getElementById("notification-text");
        firebase.firestore().collection(Collection).add(addDocument)
            .then((document)=>{
                //adds link to the manager array
                managerInfo.update({
                    Garages: firebase.firestore.FieldValue.arrayUnion("Garage/"+document.id)
                })
            }
            ).then(() => {
                errorField.innerHTML= Collection+" Added";
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode + " --- " + errorMessage);
            });
    }
    else{
        //reports if something is already in database
        errorField.innerHTML="Garage Already In Use";
    }
}

/**
 * STILL UNDER PRODUCTION DO NOT USE
 * this will delete any existing garages from the database
 */
function deleteGarage(){
    //code to get input

    //code to delete document
    const begone=db.collection('Garage').doc(/*enter doc id*/).delete();
}