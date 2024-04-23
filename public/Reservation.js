/**
 * Displays all reservations for a given garage.
 * @param {string} garageID - The ID of the garage.
 */
async function displayAllReservations(garageID) {
    var resTable = document.getElementById("reservationTable");
    while(resTable.rows.length > 1) resTable.rows[1].remove();
    const db = firebase.firestore();
    await db.collection("Garage").doc(garageID).get()
    .then((doc) => {
        var reservationList = doc.data().Reservations;
        reservationList.forEach(displayReservation);
    })
    .catch((error) => {
        console.log("Failed to find garage doc: " + error);
    });
}

/**
 * Displays a single reservation.
 * @param {string} reservationRef - The reference to the reservation.
 */
async function displayReservation(reservationRef) {
    const db = firebase.firestore();
    let reservationTable = document.getElementById("reservationTable");
    let reservationBody = document.getElementById("reservationBody");
    var newReservation = document.createElement("tr");
    newReservation.className =
        "bg-gray-300 text-left text-gray-700 [&>td]:p-3 hover:bg-gray-400";
    const pName = document.createElement("td");
    const pVehID = document.createElement("td");
    const pVehPlate = document.createElement("td");
    const pStart = document.createElement("td");
    const pEnd = document.createElement("td");
    const pSpotInfo = document.createElement("td");
    await db.collection("Reservation").doc(reservationRef.slice(12)).get()
        .then(async (doc) => {
            const data = doc.data();
            /* var start = data.Start
            if (data) {
                    
            } */
            //TODO: Make so that it only shows reservations from today and later
            pName.textContent = await getStringFromReservation("Name", data.Customer_ID);
            pVehID.textContent = await getStringFromReservation("VehicleID", data.Vehicle_ID);
            pVehPlate.textContent = await getStringFromReservation("VehiclePlate", data.Vehicle_ID);
            var strStart = await getStringFromReservation("Start", data.Start);
            pStart.textContent = timeConvert(strStart);
            var strEnd = await getStringFromReservation("End", data.End);
            pEnd.textContent = timeConvert(strEnd);
            pSpotInfo.textContent = await getStringFromReservation("SpotInfo", data.SpotInfo);
        })
        .catch((error) => {
            console.log("Failed to find reservation info doc: " + error);
        });
    newReservation.appendChild(pName);
    newReservation.appendChild(pVehID);
    newReservation.appendChild(pVehPlate);
    newReservation.appendChild(pStart);
    newReservation.appendChild(pEnd);
    newReservation.appendChild(pSpotInfo);
    reservationBody.appendChild(newReservation);
    reservationTable.appendChild(reservationBody);
}

/**
 * Retrieves a string value from the reservation document.
 * @param {string} coll - The collection to retrieve the value from.
 * @param {string} reference - The reference to the value.
 * @returns {Promise<string>} The string value from the reservation document.
 */
async function getStringFromReservation(coll, reference) {
    return new Promise(async (resolve, reject) => {
        const db = firebase.firestore();
        switch (coll) {
            case "Start":
                var openTimeDate = reference.toDate();
                var openHours = openTimeDate.getHours().toString().padStart(2, '0');
                var openMinutes = openTimeDate.getMinutes().toString().padStart(2, '0');
                resolve("" + openHours + ":" + openMinutes);
                break;
            case "End":
                var closeTimeDate = reference.toDate();
                var closeHours = closeTimeDate.getHours().toString().padStart(2, '0');
                var closeMinutes = closeTimeDate.getMinutes().toString().padStart(2, '0');
                resolve("" + closeHours + ":" + closeMinutes);
                break;
            case "SpotInfo":
                resolve(reference.Type);
                break;
            case "VehicleID":
                await db.collection('Vehicle').doc(reference.slice(8)).get()
                    .then((doc) => {
                        var data = doc.data();
                        resolve(data.Make + " " + data.Model);
                    });
                break;
            case "VehiclePlate":
                await db.collection('Vehicle').doc(reference.slice(8)).get()
                    .then((doc) => {
                        var data = doc.data();
                        resolve(data.LicensePlate);
                    });
                break;
            case "Name":
                await db.collection('Customer').doc(reference.slice(9)).get()
                    .then(async (customerDoc) => {
                        await db.collection('Account').doc(customerDoc.data().Account.slice(8)).get()
                            .then((accountDoc) => {
                                var data = accountDoc.data();
                                resolve(data.FirstName + " " + data.LastName);
                            })
                    });
                break;
            default:
                reject(reference);
                break;
        }
    });
}

/**
 * Adds a reservation to the database.
 * @param {string} GarageRef - The reference to the garage.
 * @param {string} SpotType - The type of spot.
 * @param {number} SpotPrice - The price of the spot.
 * @param {string} VehicleRef - The reference to the vehicle.
 * @param {string} PaymentRef - The reference to the payment.
 * @param {Date} StartTime - The start time of the reservation.
 * @param {Date} EndTime - The end time of the reservation.
 */
