document.addEventListener("DOMContentLoaded", (event) => {
  const auth = firebase.auth();
  auth.onAuthStateChanged((user) => {
    const db = firebase.firestore();
    const profileInfo = db.collection("Account").doc(user.uid);
    profileInfo
      .get()
      .then((doc) => {
        retrieveAllGarages(doc.data());
      })
      .catch((error) => {
        console.log("Could not find user doc to display name and email");
      });
  });
});

/**
 * pulls info from 'Reservation' and displays it
 */
async function retrieveAllGarages(accountDoc) {
  const managerRef = accountDoc.Profile.slice(8);
  const db = firebase.firestore();
  const profileInfo = await db.collection("Manager").doc(managerRef);
  profileInfo
    .get()
    .then((doc) => {
      var garageList = doc.data().Garages;
      garageList.forEach(displayAllReservations);
    })
    .catch((error) => {
      console.log("Failed to find manager doc: " + error);
    });
}

async function displayAllReservations(garageRef) {
  const db = firebase.firestore();
  const garageInfo = await db.collection("Garage").doc(garageRef.slice(7));
  garageInfo
    .get()
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
    "bg-slate-300 p-3 ml-3 mr-3 mb-3 rounded-xl hover:bg-slate-400";
  const pName = document.createElement("td");
  pName.textContent= await getStringFormReservation("Name");
  const pStatus = document.createElement("td");
  pStatus.textContent = await getStringFormReservation("Status");
  const pStart = document.createElement("td");
  const pGarID = document.createElement("td");
  const pSpotID = document.createElement("td");
  const pEnd = document.createElement("td");
  const pVehID = document.createElement("td");
  //console.log(":"+reservationRef.slice(12)+":");
  const reservationInfo = db
    .collection("Reservation")
    .doc(reservationRef.slice(12));
  reservationInfo
    .get()
    .then(async (doc) => {
      //console.log(doc.id, " => ", doc.data());
      const data = doc.data();
      pStart.textContent = await getStringFormReservation("Start", data.Start);
      pGarID.textContent = await getStringFormReservation("GarageID", data.Garage_ID);
      pSpotID.textContent = await getStringFormReservation("SpotID", data.Spot_ID);
      pEnd.textContent = await getStringFormReservation("End", data.End);
      pVehID.textContent = await getStringFormReservation("VehicleID", data.Vehicle_ID);
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
  newReservation.appendChild(pGarID);
  console.log(pVehID);
  reservationBody.appendChild(newReservation);
  reservationTable.appendChild(reservationBody);
}
async function getStringFormReservation(coll, reference) {
  const db = firebase.firestore();
  const stringForm = reference;
  switch (coll) {
    case "Start":
      return (reference / 3600).toFixed(0);
    case "End":
      return (reference / 3600).toFixed(0);
    case "GarageID":
      await db.collection('Garage').doc(reference.slice(7)).get().then((doc) => {return doc.data().Name;});
      break;
    case "SpotID":
      await db.collection('Parking Spot').doc(reference.slice(13)).get().then((doc) => {return doc.data().Name;});
      break;
    case "Vehicle_ID":
      await db.collection('Vehicle').doc(reference.slice(8)).get().then((doc) => {
        return doc.data().Make +" "+ doc.data().Model;});
      break;
    case "Name":
      return "George Nakashyan";
    case "Status":
      return "Confirmed";
  }
  return stringForm;
}
