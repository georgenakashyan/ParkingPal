/**
 * Retrieves a doc.data() for a Garage object
 * @param {*} garageID
 */
async function retrieveGarage(garageID){
    const db = firebase.firestore();
    const garageInfo = await db.collection('Garage').doc(garageID);
    garageInfo.get()
    .then((doc) => {
        //TODO
    })
    .catch((error) => {
        console.log("Failed to find garage document: " + error);
    });
}

/**
 * Sends back a doc.data() to the collection of garages
 * @param {*} garageID 
 */
function deliverGarage(garageID){
    //TODO
}

/**
 * Deletes any reference to the current Garage object
 * @param {*} garageID 
 */
async function deleteGarage(garageID){
    const db = firebase.firestore();
    await db.collection("Garage").doc(garageID).get()
    .then((doc)=>{
        var garageData = doc.data();
        var managerID = garageData.Manager.slice(8);
        var garageLink = "Garage/" + garageID;
        db.collection("Reservation").where("Garage_ID", "==", garageLink).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                db.collection("Reservation").doc(doc.id).delete();
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
    })
    .catch((error) => {
        console.log("Failed to find garage document: " + error);
    });;
}

/**
 * Retrieves a doc.data() for a Reservation object
 * @param {*} reservationID 
 */
async function retrieveReservation(reservationID){
    const db = firebase.firestore();
    const reservationInfo = await db.collection('Reservation').doc(reservationID);
    reservationInfo.get()
    .then((doc) => {
        //TODO
    })
    .catch((error) => {
        console.log("Failed to find reservation document: " + error);
    });
}

/**
 * Sends back a doc.data() to the collection of reservations
 * @param {*} reservationID 
 */
function deliverReservation(reservationID){
    //TODO
}

/**
 * Deletes any reference to the current Reservation object
 * @param {*} reservationID
 */
async function deleteReservation(reservationID){
    const db = firebase.firestore();
    await db.collection("Reservation").doc(reservationID).get()
    .then((doc)=>{
        var garageData = doc.data();
        var reservationLink = "Reservation/" + reservationID;
        var customerID = garageData.Customer_ID();
        db.collection("Customer").doc(customerID)
        .update({
            Reservations: db.FieldValue.arrayRemove(reservationLink)
        });
        db.collection("Reservation").doc(reservationID).delete();
    })
    .catch((error) => {
        console.log("Failed to find reservation document: " + error);
    });
}

/**
 * Retrieves a doc.data() for a Account object
 * @param {*} accountID 
 */
async function retrieveAccount(accountID){
    const db = firebase.firestore();
    const accountInfo = await db.collection('Account').doc(accountID);
    accountInfo.get()
    .then((doc) => {
        //TODO
    })
    .catch((error) => {
        console.log("Failed to find account document: " + error);
    });
}

/**
 * Sends back a doc.data() to the collection of accounts
 * @param {*} accountID
 */
function deliverAccount(accountID){
    //TODO
}

/**
 * Deletes any reference to the current Account object
 * @param {*} accountID 
 */
async function deleteAccount(accountID){
    const db = firebase.firestore();
    await db.collection("Account").doc(accountID).get()
    .then((doc)=>{
        var accountData = doc.data();
        switch(accountData.Type_ID){
            case "Manager":
                deleteManager(accountData.Profile);
                break;
            case "Customer":
                deleteCustomer(accountData.Profile);
                break;
            default:
        }
    })
    .catch((error) => {
        console.log("Failed to find vehicle document: " + error);
    });
}

/**
 * Retrieves a doc.data() for a Vehicle object
 * @param {*} vehicleID 
 */
async function retrieveVehicle(vehicleID){
    const db = firebase.firestore();
    const vehicleInfo = await db.collection('Vehicle').doc(vehicleID);
    vehicleInfo.get()
    .then((doc) => {
        //TODO
    })
    .catch((error) => {
        console.log("Failed to find vehicle document: " + error);
    });
}

/**
 * Sends back a doc.data() to the collection of vehicles
 * @param {*} vehicleID
 */
function deliverVehicle(vehicleID){
    //TODO
}

/**
 * Deletes any reference to the current Vehicle object
 * @param {*} vehicleID 
 */
async function deleteVehicle(vehicleID){
    const db = firebase.firestore();
    await db.collection("Vehicle").doc(vehicleID).get()
    .then((doc)=>{
        var vehicleData = doc.data();
        var vehicleLink = "Vehicle/" + vehicleID;
        var customerID = vehicleData.Customer_ID();
        db.collection("Customer").doc(customerID)
        .update({
            Reservations: db.FieldValue.arrayRemove(vehicleLink)
        });
        db.collection("Vehicle").doc(vehicleID).delete();
    })
    .catch((error) => {
        console.log("Failed to find vehicle document: " + error);
    });
}

/**
 * Deletes any reference to the current Account object
 * @param {*} managerID 
 */
async function deleteManager(managerLink){
    var managerID = managerLink.slice(7);
    const db = firebase.firestore();
    await db.collection("Manager").doc(managerID).get()
    .then((doc)=>{
        var accountData = doc.data();
        db.collection("Favorite").where("Garage_ID", "==", garageLink).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                db.collection("Favorite").doc(doc.id).delete();
            });
        });
        db.collection("Billing").doc(customerID)
        .update({
            Reservations: db.FieldValue.arrayRemove(vehicleLink)
        });
    })
    .catch((error) => {
        console.log("Failed to find manager document: " + error);
    });
    
}

/**
 * Deletes any reference to the current Account object
 * @param {*} customerLink 
 */
async function deleteCustomer(customerLink){
    var customerID = customerLink.slice(9);
    const db = firebase.firestore();
    await db.collection("Customer").doc(customerID).get()
    .then((doc)=>{
        var accountData = doc.data();
    })
    .catch((error) => {
        console.log("Failed to find customer document: " + error);
    });
}