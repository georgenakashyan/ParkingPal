var startLocation = [40.76343000, -73.98625000];
var map;
var mapCenter;
var garageList = [];
var markers = [];
var selectedMarker = null;

document.addEventListener("DOMContentLoaded", event => {
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
    fillGarageList();
});

async function fillGarageList() {
    const sDate = document.getElementById("sDate").value;
    const sTime = document.getElementById("startTime").value;
    const eTime = document.getElementById("endTime").value;
    const price = document.getElementById("price").value;
    await firebase.firestore().collection("Garage")
    .where("Lng", ">", mapCenter.lng() - 0.02)
    .where("Lng", "<", mapCenter.lng() + 0.02)
    .where("Lat", ">", mapCenter.lat() - 0.015)
    .where("Lat", "<", mapCenter.lat() + 0.015)
    .orderBy("Lng")
    .get()
    .then((querySnapshot) => {
        deleteGarageCards();
        querySnapshot.forEach(async (doc) => {
            //TODO: check date to see if we should add the garage
            //TODO: check price to see if garage should be added (for the spot they specifically want)
            const data = doc.data()
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
            && requestEndTime > requestStartTime) {
                garageList.push(data);
                await addMapMarker(data, doc.id);
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