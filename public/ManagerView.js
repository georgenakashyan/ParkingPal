import{
    getAccountDoc,
    getGarageDoc,
    deleteGarage,
    setNewGarageDoc,
    setOldGarageDoc
} from './Firebase.js';
import { displayAllReservations } from "./Reservation.js";

var resCount = 0;
var geocoder;
/**
 * Initializes the page
 */
document.addEventListener("DOMContentLoaded", event => {
    geocoder = new google.maps.Geocoder();
    const auth = firebase.auth();
    auth.onAuthStateChanged(async (user) => {
        try {
            var profileInfo = await getAccountDoc(user.uid);
            document.getElementById("WelcomeName").innerHTML = "Welcome, " + profileInfo.data().FirstName;
            displayAllGarages(profileInfo.data());
            setOnClicks();
        } catch (error) {
            console.log("An error occured: "+error);
        }
    });
});

/**
 * Pulls info from 'Garage' and displays it
 * @param {string} accountDoc - The reference of the account.
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
/**
 * Displays one gargage
 * @param {string} garageRef - The reference of the garage.
 */
async function displayOneGarage(garageRef) {
    let garageList = document.getElementById('GarageList');
    var newGarage = document.createElement('li');
    newGarage.className = 'bg-slate-300 p-3 ml-3 mr-3 mb-3 rounded-xl hover:bg-slate-400';
    var pName = document.createElement('p');
    var pAddress = document.createElement('p');
    try {
        var currGarage = await getGarageDoc(garageRef.slice(7));
        pName.innerHTML = "Name: " + currGarage.data().Name;
        pAddress.innerHTML = "Address: " + currGarage.data().Address + ", " + currGarage.data().AreaCode;
        newGarage.id = currGarage.id;
        newGarage.appendChild(pName);
        newGarage.appendChild(pAddress);
        newGarage.onclick = function() {showGarageInfoPanel(newGarage.id)};
        garageList.appendChild(newGarage);
        var resList = currGarage.data().Reservations;
        resCount += resList.length;
        updateResLabel();
    } catch (error) {
        console.log("An error occured: "+ error);
    }
}

/**
 * This will add garages to the firebase database
 */
async function addGarage(){
    var errorField = document.getElementById("add-notification-text");
    errorField.innerHTML = "";
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
    var latlng = await geocodeAddress(address, areaCode, errorField);
    var lat = latlng[0];
    var lng = latlng[1];
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
    var managerInfo = await getAccountDoc(user.uid);
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
    } else if (isNaN(lat) || isNaN(lng)) {
        errorField.innerHTML = "Invalid address";
    } else {
        errorField.innerHTML = "";
        var garageData = await setNewGarageDoc(name,address,areaCode,openTime,closeTime,managerProfile,lat,lng);
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
 * This opens the information panel of the garage
 * @param {string} garageID - The ID of the garage.
 */
function showGarageInfoPanel(garageID) {
    openPopup("editGarage");
    displayEditGarage(garageID);
}
/**
 * This hides the information panel of the garage
 * @param {string} garageID - The ID of the garage.
 */
function hideGarageInfoPanel(garageID) {
    closePopup("editGarage");
}
/**
 * This hides the information panel of the garage
 */
function updateResLabel() {
    const resLabel = document.getElementById("ReservationInfo");
    resLabel.innerHTML = "" + resCount + " active reservation";
    if (resCount != 1) {
        resLabel.innerHTML = resLabel.innerHTML + "s"
    }
}
/**
 * This will open the selected tab
 * @param {*} tabName - The name of the tab
 */
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
 * @param {*} garageID - The ID of the garage
 */
async function saveGarageChanges(garageID){
    var errorField = document.getElementById("edit-notification-text");
    errorField.innerHTML = "";
    errorField.style.setProperty("color", "red");
    var name,address,areaCode,openTime,closeTime;
    const db = firebase.firestore();
    const garageRef = db.collection("Garage").doc(garageID);
    name = document.getElementById('editGarageName').value;
    address = document.getElementById('editGarageAddress').value;
    areaCode = document.getElementById('editGarageAreaCode').value;
    var latlng = await geocodeAddress(address, areaCode, errorField);
    var lat = latlng[0];
    var lng = latlng[1];
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
    } else if (isNaN(lat) || isNaN(lng)) {
        errorField.innerHTML = "Invalid address";
    } else {
        errorField.style.setProperty("color", "green");
        errorField.innerHTML = "Garage information saved";
        var garageData = await setOldGarageDoc(name,address,areaCode,openTime,closeTime,lat,lat);
        await garageRef.set(garageData,{merge:true});
    }
}

/**
 * This is to show all the existing information about the garage that you wish to edit 
 * @param {*} garageID - The ID of the garage
 */
