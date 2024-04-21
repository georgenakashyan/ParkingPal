var startLocation = [40.76343000, -73.98625000];
var map;
var mapCenter;
var garageList = [];
var markers = [];
var selectedMarker = null;

document.addEventListener("DOMContentLoaded", event => {
    const auth = firebase.auth();
    document.getElementById("vehicleList").onchange = replaceGarages;
    document.getElementById("spotRequest").onchange = replaceGarages;
    auth.onAuthStateChanged(async (user) => {
        await fillVehicleList();
        await new Promise(r => setTimeout(r, 1000));
        fillGarageList();
    });
    setDefaultValues();
    mapCenter = new google.maps.LatLng(startLocation[0], startLocation[1]);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        streetViewControl: false,
        mapTypeControl: false,
        center: mapCenter,
        mapId: "c6bd309a43d6680f"
    });
    navigator.geolocation.getCurrentPosition(setCoordinates);
    google.maps.event.addListener(map, "dragend", async function() {
        mapCenter = await this.getCenter();
        replaceGarages();
    });
});

async function fillGarageList() {
    const db = firebase.firestore();
    const sDate = document.getElementById("sDate").value;
    const sTime = document.getElementById("startTime").value;
    const eTime = document.getElementById("endTime").value;
    const price = document.getElementById("price").value;
    const vehicle = document.getElementById("vehicleList").value;
    const sTypeSelector = document.getElementById("spotRequest");
    const sTypeEV = document.getElementById("spotRequestEV");
    const sTypeHandicap = document.getElementById("spotRequestHandicap");
    const sTypeMoto = document.getElementById("spotRequestMoto");
    const sTypeSelected = sTypeSelector.value;
    sTypeEV.classList.add("hidden");
    sTypeHandicap.classList.add("hidden");
    sTypeMoto.classList.add("hidden");

    var FuelType = null;
    var Handicap = false;
    var Moto = false;
    await db.collection("Vehicle").doc(vehicle).get()
    .then((doc) => {
        const data = doc.data();
        FuelType = data.FuelType;
        Handicap = data.Handicap;
        Moto = data.Moto;
    })
    .catch((error) => {
        console.log("Error finding garage: " + error);
    });

    if (FuelType == "Electric") {sTypeEV.classList.remove("hidden");}
    if (Handicap) {sTypeHandicap.classList.remove("hidden");}
    if (Moto) {sTypeMoto.classList.remove("hidden");}
    
    sTypeSelector.value = sTypeSelected;

    var dbSpotName = null;
    switch (sTypeSelected) {
        case "Normal":
            dbSpotName = "Spots_Normal";
            break;
        case "EV":
            dbSpotName = "Spots_EV";
            break;
        case "Handicap":
            dbSpotName = "Spots_Handicap";
            break;   
        case "Moto":
            dbSpotName = "Spots_Moto";
            break;
    }

    await db.collection("Garage")
    .where("Lng", ">", mapCenter.lng() - 0.02)
    .where("Lng", "<", mapCenter.lng() + 0.02)
    .where("Lat", ">", mapCenter.lat() - 0.015)
    .where("Lat", "<", mapCenter.lat() + 0.015)
    .where("" + dbSpotName + ".Price", "<=", price)
    .orderBy("Lng")
    .get()
    .then(async (querySnapshot) => {
        deleteGarageCards();
        querySnapshot.forEach(async (doc) => {
            const data = doc.data();
            var options = "";
            var takenSpots = 0;
            //Calculating taken spots
            data.Reservations.forEach(async (reservation) => {
                await db.collection("Reservation").doc(reservation.slice(12)).get()
                .then((doc) => {
                    const data = doc.data();
                    const spotType = data.SpotInfo.Type;
                    var startDate = data.Start.toDate();
                    if (new Date(sDate).toDateString() == startDate.toDateString()
                    && spotType == sTypeSelected) {
                        takenSpots++;
                    }
                })
                .catch((error) => {
                    console.log("Error finding reservation: " + error);
                });
            });
            // Calculating total spots
            var totalSpots = 0;
            switch (sTypeSelected) {
                case "Normal":
                    totalSpots = data.Spots_Normal.Total;
                    break;
                case "EV":
                    totalSpots = data.Spots_EV.Total;
                    break;
                case "Handicap":
                    totalSpots = data.Spots_Handicap.Total;
                    break;   
                case "Moto":
                    totalSpots = data.Spots_Moto.Total;
                    break;
            }
            
            var openTimeDate = data.OpenTime.toDate();
            let [sHours, sMins] = sTime.split(":");
            var requestStartTime = parseInt(sHours)*100 + parseInt(sMins);
            var actualStartTime = openTimeDate.getHours()*100 + openTimeDate.getMinutes();

            var closeTimeDate = data.CloseTime.toDate();
            let [eHours, eMins] = eTime.split(":");
            var requestEndTime = parseInt(eHours)*100 + parseInt(eMins);
            var actualEndTime = closeTimeDate.getHours()*100 + closeTimeDate.getMinutes();

            if(requestStartTime >= actualStartTime 
            && requestEndTime <= actualEndTime 
            && requestEndTime > requestStartTime
            && totalSpots > takenSpots) {
                garageList.push(data);
                await addMapMarker(data, doc.id, options);
            }
        });
    })
    .catch((error) => {
        console.log("Error getting garages: " + error);
    });
}

