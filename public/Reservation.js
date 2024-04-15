async function displayAllReservations(garageID) {
  var resTable = document.getElementById("reservationTable");
  while(resTable.rows.length > 1) resTable.rows[1].remove();
  const db = firebase.firestore();
  await db.collection("Garage").doc(garageID).get()
  .then((doc) => {
    //console.log(doc.id, " => ", doc.data());
    var reservationList = doc.data().Reservations;
    reservationList.forEach(displayReservation);
  })
  .catch((error) => {
    console.log("Failed to find garage doc: " + error);
  });
}

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

async function getStringFromReservation(coll, reference) {
  return new Promise(async (resolve, reject) => {
    const db = firebase.firestore();
    switch (coll) {
      case "Start":
        var openTimeDate = reference.toDate();
        var openHours = openTimeDate.getHours().toString().padStart(2, '0');
        var openMinutes = openTimeDate.getMinutes().toString().padStart(2, '0');
        resolve("" + openHours + ":" + openMinutes);
      case "End":
        var closeTimeDate = reference.toDate();
        var closeHours = closeTimeDate.getHours().toString().padStart(2, '0');
        var closeMinutes = closeTimeDate.getMinutes().toString().padStart(2, '0');
        resolve("" + closeHours + ":" + closeMinutes);
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
    }
    reject(reference);
  });
}

/**
 * this is the method that will be used to add the reservation to the database
 * change how spots work
 * @param {*} GarageRef 
 * @param {*} ParkingRef 
 * @param {*} VehicleRef 
 * @param {*} PaymentRef
 * @param {*} EndTime
 * @param {*} StartTime
 * @param {*} StatusRef 
 */
async function addReservation(GarageRef,VehicleRef,PaymentRef,StartTime,EndTime){
  //links database
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();
  //variables
  var customerID,startTime,endTime,garageID,vechileID,reservationID,paymentMethod,spotType;
  var garageDB;
  //assigning values
  await db.collection("Account").doc(user.uid)
    .get()
    .then((doc)=>{
        customerID=doc.data().Profile;
    })
    .catch((error)=>{
        console.log("Failed to find customer doc: "+error);
    });
  startTime=StartTime;
  endTime=EndTime;
  garageID=GarageRef;
  vechileID=VehicleRef;
  paymentMethod=PaymentRef;
  spotType=document.getElementById("").value;
  garageDB=await db.collection("Garage").doc(garageID);
  //make document
  var reservation={
    Customer_ID: customerID,
    End: endTime,
    Garage_ID: garageID,
    Payment_ID: paymentMethod,
    Start: startTime,
    Vechile_ID: vechileID
  };
  //adds doc to database
  await db.collection("Reservation").add(reservation)
  .then((document)=>{
    reservationID=document.uid;
  })
  .catch((error)=>{
    console.log("Failed to add to Reservation: "+error);
  });
  //adds reference to other collections
  await db.collection("Garage").update({
    Reservations: firebase.firestore.FieldValue.arrayUnion("Reservations/" + reservationID)
  })
  .catch((error)=>{
    console.log("Failed to sync reservation list on Garage: "+error);
  });
  await db.collection("Customer").update({
    Reservations: firebase.firestore.FieldValue.arrayUnion("Reservations/" + reservationID)
  })
  .catch((error)=>{
    console.log("Failed to sync reservation list on Customer: "+error);
  });
  //reserves the spot for the garage
  switch(spotType){
    case "EV":
      await garageDB.update({
        Spots_EV:{
          Taken: firebase.firestore.FieldValue.increment(1)
        }
      });
      break;
    case "Handicap":
      await garageDB.update({
        Spots_Handicap:{
          Taken: firebase.firststore.FieldValue.increment(1)
        }
      });
      break;
    case "Moto":
      await garageDB.update({
        Spots_Moto:{
          Taken: firebase.firestore.FieldValue.increment(1)
        }
      });
      break;
    case "Normal":
      await garageDB.update({
        Spots_Normal:{
          Taken: firebase.firestore.FieldValue.increment(1)
        }
      });
      break;
    default:
      console.log("Issue with spot reservation: "+error);
      break;
  }
}

