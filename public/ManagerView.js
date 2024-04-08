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
    const db = firebase.firestore();
    db.collection('Garage').doc(garageRef.slice(7)).get()
    .then((doc) => {
        const data = doc.data();
        const gName = data.Name;
        const gAddress = data.Address + ", " + data.AreaCode;
        pName.innerHTML = "Name: " + gName;
        pAddress.innerHTML = "Address: " + gAddress;
        newGarage.id = doc.id;
        newGarage.appendChild(pName);
        newGarage.appendChild(pAddress);
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
    var errorField = document.getElementById("add-notification-text");
    errorField.style.setProperty("color", "red");
    //links database
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    //gets infomation from website
    var name = document.getElementById("addGarageName").value;
    var address = document.getElementById("addGarageAddress").value;
    var areaCode = "" + document.getElementById("addGarageAreaCode").value;
    var openDate = new Date();
    var opentimeParts = document.getElementById("addGarageOpenTime").value.split(":");
    var openhours = parseInt(opentimeParts[0], 10);
    var openminutes = parseInt(opentimeParts[1], 10);
    openDate.setHours(openhours);
    openDate.setMinutes(openminutes);
    var openTime=firebase.firestore.Timestamp.fromDate(openDate);
    var closeDate = new Date();
    var closetimeParts = document.getElementById("addGarageCloseTime").value.split(":");
    var closehours = parseInt(closetimeParts[0], 10);
    var closeminutes = parseInt(closetimeParts[1], 10);
    closeDate.setHours(closehours);
    closeDate.setMinutes(closeminutes);
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
    var managerInfo = await db.collection("Manager").doc(managerProfile);
    const dbReference = await db.collection("Garage").where('Address','==',address).where('AreaCode','==',areaCode).get();
    //document to add to database
    if (inputNullOrEmpty(name)) {
        errorField.innerHTML = "Please enter the garage name";
    } else if (inputNullOrEmpty(address)) {
        errorField.innerHTML = "Please enter the garage address";
    } else if (inputNullOrEmpty(areaCode)) {
        errorField.innerHTML = "Please enter the garage area code";
    } else if (isNaN(openDate)) {
        errorField.innerHTML = "Please enter the garage opening time";
    } else if (isNaN(closeDate)) {
        errorField.innerHTML = "Please enter the garage closing time";
    } else if (inputNullOrEmpty(managerProfile)) {
        errorField.innerHTML = "Manager profile not found, refresh your page";
    } else if (!dbReference.empty) {
        errorField.innerHTML = "Garage already registed and in use";
    } else {
        errorField.innerHTML = "";
        var garageData={
            Name: name,
            Address: address,
            AreaCode: areaCode,
            OpenTime: openTime,
            CloseTime: closeTime,
            Manager: "Manager/" + managerProfile,
            Reservations: [],
            Spots_Normal: {
                Price: 0,
                Taken: 0,
                Total: 0
            },
            Spots_EV: {
                Price: 0,
                Taken: 0,
                Total: 0
            },
            Spots_Handicap: {
                Price: 0,
                Taken: 0,
                Total: 0
            },
            Spots_Moto: {
                Price: 0,
                Taken: 0,
                Total: 0
            },
        };
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
        closePopup('addGarage');
    }
}

/**
 * this will delete the garage doc and reference under manager
 * @param {*} garageRef 
 */
async function deleteGarage(garageID){
    const db = firebase.firestore();
    await db.collection("Garage").doc(garageID).get()
    .then((garageDoc)=>{
        var garageData = garageDoc.data();
        var managerID = garageData.Manager.slice(8);
        var garageLink = "Garage/" + garageID;
        db.collection("Reservation").where("Garage_ID", "==", garageLink).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                db.collection("Reservation").doc(doc.id).delete();
            });
        });
        db.collection("Parking Spot").where("Garage_ID", "==", garageLink).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                db.collection("Parking Spot").doc(doc.id).delete();
            });
        });
        db.collection("Favorite").where("Garage_ID", "==", garageLink).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                db.collection("Favorite").doc(doc.id).delete();
            });
        });
        db.collection("Review").where("Garage_ID", "==", garageLink).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                db.collection("Review").doc(doc.id).delete();
            });
        });
        db.collection("Manager").doc(managerID)
        .update({
            Garages: firebase.firestore.FieldValue.arrayRemove(garageLink)
        });
        db.collection("Garage").doc(garageID).delete();
        document.getElementById(garageID).remove();
        closePopup("editGarage");
    });
}

function openPopup(popupID){
    document.querySelector("#" + popupID + "Popup").classList.remove("hidden");
    document.querySelector("#" + popupID + "Popup").classList.add("flex");
}
function closePopup(popupID){
    document.querySelector("#" + popupID + "Popup").classList.remove("flex");
    document.querySelector("#" + popupID + "Popup").classList.add("hidden");
    document.querySelector("#" + popupID + "Form").reset();
}

function showGarageInfoPanel(garageID) {
    openPopup("editGarage");
    displayEditGarage(garageID);
}