async function displayEditGarage(garageID){
    var pName = document.getElementById('editGarageName');
    var pAddress = document.getElementById('editGarageAddress');
    var pAreaCode = document.getElementById('editGarageAreaCode');
    var pOpenTime = document.getElementById('editGarageOpenTime');
    var pCloseTime = document.getElementById('editGarageCloseTime');
    try {
        var currGarage = await getGarageDoc(garageID);
        pName.value = currGarage.data().Name;
        pAddress.value = currGarage.data().Address;
        pAreaCode.value = currGarage.data().AreaCode;
        var openTimeDate = currGarage.data().OpenTime.toDate();
        var closeTimeDate = currGarage.data().CloseTime.toDate();
    } catch (error) {
        console.log("An error occured: "+ error);
    }
    
    var openHours = openTimeDate.getHours().toString().padStart(2, '0');
    var openMinutes = openTimeDate.getMinutes().toString().padStart(2, '0');
    pOpenTime.value = openHours + ":" + openMinutes;
    var closeHours = closeTimeDate.getHours().toString().padStart(2, '0');
    var closeMinutes = closeTimeDate.getMinutes().toString().padStart(2, '0');
    pCloseTime.value = closeHours + ":" + closeMinutes;

    var saveGarageButton = document.getElementById("editGarageSaveButton")
    saveGarageButton.onclick = function() {saveGarageChanges(garageID)};
    var deleteGarageButton = document.getElementById("editGarageDeleteButton")
    deleteGarageButton.onclick = function() {deleteGarage(garageID)};

    var spotSaveButton = document.getElementById("spotSaveButton")
    spotSaveButton.onclick = function() {updateSpotInfo(garageID)};

    displayParkingSpots(garageID);
    displayAllReservations(garageID);
}
/**
 * This allows us to geocode the address of the garage
 * @param {*} addr - The address of the garage
 * @param {*} areacode - The area code of the garage
 * @param {*} errorField - The error field
 */
async function geocodeAddress(addr, areacode, errorField) {
    var address = "" + addr + ", " + areacode 
    var lat, lng = null;
    await geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == 'OK') {
            var location = results[0].geometry.location;
            lat = location.lat()
            lng = location.lng();
        } else {
            errorField.style.setProperty("color", "red");
            errorField.innerHTML = "Enter a valid address and area code";
        }
    });
    errorField.style.setProperty("color", "green");
    errorField.innerHTML = "";
    return [lat, lng];
}

/**
 * This updates the spot information
 * @param {*} garageID - The ID of the garage
 */
async function updateSpotInfo(garageID) {
    var errorField = document.getElementById("spot-notification-text");
    errorField.innerHTML = "";
    errorField.style.setProperty("color", "red");

    let normalSpotPrice = document.getElementById("normalSpotPrice");
    let evSpotPrice = document.getElementById("evSpotPrice");
    let handicapSpotPrice = document.getElementById("handicapSpotPrice");
    let motoSpotPrice = document.getElementById("motoSpotPrice");

    let normalSpotCount = document.getElementById("normalSpotCount");
    let evSpotCount = document.getElementById("evSpotCount");
    let handicapSpotCount = document.getElementById("handicapSpotCount");
    let motoSpotCount = document.getElementById("motoSpotCount");

    if(normalSpotPrice.value == 0 || evSpotPrice.value == 0 ||
        handicapSpotPrice.value == 0 || motoSpotPrice.value == 0) {
            errorField.innerHTML = "Enter a price for your spots";
            return;
    }

    var spotData = {
        Spots_Normal: {
            Price: parseInt(normalSpotPrice.value),
            Total: parseInt(normalSpotCount.value)
        },
        Spots_EV: {
            Price: parseInt(evSpotPrice.value),
            Total: parseInt(evSpotCount.value)
        },
        Spots_Handicap: {
            Price: parseInt(handicapSpotPrice.value),
            Total: parseInt(handicapSpotCount.value)
        },
        Spots_Moto: {
            Price: parseInt(motoSpotPrice.value),
            Total: parseInt(motoSpotCount.value)
        }
    }
    const db = firebase.firestore();
    await db.collection("Garage").doc(garageID).set(spotData, {merge:true})
    .then(() => {
        errorField.innerHTML = "Spots updated successfully";
        errorField.style.setProperty("color", "green");
    });
}
/**
 * This displays parking spots
 * @param {*} garageID - The ID of the garage
 */
async function displayParkingSpots(garageID) {
    var errorField = document.getElementById("spot-notification-text");
    errorField.innerHTML = "";
    errorField.style.setProperty("color", "red");

    let normalSpotPrice = document.getElementById("normalSpotPrice");
    let evSpotPrice = document.getElementById("evSpotPrice");
    let handicapSpotPrice = document.getElementById("handicapSpotPrice");
    let motoSpotPrice = document.getElementById("motoSpotPrice");

    let normalSpotCount = document.getElementById("normalSpotCount");
    let evSpotCount = document.getElementById("evSpotCount");
    let handicapSpotCount = document.getElementById("handicapSpotCount");
    let motoSpotCount = document.getElementById("motoSpotCount");

    try {
        var currGarage = await getGarageDoc(garageID);
        normalSpotPrice.value = currGarage.data().Spots_Normal.Price;
        evSpotPrice.value = currGarage.data().Spots_EV.Price;
        handicapSpotPrice.value = currGarage.data().Spots_Handicap.Price;
        motoSpotPrice.value = currGarage.data().Spots_Moto.Price;

        normalSpotCount.value = currGarage.data().Spots_Normal.Total;
        evSpotCount.value = currGarage.data().Spots_EV.Total;
        handicapSpotCount.value = currGarage.data().Spots_Handicap.Total;
        motoSpotCount.value = currGarage.data().Spots_Moto.Total;
    } catch (error) {
        console.log("An error occured: "+error);
    }
}
/**
 * Sets the on click fucntions for the elements
 */
function setOnClicks() {
    var garageInfoTab = document.getElementById("gi");
    var parkingSpotTab = document.getElementById("ps");
    var reservationTab = document.getElementById("r");
    var addGarageButt = document.getElementById("ag");
    garageInfoTab.onclick = function() {openTab('garageInfo')};
    parkingSpotTab.onclick = function() {openTab('spotInfo')};
    reservationTab.onclick = function() {openTab('reservationList')};
    addGarageButt.onclick = function() {(addGarage())};
}