async function setCoordinates(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const latlng = new google.maps.LatLng(lat, lng);
    map.setCenter(latlng);
    mapCenter = latlng;
    garageList = [];
    deleteMarkers();
    await fillGarageList();
}

async function addMapMarker(garageData, garageID) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { PinElement } = await google.maps.importLibrary("marker");
    var pin = new PinElement({
        borderColor: "#ebab59",
        background: "#ebab59",
        glyphColor: "#db741f",
        scale: 1.0,
    });
    var marker = new AdvancedMarkerElement({
        position: new google.maps.LatLng(garageData.Lat, garageData.Lng),
        map: map,
        title: garageData.Name,
        content: pin.element
    });
    marker.addListener('click', function() {
        selectGarageMarker(marker);
        selectGarageCard(garageID);
    });
    displayOneGarage(garageData, garageID, marker);
    markers.push(marker);
}

function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }
  
function deleteMarkers() {
    setMapOnAll(null);
    markers = [];
}

function displayOneGarage(data, garageID, marker) {
    let garageList = document.getElementById('GarageList');
    var newGarage = document.createElement('li');
    newGarage.className = 'bg-slate-300 p-3 mb-3 rounded-xl hover:bg-slate-400';
    var pName = document.createElement('p');
    var pAddress = document.createElement('p');
    var bookButton = document.createElement('button');
    bookButton.className = "object-right text-white text- p-2 rounded-3xl bg-PP-light-orange border-4 border-PP-orange hover:bg-PP-orange";
    bookButton.innerHTML = "Book"
    bookButton.onclick = function() {
        handleBookButton(garageID);
    };
    var bottomRow = document.createElement('div');
    var growBox = document.createElement('div');
    growBox.className = "grow mr-4"
    bottomRow.className = "flex"
    bottomRow.appendChild(pAddress);
    bottomRow.appendChild(growBox);
    bottomRow.appendChild(bookButton);
    const gName = data.Name;
    const gAddress = data.Address + ", " + data.AreaCode;
    pName.innerHTML = gName;
    pAddress.innerHTML = gAddress;
    newGarage.id = garageID;
    newGarage.appendChild(pName);
    newGarage.appendChild(bottomRow);
    newGarage.onclick = function() {
        selectGarageMarker(marker);
        selectGarageCard(garageID);
    };
    garageList.appendChild(newGarage);
}

function deleteGarageCards() {
    let garageList = document.getElementById('GarageList');
    garageList.innerHTML = "";
}

function selectGarageCard(garageID) {
    let garageList = document.getElementById("GarageList");
    for (var child of garageList.children) {
        child.classList.remove("bg-slate-400");
        child.classList.add("bg-slate-300");
    }
    let card = document.getElementById(garageID);
    card.classList.remove("bg-slate-300");
    card.classList.add("bg-slate-400");
}

