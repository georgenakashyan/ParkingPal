document.addEventListener("DOMContentLoaded", event => {
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
        const db = firebase.firestore();
        const profileInfo = db.collection('Account').doc(user.uid);
        profileInfo.get()
        .then((doc) => {
            document.getElementById("WelcomeName").innerHTML = "Welcome, " + doc.data().FirstName;
            displayAllGarages(doc.data());
            updateReservationCount(doc.data());
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
        newGarage.id = doc.id;
        newGarage.appendChild(pName);
        newGarage.appendChild(pAddress);
        newGarage.appendChild(pSpots);
        newGarage.onclick = function() {showGarageInfoPanel(newGarage.id)};
        garageList.appendChild(newGarage);
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
    var address = "testing1";
    var areaCode = 12345;
    var name = "testingname";
    var openTime=firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,9,30));
    var closeTime=firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,22,30));
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
    console.log("Manager id: " + managerProfile)
    //document to add to database
    var garageData={
        Address: address,
        AreaCode: areaCode,
        CloseTime: closeTime,
        Manager: "Manager/" + managerProfile,
        Name: name,
        OpenTime: openTime,
        Spots: []
    };
    //double check that there is no existing garage
    /*var errorField = document.getElementById("notification-text");*/
    var managerInfo= await db.collection("Manager").doc(managerProfile);
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
function openPopup(popupID){
    document.querySelector("#" + popupID).classList.remove("hidden");
    document.querySelector("#" + popupID).classList.add("flex");
}
function closePopup(popupID){
    document.querySelector("#" + popupID).classList.remove("flex");
    document.querySelector("#" + popupID).classList.add("hidden");
}

function showGarageInfoPanel(garageID) {
    console.log("Opening garage info: " + garageID);
}

async function updateReservationCount(accountDoc) {
    var resCount = 0;
    const resLabel = document.getElementById("ReservationInfo");
    const db = firebase.firestore();
    const managerRef = accountDoc.Profile.slice(8);
    const profileInfo = await db.collection('Manager').doc(managerRef);
    profileInfo.get()
    .then((managerDoc) => {
        var garageList = managerDoc.data().Garages;
        resCount += garageList.length;
        resLabel.innerHTML = "You have " + resCount + " active reservation";
        if (resCount != 1) {
            resLabel.innerHTML = resLabel.innerHTML + "s"
        }
    })
    .catch((error) => {
        console.log("Failed to find manager doc: " + error);
    });
}

/**
 * this will edit the garage besides making the display
 * for making the display refer to displayEditGarage()
 * @param {*} garageRef 
 */
async function editGarage(garageRef){
    //links database
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const garageDB=await db.collection("Garage").doc(garageRef);
    //variables being used
    var address,areaCode,name,openTime,closeTime;
    //gets infromation from database
    await garageDB.get().then((doc)=>{ 
        address=doc.data().Address;
        areaCode=doc.data().AreaCode;
        name=doc.data().Name;
        openTime=doc.data().OpenTime;
        closeTime=doc.data().CloseTime;
    });
    //displays information
    await displayEditGarage(address,areaCode,name,openTime,closeTime);
    //gets infomation from website
    /*find out if we need to double check if something is null before adding it and then implement if needed otherwise this should be good*/
    address = null; /*insert way to get information from HTML*/
    areaCode = 0; /*insert way to get information from HTML*/
    name = null; /*insert way to get information from HTML*/
    openTime=firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,9,30)); /*insert way to get information from HTML*/
    closeTime=firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,22,30)); /*insert way to get information from HTML*/
    //document to add to database
    var garageData={
        Address: address,
        AreaCode: areaCode,
        CloseTime: closeTime,
        Name: name,
        OpenTime: openTime,
    };
    //updates the document
    var finalStep=await garageDB.set({garageData},{merge:true});
}

/**
 * this is to show all the existing information about the garage that you wish to edit and will make the edit page
 * @param {*} address 
 * @param {*} areaCode 
 * @param {*} name 
 * @param {*} openTime 
 * @param {*} closeTime 
 */
function displayEditGarage(address,areaCode,name,openTime,closeTime){
    //links database
    const db = firebase.firestore();
    //makes edit page
    let garageList = document.getElementById('GarageList');
    var newGarage = document.createElement('li');
    newGarage.className = 'bg-slate-300 p-3 ml-3 mr-3 mb-3 rounded-xl hover:bg-slate-400'; /*this needs to updated to meet the edit requirements*/
    //creates page elements
    var pName = document.createElement('p');
    var pAddress = document.createElement('p');
    var pAreaCode = document.createElement('p');
    var pOpenTime=document.createElement('p');
    var pCloseTime=document.createElement('p');
    //adds values to the page elements
    pName.innerHTML="Name: "+name;
    pAddress.innerHTML="Address: "+address;
    pAreaCode.innerHTML="Area Code: "+areaCode;
    pOpenTime.innerHTML="Open Time: "+openTime;
    pCloseTime.innerHTML="Close Time: "+closeTime;
    newGarage.appendChild(pName);
    newGarage.appendChild(pAddress);
    newGarage.appendChild(pAreaCode);
    newGarage.appendChild(pOpenTime);
    newGarage.appendChild(pCloseTime);
    //add edit functionality to page
    /*I don't know how to change this so it allows the person to edit it upon click*/
    newGarage.onclick = function() {showGarageInfoPanel(newGarage.id)};
    //adds changes to new editGarages page
    /*I don't know how to change this to it */
    garageList.appendChild(newGarage);
}
