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
  const pStatus = document.createElement("td");
  const pStart = document.createElement("td");
  const pEnd = document.createElement("td");
  const pSpotID = document.createElement("td");
  await db.collection("Reservation").doc(reservationRef.slice(12)).get()
  .then(async (doc) => {
    const data = doc.data();
    pName.textContent = await getStringFromReservation("Name", data.Customer_ID);
    pVehID.textContent = await getStringFromReservation("VehicleID", data.Vehicle_ID);
    pStatus.textContent = await getStringFromReservation("Status", data.Status);
    var strStart = await getStringFromReservation("Start", data.Start);
    pStart.textContent = timeConvert(strStart);
    var strEnd = await getStringFromReservation("Start", data.End);
    pEnd.textContent = timeConvert(strEnd);
    pSpotID.textContent = await getStringFromReservation("SpotID", data.Spot_ID);
  })
  .catch((error) => {
    console.log("Failed to find reservation info doc: " + error);
  });
  newReservation.appendChild(pName);
  newReservation.appendChild(pVehID);
  newReservation.appendChild(pStatus);
  newReservation.appendChild(pStart);
  newReservation.appendChild(pEnd);
  newReservation.appendChild(pSpotID);
  reservationBody.appendChild(newReservation);
  reservationTable.appendChild(reservationBody);
}

async function getStringFromReservation(coll, reference) {
  return new Promise(async (resolve, reject) => {
    const db = firebase.firestore();
    const stringForm = reference;
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
      case "SpotID":
        await db.collection('Parking Spot').doc(reference.toString().slice(13)).get()
        .then((doc) => {
          resolve(doc.data().Name);
        });
        break;
      case "VehicleID":
        await db.collection('Vehicle').doc(reference.slice(8)).get()
        .then((doc) => {
          resolve(doc.data().Make +" "+ doc.data().Model);
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
      case "Status":
        true == reference ?  resolve("Confirmed") : resolve("Not Confirmed");
    }
    reject(stringForm);
  });
}
