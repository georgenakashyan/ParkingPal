var userLocation = [40.78343000, -73.96625000];
var areaCode = 10024;
var map;
var mapCenter;
var garageList = [];
var markers = [];
var openInfoWindow = null;

function initMap() {
    mapCenter = new google.maps.LatLng(40.78343000, -73.96625000);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
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
    .where("Lng", ">", mapCenter.lng() - 0.035)
    .where("Lng", "<", mapCenter.lng() + 0.035)
    .where("Lat", ">", mapCenter.lat() - 0.035)
    .where("Lat", "<", mapCenter.lat() + 0.035)
    .orderBy("Lng")
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            console.log(doc.id + " => " + data);
            garageList.push(data);
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