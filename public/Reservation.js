document.addEventListener("DOMContentLoaded", event => {
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
        const db = firebase.firestore();
        const profileInfo = db.collection('Account').doc(user.uid);
        profileInfo.get()
        .then((doc) => {
            displayAllGarages(doc.data());
        })
        .catch((error) => {
            console.log("Could not find user doc to display name and email");
        })
    });
});

/**
 * pulls info from 'Reservation' and displays it
 */
async function retrieveAllGarages(accountDoc){
    const managerRef = accountDoc.Profile.slice(8);
    console.log(managerRef);
    const db = firebase.firestore();
    const profileInfo = await db.collection('Manager').doc(managerRef);
    profileInfo.get()
    .then((doc) => {
        var garageList = doc.data().Garages;
        garageList.forEach(displayAllReservations);
    })
    .catch((error) => {
        console.log("Failed to find manager doc: " + error);
    });
}

function displayAllReservations(garageRef) {
    const db = firebase.firestore();
    db.collection("Reservation").where("Garage_ID", "==", garageRef)
    .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            displayReservation(doc.data());
            console.log(doc.id, " => ", doc.data());
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
}
function displayReservation(reservationRef){
    const reservationInfo = db.collection('Reservation').doc(reservationRef.slice());
    let reservationList = document.getElementById('ReservationList');
    var newReservation = document.createElement('tr');
    newReservation.className = 'bg-slate-300 p-3 ml-3 mr-3 mb-3 rounded-xl hover:bg-slate-400';
    var pStart = document.createElement('td');
    var pGarID = document.createElement('td');
    var pSpotID = document.createElement('td');
    var pEnd = document.createElement('td');
    var pVehID = document.createElement('td');
    
    reservationInfo.get()
    .then((doc) => {
        const data = doc.data();
        const gStart = data.Start;
        const gGarID = data.GarageID;
        const gSpotID = data.SpotID;
        const gEnd = data.SpotID;
        const gVehID = data.SpotID;
        pStart.innerHTML = "Start: " + gName;
        pGarID.innerHTML = "Garage: " + gAddress;
        pSpotID.innerHTML = "Spot" + gSpotID;
        pEnd.innerHTML = "End: " + gSpots;
        pVehID.innerHTML = "Address: " + gAddress;
    })
    .catch((error) => {
        console.log("Failed to find reservation info doc");
    });

    newReservation.appendChild(pStart);
    newReservation.appendChild(pGarID);
    newReservation.appendChild(pSpotID);
    newReservation.appendChild(pEnd);
    newReservation.appendChild(pVehID);
    reservationList.appendChild(newReservation);
}