async function addReservation(GarageRef, SpotType, SpotPrice, VehicleRef, PaymentRef, StartTime, EndTime) {
    //links database
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    //variables
    var customerID;
    //assigning values
    await db.collection("Account").doc(user.uid).get()
    .then((doc) => {
        customerID = doc.data().Profile;
    })
    .catch((error) => {
        console.log("Failed to find customer doc: " + error);
    });
    //make document
    var reservation = {
        Customer_ID: "Customer/" + customerID,
        End: EndTime,
        Garage_ID: "Garage/" + GarageRef,
        Payment_ID: "Payment/" + PaymentRef,
        Start: StartTime,
        Vechile_ID: "Vehicle/" + VehicleRef,
        SpotInfo: {
            Price: parseInt(SpotPrice),
            Type: SpotType
        }
    };
    //adds doc to database
    await db.collection("Reservation").add(reservation)
    .then((document) => {
        reservationID = document.uid;
    })
    .catch((error) => {
        console.log("Failed to add to Reservation: " + error);
    });
    //adds reference to other collections
    await db.collection("Garage").doc(garageRef)
    .set({
        Reservations: firebase.firestore.FieldValue.arrayUnion("Reservations/" + reservationID)
    })
    .catch((error) => {
        console.log("Failed to sync reservation list on Garage: " + error);
    });
    await db.collection("Customer")
    .update({
        Reservations: firebase.firestore.FieldValue.arrayUnion("Reservations/" + reservationID)
    })
    .catch((error) => {
        console.log("Failed to sync reservation list on Customer: " + error);
    });
}

/**
 * Edits a reservation in the reservation collection.
 * @param {string} ReservationRef - The reference to the reservation.
 * @param {string} GarageRef - The reference to the garage.
 * @param {string} VehicleRef - The reference to the vehicle.
 * @param {string} PaymentRef - The reference to the payment.
 * @param {Date} StartTime - The start time of the reservation.
 * @param {Date} EndTime - The end time of the reservation.
 */
async function editReservation(ReservationRef, GarageRef, VehicleRef, PaymentRef, StartTime, EndTime) {
    //links database
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    //variables
    var customerID, startTime, endTime, garageID, vechileID, reservationID, paymentMethod;
    //assigns values to variables
    await db.collection("Account").doc(user.uid).get()
    .then((doc) => {
        customerID = doc.data().Profile;
    })
    .catch((error) => {
        console.log("Failed to find customer doc: " + error);
    });
    startTime = StartTime;
    endTime = EndTime;
    garageID = GarageRef;
    vechileID = VehicleRef;
    paymentMethod = PaymentRef;
    reservationID = ReservationRef;
    //make document
    var reservation = {
        Customer_ID: customerID,
        End: endTime,
        Garage_ID: garageID,
        Payment_ID: paymentMethod,
        Start: startTime,
        Vechile_ID: vechileID
    };
    //merge information with doc
    await db.collection("Reservation").doc(reservationID)
    .set(reservation, { merge: true })
    .catch((error) => {
        console.log("Reservation could not update: " + error);
    });
}

/**
 * Deletes a reservation and its references from collections.
 * @param {string} ReservationRef - The reference to the reservation.
 */
async function deleteReservation(ReservationRef) {
    //links database
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    //variable
    var garageID, reservationID, customerID;
    var reservationDB, garageDB, customerDB;
    var spotInfo;
    //assigning values to variables
    reservationID = ReservationRef;
    reservationDB = db.collection("Reservation").doc(reservationID);
    await reservationDB.get()
    .then((reservationDoc) => {
        garageID = reservationDoc.data().Garage_ID.slice(7);
        customerID = reservationDoc.data().Customer_ID.slice(9);
    })
    .catch((error) => {
        console.log("Error retrieving info from Reservation: " + error);
    });
    garageDB = db.collection("Garage").doc(garageID);
    customerDB = db.collection("Customer").doc(customerID);
    await reservationDB.get()
    .then((document) => {
        spotInfo = document.data().SpotInfo.Type;
    });
    //delete references
    await garageDB.update({
        Reservations: firebase.firestore.FieldValue.arrayRemove(reservationID)
    })
    .catch((error) => {
        console.log("Error removing reference from Garage: " + error);
    });
    await customerDB.update({
        Reservations: firebase.firestore.FieldValue.arrayRemove(reservationID)
    })
    .catch((error) => {
        console.log("Error removing reference from Customer: " + error);
    });
    //delete document
    await reservationDB.delete()
    .catch((error) => {
        console.log("Error deleting doc from Reservation: " + error);
    });
}