/**
 * this is for editting the reservation doc in the reservation collection
 * change how spots work
 * @param {*} ReservationRef 
 * @param {*} GarageRef 
 * @param {*} ParkingRef 
 * @param {*} VehicleRef 
 * @param {*} PaymentRef 
 * @param {*} StartTime 
 * @param {*} EndTime 
 */
async function editReservation(ReservationRef,GarageRef,VehicleRef,PaymentRef,StartTime,EndTime){
  //links database
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();
  //variables
  var customerID,startTime,endTime,garageID,vechileID,reservationID,paymentMethod;
  //assigns values to variables
  await db.collection("Account").doc(user.uid)
    .get()
    .then((doc)=>{
        customerID=doc.data().Profile;
    })
    .catch((error)=>{
        console.log("Failed to find customer doc: "+error);
    });
  startTime=StartTime;
  endTime=EndTime;
  garageID=GarageRef;
  vechileID=VehicleRef;
  paymentMethod=PaymentRef;
  reservationID=ReservationRef;
  //make document
  var reservation={
    Customer_ID: customerID,
    End: endTime,
    Garage_ID: garageID,
    Payment_ID: paymentMethod,
    Start: startTime,
    Vechile_ID: vechileID
  };
  //merge information with doc
  await db.collection("Reservation").doc(reservationID).set(reservation,{merge:true})
  .catch((error)=>{
    console.log("Reservation could not update: "+error);
  });
}

/**
 * this is to delete the reservation doc and references from collections
 * change how spots work
 * @param {*} ReservationRef 
 */
async function deleteReservation(ReservationRef){
  //links database
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();
  //variable
  var garageID,reservationID,customerID;
  var reservationDB,garageDB,customerDB;
  var spotInfo;
  //assigning values to variables
  reservationID=ReservationRef;
  reservationDB=db.collection("Reservation").doc(reservationID);
  await reservationDB.get().then((reservationDoc)=>{
    garageID=reservationDoc.data().Garage_ID.slice(7);
    customerID=reservationDoc.data().Customer_ID.slice(9);
  })
  .catch((error)=>{
    console.log("Error retrieving info from Reservation: "+error);
  });
  garageDB=db.collection("Garage").doc(garageID);
  customerDB=db.collection("Customer").doc(customerID);
  await reservationDB.get().then((document)=>{
    spotInfo=document.data().SpotInfo.Type;
  });
  //delete references
  await garageDB.update({
    Reservations: firebase.firestore.FieldValue.arrayRemove(reservationID)
  })
  .catch((error)=>{
    console.log("Error removing reference from Garage: "+error);
  });
  await customerDB.update({
    Reservations: firebase.firestore.FieldValue.arrayRemove(reservationID)
  })
  .catch((error)=>{
    console.log("Error removing reference from Customer: "+error);
  });
  //delete document
  await reservationDB.delete()
  .catch((error)=>{
    console.log("Error deleting doc from Reservation: "+error);
  });
  //reserves the spot for the garage
  switch(spotInfo){
    case "EV":
      await garageDB.update({
        Spots_EV:{
          Taken: firebase.firestore.FieldValue.increment(-1)
        }
      });
      break;
    case "Handicap":
      await garageDB.update({
        Spots_Handicap:{
          Taken: firebase.firststore.FieldValue.increment(-1)
        }
      });
      break;
    case "Moto":
      await garageDB.update({
        Spots_Moto:{
          Taken: firebase.firestore.FieldValue.increment(-1)
        }
      });
      break;
    case "Normal":
      await garageDB.update({
        Spots_Normal:{
          Taken: firebase.firestore.FieldValue.increment(-1)
        }
      });
      break;
    default:
      console.log("Issue with spot reservation: "+error);
      break;
  }
}