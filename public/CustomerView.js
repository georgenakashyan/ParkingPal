var startLocation = [40.76343000, -73.98625000];
var map;
var mapCenter;
var garageList = [];
var markers = [];
var openInfoWindow = null;

function initMap() {
    mapCenter = new google.maps.LatLng(startLocation[0], startLocation[1]);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        streetViewControl: false,
        mapTypeControl: false,
        center: mapCenter
    });
    removedPOI = [
        {featureType: "poi.business", stylers: [{ visibility: "off" }],},
        {elementType: "labels.icon", stylers: [{ visibility: "off" }],}
    ];
    map.setOptions({styles: removedPOI});
    navigator.geolocation.getCurrentPosition(setCoordinates);
    google.maps.event.addListener(map, "dragend", async function() {
        mapCenter = await this.getCenter();
        garageList = [];
        deleteMarkers();
        await fillGarageList();
    });
    fillGarageList();
}

async function fillGarageList() {
    await firebase.firestore().collection("Garage")
    .where("Lng", ">", mapCenter.lng() - 0.02)
    .where("Lng", "<", mapCenter.lng() + 0.02)
    .where("Lat", ">", mapCenter.lat() - 0.015)
    .where("Lat", "<", mapCenter.lat() + 0.015)
    .orderBy("Lng")
    .get()
    .then((querySnapshot) => {
        deleteGarageCards();
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            garageList.push(data);
            addMapMarker(data, doc.id);
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

function addMapMarker(garageData, garageID) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(garageData.Lat, garageData.Lng),
        map: map,
        title: garageData.Name
    });

    const infoWindow = new google.maps.InfoWindow({
        content: '<div><strong>' + garageData.Name + '</strong><br>' +
                'Some information about the garage</div>'
    });

    marker.addListener('click', function() {
        selectGarageMarker(marker, infoWindow);
        selectGarageCard(garageID);
    });
    displayOneGarage(garageData, garageID, marker, infoWindow);
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

function displayOneGarage(data, garageID, marker, infoWindow) {
    let garageList = document.getElementById('GarageList');
    var newGarage = document.createElement('li');
    newGarage.className = 'bg-slate-300 p-3 mb-3 rounded-xl hover:bg-slate-400';
    var pName = document.createElement('p');
    var pAddress = document.createElement('p');
    const gName = data.Name;
    const gAddress = data.Address + ", " + data.AreaCode;
    pName.innerHTML = gName;
    pAddress.innerHTML = gAddress;
    newGarage.id = garageID;
    newGarage.appendChild(pName);
    newGarage.appendChild(pAddress);
    newGarage.onclick = function() {
        selectGarageMarker(marker, infoWindow);
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
        child.classList.remove("bg-black");
        child.classList.add("bg-slate-300");
    }
    let card = document.getElementById(garageID);
    card.classList.remove("bg-slate-300");
    card.classList.add("bg-black");
}

function selectGarageMarker(marker, infoWindow) {
    if (openInfoWindow != null) {
        openInfoWindow.close();
    }
    openInfoWindow = infoWindow;
    infoWindow.open(map, marker);
}

function handleBookButton() {

}