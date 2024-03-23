document.addEventListener("DOMContentLoaded", event => {
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
        const db = firebase.firestore();
        const profileInfo = db.collection('Account').doc(user.uid);
        profileInfo.get()
        .then((doc) => {
            document.getElementById("WelcomeName").innerHTML = "Welcome, " + doc.data().FirstName;
            displayAllGarages(doc.data());
        })
        .catch((error) => {
            console.log("Could not find user doc to display name and email");
        })
    });
});

/**
 * pulls info from 'Garage' and displays it
 */
async function displayAllGarages(accountDoc){
    const managerRef = accountDoc.Profile.slice(8);
    console.log(managerRef);
    const db = firebase.firestore();
    const profileInfo = await db.collection('Manager').doc(managerRef);
    profileInfo.get()
    .then((doc) => {
        var garageList = doc.data().Garages;
        garageList.forEach(displayOneGarage);
    })
    .catch((error) => {
        console.log("Failed to find manager doc: " + error);
    });
}

function displayOneGarage(garageRef) {
    let garageList = document.getElementById('GarageList');
    var newGarage = document.createElement('li');
    newGarage.className = 'bg-slate-300 p-3 ml-3 mr-3 mb-3 rounded-xl hover:bg-slate-400';
    var pName = document.createElement('p');
    var pAddress = document.createElement('p');
    var pSpots = document.createElement('p');
    const db = firebase.firestore();
    const garageInfo = db.collection('Garage').doc(garageRef.slice(7));
    garageInfo.get()
    .then((doc) => {
        const data = doc.data();
        const gName = data.Name;
        const gAddress = data.Address + ", " + data.AreaCode;
        const gSpots = data.Spots.length;
        pName.innerHTML = "Name: " + gName;
        pAddress.innerHTML = "Address: " + gAddress;
        pSpots.innerHTML = "Total Spots: " + gSpots;
    })
    .catch((error) => {
        console.log("Failed to find garage info doc");
    });
    newGarage.appendChild(pName);
    newGarage.appendChild(pAddress);
    newGarage.appendChild(pSpots);
    garageList.appendChild(newGarage);
}

/**
 * this will add garages to the firebase database
 */
async function addGarage(){
    //links database
    const user=firebase.auth().currentUser;
    const db = firebase.firestore();
    //gets infomation from website
    var address="testing1";
    var AreaCode=12345;
    var CloseTime=firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,22,30));
    var managerProfile;
    //gets info from database {
    await db.collection("Account").doc(user.uid)
    .get()
    .then((doc) => {
        managerProfile = doc.data().Profile.slice(8);
    })
    .catch((error) => {
        console.log("Failed to find manager doc: " + error);
    });
    console.log("Manager id: " + managerProfile)
    //}
    var Name="testingname";
    var OpenTime=firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,9,30));
    //document to add to database
    var garageData={
        Address: address,
        AreaCode: AreaCode,
        CloseTime: CloseTime,
        Manager: "Manager/" + managerProfile,
        Name: Name,
        OpenTime: OpenTime,
        Spots: []
    };
    //double check that there is no existing garage
/*     var errorField = document.getElementById("notification-text");
 */    var managerInfo= await db.collection("Manager").doc(managerProfile);
    const dbReference= await db.collection("Garage").where('Address','==',address).where('AreaCode','==',AreaCode).get();
    if(dbReference.empty){
        //puts document into database
        db.collection("Garage").add(garageData)
        .then((document)=>{
            //adds link to the manager array
            managerInfo.update({
                Garages: firebase.firestore.FieldValue.arrayUnion("Garage/"+document.id)
            });
            errorField.innerHTML= Collection+" Added";
        })
        //reports if an error occurs
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode + " --- " + errorMessage);     
        });
    }
    else{
        //reports if something is already in database
        console.log("Document not empty, it exists or some other error")
        /* errorField.innerHTML="Garage Already In Use"; */
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