async function selectGarageMarker(marker) {
    const { PinElement } = await google.maps.importLibrary("marker");
    var smallPin = new PinElement({
        borderColor: "#ebab59",
        background: "#ebab59",
        glyphColor: "#db741f",
        scale: 1.0,
    });
    var largePin = new PinElement({
        borderColor: "#ebab59",
        background: "#ebab59",
        glyphColor: "#db741f",
        scale: 1.5,
    });
    if (selectedMarker != null) {
        selectedMarker.content = smallPin.element;
    }
    marker.content = largePin.element;
    selectedMarker = marker;
    map.panTo(selectedMarker.position);
}

function handleBookButton(GarageRef) {
    console.log("Enter Reservation code here");
    //TODO: make this reservation code work
    var SpotType = document.getElementById('AAAAAAAAAAAAAAAAAAAAAAA').value; //TODO FIX THIS
    var SpotPrice = document.getElementById('AAAAAAAAAAAAAAAAAAAAAAA').value; //TODO FIX THIS
    var VehicleRef = document.getElementById('AAAAAAAAAAAAAAAAAAAAAAA').value; //TODO FIX THIS
    var PaymentRef = document.getElementById('AAAAAAAAAAAAAAAAAAAAAAA').value; //TODO FIX THIS

    var startTimeInput = document.getElementById('AAAAAAAAAAAAAAAAAAAAAAA').value; //TODO FIX THIS
    var startTimeHours = startTimeInput.substr(0,2);
    var startTimeMinutes = startTimeInput.substr(3,2);
    var startTime = firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,startTimeHours,startTimeMinutes));

    var endTimeInput = document.getElementById('AAAAAAAAAAAAAAAAAAAAAAA').value; //TODO FIX THIS
    var endTimeHours = endTimeInput.substr(0,2);
    var endTimeMinutes = endTimeInput.substr(3,2);
    var endTime = firebase.firestore.Timestamp.fromDate(new Date(2024,1,1,endTimeHours,endTimeMinutes));

    addReservation(GarageRef, SpotType, SpotPrice, VehicleRef, PaymentRef, startTime, endTime);
}

function setDefaultValues(){
    const zeroPad = (num, places) => String(num).padStart(places, '0');
    var today = new Date();
    var currentDate = "" + today.getFullYear() + "-" + zeroPad(parseInt(today.getMonth()) + 1, 2) + "-" + zeroPad(today.getDate());
    var currentHours = zeroPad(today.getHours(), 2);
    var currentMinutes = zeroPad(today.getMinutes(), 2);
    var currentTime = currentHours + ":" + currentMinutes;

    var laterHours = today.getHours() + 1;
    if (laterHours > 23) {
        laterHours = 23;
        currentMinutes = 59;
    }
    var laterTime = "" + zeroPad(laterHours, 2) + ":" + currentMinutes;

    document.getElementById("sDate").value = currentDate;
    document.getElementById("startTime").value = currentTime;
    document.getElementById("endTime").value = laterTime;
    document.getElementById("price").value = "10";
}

async function replaceGarages() {
    garageList = [];
    deleteMarkers();
    await fillGarageList();
}

async function fillVehicleList() {
    const db = firebase.firestore();
    var user = firebase.auth().currentUser;
    vehicleList = document.getElementById("vehicleList");

    await db.collection("Account").doc(user.uid).get()
    .then(async (doc) => {
        const customerRef = doc.data().Profile.slice(9);
        await db.collection("Customer").doc(customerRef).get()
        .then(async (doc) => {
            var vehicles = doc.data().Vehicles;
            vehicles.forEach(async (vehicle) => {
                var newVehicle = document.createElement("option");
                newVehicle.value = vehicle.slice(8);
                await db.collection("Vehicle").doc(vehicle.slice(8)).get()
                .then((doc) => {
                    var data = doc.data();
                    const vehicleName = "" + data.Year + " " + data.Make + " " + data.Model;
                    newVehicle.innerHTML = vehicleName;
                    vehicleList.appendChild(newVehicle);
                })
                .catch((error) => {
                    console.log("Failed to get vehicle data: " + error);
                    return;
                });
            });
        })
        .catch((error) => {
            console.log("Failed to get Customer Account");
            return;
        });
    })
    .catch((error) => {
        console.log("Failed to get Account");
        return;
    });
}