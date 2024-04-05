var userLocation = [40.76343000, -73.96625000];
var areaCode = 10024;
var map;
var mapCenter;
var garageList = [];
var markers = [];
var openInfoWindow = null;

function initMap() {
    mapCenter = new google.maps.LatLng(40.78343000, -73.96625000);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        streetViewControl: false,
        mapTypeControl: false,
        center: {lat: userLocation[0], lng: userLocation[1]}
    });
    removedPOI = [
        {featureType: "poi.business", stylers: [{ visibility: "off" }],},
        {elementType: "labels.icon", stylers: [{ visibility: "off" }],}
    ];
    map.setOptions({styles: removedPOI});
    navigator.geolocation.getCurrentPosition(setCoordinates, setDefaultCoordinates);
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
    .where("Lng", ">", mapCenter.lng() - 0.03)
    .where("Lng", "<", mapCenter.lng() + 0.03)
    .where("Lat", ">", mapCenter.lat() - 0.03)
    .where("Lat", "<", mapCenter.lat() + 0.03)
    .orderBy("Lng")
    .get()
    .then((querySnapshot) => {
        deleteGarageCards();
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            garageList.push(data);
            displayOneGarage(data)
            addMapMarker(data);
        });
    })
    .catch((error) => {
        console.log("Error getting garages: " + error);
    });
}

function setLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setCoordinates, setDefaultCoordinates)
    }
}

function setCoordinates(position) {
    userLocation = [position.coords.latitude, position.coords.longitude];
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        streetViewControl: false,
        mapTypeControl: false,
        center: {lat: userLocation[0], lng: userLocation[1]}
    });
    removedPOI = [
        {featureType: "poi.business", stylers: [{ visibility: "off" }],},
        {elementType: "labels.icon", stylers: [{ visibility: "off" }],}
    ];
    map.setOptions({styles: removedPOI});
}

function setDefaultCoordinates() {
    userLocation = [40.78343000, -73.96625000];
}

function addMapMarker(garageData) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(garageData.Lat, garageData.Lng),
        map: map,
        title: garageData.Name
    });

    var infoWindow = new google.maps.InfoWindow({
        content: '<div><strong>' + garageData.Name + '</strong><br>' +
                'Some information about the garage</div>'
    });

    marker.addListener('click', function() {
        if (openInfoWindow != null) {
            openInfoWindow.close();
        }
        openInfoWindow = infoWindow;
        infoWindow.open(map, marker);
    });
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

function displayOneGarage(data) {
    let garageList = document.getElementById('GarageList');
    var newGarage = document.createElement('li');
    newGarage.className = 'bg-slate-300 p-3 mb-3 rounded-xl hover:bg-slate-400';
    var pName = document.createElement('p');
    var pAddress = document.createElement('p');
    const gName = data.Name;
    const gAddress = data.Address + ", " + data.AreaCode;
    pName.innerHTML = "Name: " + gName;
    pAddress.innerHTML = "Address: " + gAddress;
    newGarage.id = data.id;
    newGarage.appendChild(pName);
    newGarage.appendChild(pAddress);
    newGarage.onclick = function() {};
    garageList.appendChild(newGarage);
}

function deleteGarageCards() {
    let garageList = document.getElementById('GarageList');
    garageList.innerHTML = "";
}