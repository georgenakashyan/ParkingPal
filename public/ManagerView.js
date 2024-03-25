var resCount = 0;
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
    const db = firebase.firestore();
    const profileInfo = await db.collection('Manager').doc(managerRef);
    profileInfo.get()
    .then((doc) => {
        var garageList = doc.data().Garages;
        garageList.forEach(displayOneGarage);
        updateResLabel();
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
    db.collection('Garage').doc(garageRef.slice(7)).get()
    .then((doc) => {
        const data = doc.data();
        const gName = data.Name;
        const gAddress = data.Address + ", " + data.AreaCode;
        const gSpots = data.Spots.length;
        pName.innerHTML = "Name: " + gName;
        pAddress.innerHTML = "Address: " + gAddress;
        pSpots.innerHTML = "Total Spots: " + gSpots;
        newGarage.id = doc.id;
        newGarage.appendChild(pName);
        newGarage.appendChild(pAddress);
        newGarage.appendChild(pSpots);
        newGarage.onclick = function() {showGarageInfoPanel(newGarage.id)};
        garageList.appendChild(newGarage);
        var resList = data.Reservations;
        resCount += resList.length;
        updateResLabel();
    })
    .catch((error) => {
        console.log("Failed to find garage info doc");
    });
}

/**
 * this will add garages to the firebase database
 */
async function addGarage(){
    //links database
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    //gets infomation from website
    var name = document.getElementById("addGarageName").value;
    var address = document.getElementById("addGarageAddress").value;
    var areaCode = parseInt(document.getElementById("addGarageAreaCode").value);
    var openDate = new Date();
    var timeParts = document.getElementById("addGarageOpenTime").value.split(":");
    var hours = parseInt(timeParts[0], 10);
    var minutes = parseInt(timeParts[1], 10);
    openDate.setHours(hours);
    openDate.setMinutes(minutes);
    var openTime=firebase.firestore.Timestamp.fromDate(openDate);
    var closeDate = new Date();
    var timeParts = document.getElementById("addGarageCloseTime").value.split(":");
    var hours = parseInt(timeParts[0], 10);
    var minutes = parseInt(timeParts[1], 10);
    closeDate.setHours(hours);
    closeDate.setMinutes(minutes);
    var closeTime=firebase.firestore.Timestamp.fromDate(closeDate);
    var managerProfile;
    //gets info from database
    await db.collection("Account").doc(user.uid)
    .get()
    .then((doc) => {
        managerProfile = doc.data().Profile.slice(8);
    })
    .catch((error) => {
        console.log("Failed to find manager doc: " + error);
    });
    //document to add to database
    var garageData={
        Address: address,
        AreaCode: areaCode,
        CloseTime: closeTime,
        Manager: "Manager/" + managerProfile,
        Name: name,
        OpenTime: openTime,
        Spots: [],
        Reservations: []
    };
    //double check that there is no existing garage
    /*var errorField = document.getElementById("notification-text");*/
    var managerInfo= await db.collection("Manager").doc(managerProfile);
    const dbReference= await db.collection("Garage").where('Address','==',address).where('AreaCode','==',areaCode).get();
    if(dbReference.empty){
        //puts document into database
        await db.collection("Garage").add(garageData)
        .then((document)=>{
            //adds link to the manager array
            managerInfo.update({
                Garages: firebase.firestore.FieldValue.arrayUnion("Garage/" + document.id)
            });
            displayOneGarage("Garage/" + document.id);
            closePopup("addGarage");
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
function openPopup(popupID){
    document.querySelector("#" + popupID + "Popup").classList.remove("hidden");
    document.querySelector("#" + popupID + "Popup").classList.add("flex");
    document.querySelector("#" + popupID + "Form").reset();
}
function closePopup(popupID){
    document.querySelector("#" + popupID + "Popup").classList.remove("flex");
    document.querySelector("#" + popupID + "Popup").classList.add("hidden");
    document.querySelector("#" + popupID + "Form").reset();
}

function showGarageInfoPanel(garageID) {
    openPopup("editGarage");
}

function hideGarageInfoPanel(garageID) {
    openPopup("editGarage");
}

function updateResLabel() {
    const resLabel = document.getElementById("ReservationInfo");
    resLabel.innerHTML = "" + resCount + " active reservation";
    if (resCount != 1) {
        resLabel.innerHTML = resLabel.innerHTML + "s"
    }
}

function openTab(tabName) {
    var i;
    var x = document.getElementsByClassName("editGarageTab");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";  
    }
    document.getElementById(tabName).style.display = "block";  
  }