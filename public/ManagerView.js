document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
        const db = firebase.firestore();
        const profileInfo = db.collection('Account').doc(user.uid);
        profileInfo.get()
        .then((doc) => {
            document.getElementById("WelcomeName").innerHTML = "Welcome, " + doc.data().FirstName;
        })
        .catch((error) => {
            console.log("Could not find user doc to display name and email");
        })
    });
});

/**
 * pulls info from 'Garage' and displays it
 * @param {*} userID 
 */
function displayManagerGarages(){
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
function popup(){
    document.getElementById("addGarage").addEventListener("click", function(){
        document.querySelector(".popup").style.display = "flex";
    })
}
function close(){
    document.getElementById("closebutton").addEventListener("click", function(){
        document.querySelector(".popup").style.display = "none";
    })
}