/**
 * Retrieves a doc for a Garage object
 * @param {*} garageID - The ID of the garage
 */
export async function getGarageDoc(garageID){
    return new Promise(async (resolve, reject) => {
        const db = firebase.firestore();
        const garageInfo = await db.collection('Garage').doc(garageID);
        garageInfo.get()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => {
            console.log("Failed to find garage document: " + error);
            reject(null);
        });
    });
}

/**
 * Takes inputed information and updates existing object
 * @param {*} name - The name of the garage
 * @param {*} address - The address of the garage
 * @param {*} areaCode - The area code of the garage
 * @param {*} openTime - The time the garage opens
 * @param {*} closeTime - The time the garage closes
 * @param {*} lat - The latitude of the garage
 * @param {*} lng - The longitude of the garage
 */
export async function setOldGarageDoc(name, address, areaCode, openTime, closeTime, lat, lng){
    return new Promise(async (resolve, reject) => {
        var garageData = {
            Name: name,
            Address: address,
            AreaCode: areaCode,
            OpenTime: openTime,
            CloseTime: closeTime,
            Lat: lat,
            Lng: lng
        };
        resolve(garageData);
    });
}
/**
 * Takes inputed information and creates new object
 * @param {*} name - The name of the garage
 * @param {*} address - The address of the garage
 * @param {*} areaCode - The area code of the garage
 * @param {*} openTime - The time the garage opens
 * @param {*} closeTime - The time the garage closes
 * @param {*} managerProfile - The manager of the garage
 * @param {*} lat - The latitude of the garage
 * @param {*} lng - The longitude of the garage
 */
export async function setNewGarageDoc(name, address, areaCode, openTime, closeTime, managerProfile, lat, lng){
    return new Promise(async (resolve, reject) => {
        var garageData={
            Name: name,
            Address: address,
            AreaCode: areaCode,
            OpenTime: openTime,
            CloseTime: closeTime,
            Manager: "Manager/" + managerProfile,
            Reservations: [],
            Lat: lat,
            Lng: lng,
            Spots_Normal: {
                Price: 0,
                Total: 0
            },
            Spots_EV: {
                Price: 0,
                Total: 0
            },
            Spots_Handicap: {
                Price: 0,
                Total: 0
            },
            Spots_Moto: {
                Price: 0,
                Total: 0
            }
        };
        resolve(garageData);
    });
}

/**
 * Deletes any reference to the current Garage object
 * @param {*} garageID - The ID of the garage
 */
export async function deleteGarage(garageID){
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
 * Retrieves a doc for a Reservation object
 * @param {*} reservationID - The ID of the reservation
 */
export async function getReservationDoc(reservationID){
    return new Promise(async (resolve, reject) => {
        const db = firebase.firestore();
        const reservationInfo = await db.collection('Reservation').doc(reservationID);
        reservationInfo.get()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => {
            console.log("Failed to find reservation document: " + error);
            reject(null);
        });
    });
}

/**
 * Sends back a doc.data() to the collection of reservations
 * @param {*} reservationID - The ID of the reservation
 */
export async function setReservationDoc(reservationID){
    return new Promise(async (resolve, reject) => {
        //TODO
    });
}

/**
 * Deletes any reference to the current Reservation object
 * @param {*} reservationID - The ID of the reservation
 */
export async function deleteReservation(reservationID){
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
 * Retrieves a doc. for a Manager or Customer object depending on Account
 * @param {*} accountID - The ID of the account
 */
export async function getAccountDoc(accountID){
    return new Promise(async (resolve, reject) => {
        const db = firebase.firestore();
        const accountInfo = await db.collection('Account').doc(accountID);
        accountInfo.get().then((doc) => {
            resolve(doc);
        })
        .catch((error) => {
            console.log("Failed to find account document: " + error);
            reject(null);
        });
    });
}

/**
 * Sends back a doc.data() to the collection of accounts
 * @param {*} accountID - The ID of the account
 */
export async function setAccountDoc(accountID){
    return new Promise(async (resolve, reject) => {
        //TODO
    });
}

/**
 * Deletes any reference to the current Account object
 * @param {*} accountID - The ID of the account
 */
export async function deleteAccount(accountID){
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
 * @param {*} vehicleID - The ID of the vehicle
 */
export async function getVehicle(vehicleID){
    return new Promise(async (resolve, reject) => {
        const db = firebase.firestore();
        const accountInfo = await db.collection('Vehicle').doc(vehicleID);
        accountInfo.get()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => {
            console.log("Failed to find vehicle document: " + error);
            reject(null);
        });
    });
}

/**
 * Sends back a doc.data() to the collection of vehicles
 * @param {*} vehicleID - The ID of the vehicle
 */
export async function setVehicle(vehicleID){
    return new Promise(async (resolve, reject) => {
        //TODO
    });
}

/**
 * Deletes any reference to the current Vehicle object
 * @param {*} vehicleID - The ID of the vehicle
 */
export async function deleteVehicle(vehicleID){
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
 * @param {*} managerLink - The link that connects account and manager
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
 * @param {*} customerLink - The link that connects account and customer
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