function hideGarageInfoPanel(garageID) {
    closePopup("editGarage");
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

/**
 * this will edit the garage besides making the display
 * for making the display refer to displayEditGarage()
 * @param {*} garageID
 */
async function saveGarageChanges(garageID){
    var errorField = document.getElementById("edit-notification-text");
    errorField.style.setProperty("color", "red");
    var name,address,areaCode,openTime,closeTime;
    const db = firebase.firestore();
    const garageRef = db.collection("Garage").doc(garageID);
    name = document.getElementById('editGarageName').value;
    address = document.getElementById('editGarageAddress').value;
    areaCode = document.getElementById('editGarageAreaCode').value;
    var openTimeInput = document.getElementById('editGarageOpenTime').value;
    var openTimeHours = openTimeInput.substr(0,2);
    var openTimeMinutes = openTimeInput.substr(3,2);
    openTime = firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,openTimeHours,openTimeMinutes));
    var closeTimeInput = document.getElementById('editGarageCloseTime').value;
    var closeTimeHours = closeTimeInput.substr(0,2);
    var closeTimeMinutes = closeTimeInput.substr(3,2);
    closeTime = firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,closeTimeHours,closeTimeMinutes));
    if (inputNullOrEmpty(name)) {
        errorField.innerHTML = "Please enter the garage name";
    } else if (inputNullOrEmpty(address)) {
        errorField.innerHTML = "Please enter the garage address";
    } else if (inputNullOrEmpty(areaCode)) {
        errorField.innerHTML = "Please enter the garage area code";
    } else if (inputNullOrEmpty(openTimeInput)) {
        errorField.innerHTML = "Please enter the garage opening time";
    } else if (inputNullOrEmpty(closeTimeInput)) {
        errorField.innerHTML = "Please enter the garage closing time";
    } else {
        errorField.style.setProperty("color", "green");
        errorField.innerHTML = "Garage information saved";
        var garageData = {
            Name: name,
            Address: address,
            AreaCode: areaCode,
            OpenTime: openTime,
            CloseTime: closeTime,
        };
        await garageRef.set(garageData,{merge:true});
    }
}

/**
 * this is to show all the existing information about the garage that you wish to edit 
 * @param {*} garageID
 */
async function displayEditGarage(garageID){
    var name,address,areaCode,openTime,closeTime;
    const db = firebase.firestore();
    await db.collection("Garage").doc(garageID).get()
    .then((doc)=>{
        const data = doc.data();
        name = data.Name;
        address = data.Address;
        areaCode = data.AreaCode;
        openTime = data.OpenTime;
        closeTime = data.CloseTime;
    });

    var pName = document.getElementById('editGarageName');
    var pAddress = document.getElementById('editGarageAddress');
    var pAreaCode = document.getElementById('editGarageAreaCode');
    var pOpenTime = document.getElementById('editGarageOpenTime');
    var pCloseTime = document.getElementById('editGarageCloseTime');

    pName.value = name;
    pAddress.value = address;
    pAreaCode.value = areaCode;
    var openTimeDate = openTime.toDate();
    var openHours = openTimeDate.getHours().toString().padStart(2, '0');
    var openMinutes = openTimeDate.getMinutes().toString().padStart(2, '0');
    pOpenTime.value = openHours + ":" + openMinutes;
    var closeTimeDate = closeTime.toDate();
    var closeHours = closeTimeDate.getHours().toString().padStart(2, '0');
    var closeMinutes = closeTimeDate.getMinutes().toString().padStart(2, '0');
    pCloseTime.value = closeHours + ":" + closeMinutes;

    var saveGarageButton = document.getElementById("editGarageSaveButton")
    saveGarageButton.onclick = function() {saveGarageChanges(garageID)};
    var deleteGarageButton = document.getElementById("editGarageDeleteButton")
    deleteGarageButton.onclick = function() {deleteGarage(garageID)};

    displayAllReservations(garageID);
}

function addNormal(){
    let count = 0;
    
    document.getElementById("decreaseBtn").onclick = function() {
        count -= 1;
        document.getElementById("number").innerHTML = count;
    }

    document.getElementById("increaseBtn").onclick = function() {
        count += 1;
        document.getElementById("number").innerHTML = count;
    }
}

function addEV(){
    let count = 0;
    
    document.getElementById("decreaseBtn2").onclick = function() {
        count -= 1;
        document.getElementById("number2").innerHTML = count;
    }

    document.getElementById("increaseBtn2").onclick = function() {
        count += 1;
        document.getElementById("number2").innerHTML = count;
    }
}

function addAccess(){
    let count = 0;
    
    document.getElementById("decreaseBtn3").onclick = function() {
        count -= 1;
        document.getElementById("number3").innerHTML = count;
    }

    document.getElementById("increaseBtn3").onclick = function() {
        count += 1;
        document.getElementById("number3").innerHTML = count;
    }
}

function addMoto(){
    let count = 0;
    
    document.getElementById("decreaseBtn4").onclick = function() {
        count -= 1;
        document.getElementById("number4").innerHTML = count;
    }

    document.getElementById("increaseBtn4").onclick = function() {
        count += 1;
        document.getElementById("number4").innerHTML = count;
    }
}