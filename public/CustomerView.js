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
            //TODO: check date to see if we should add it
            const data = doc.data()
            var openTimeDate = data.OpenTime.toDate();
            let [sHours, sMins] = document.getElementById("startTime").value.split(":");
            var requestStartTime = parseInt(sHours)*100 + parseInt(sMins);
            var actualStartTime = openTimeDate.getHours()*100 + openTimeDate.getMinutes();

            var closeTimeDate = data.CloseTime.toDate();
            let [eHours, eMins] = document.getElementById("endTime").value.split(":");
            var requestEndTime = parseInt(eHours)*100 + parseInt(eMins);
            var actualEndTime = closeTimeDate.getHours()*100 + closeTimeDate.getMinutes();

            if(requestStartTime >= actualStartTime && requestEndTime <= actualEndTime) {
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
        //TODO: Add reservation method here
        console.log("Add reservation method here");
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

function handleBookButton() {

}

function setDefaultValues(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(dd<10) {dd = '0'+dd} 
    if(mm<10) {mm = '0'+mm} 
    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById("sDate").value = today;
    document.getElementById("startTime").defaultValue = "00:00";
    document.getElementById("endTime").defaultValue = "23:59";
    document.getElementById("price").defaultValue = "50";
}

async function replaceGarages() {
    garageList = [];
    deleteMarkers();
    await fillGarageList();
}