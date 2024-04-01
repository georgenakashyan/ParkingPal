var userLocation = [40.78343000, -73.96625000];
var areaCode = 10024;
var map;
var mapCenter;
var garageList = [];
function initMap() {
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
    navigator.geolocation.getCurrentPosition(setCoordinates, setDefaultCoordinates);
    google.maps.event.addListener(map, "dragend", function() {
        var mapCenter = this.getCenter();
        var latitude = mapCenter.lat();
        var longitude = mapCenter.lng();
    });
    /* fillGarageList(); */
}

async function fillGarageList() {
    await firebase.firestore().collection("Garage").where("AreaCode", "==", areaCode).get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            console.log(doc.id + " => " + data);
            garageList.push(data);
            addGarageMarker(data);
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

function addMapMarker() {
    garageList.forEach((parkingGarage) => {
        var marker = new google.maps.Marker({
            position: parkingGarage.location,
            map: map,
            title: parkingGarage.name
        });

        var infoWindow = new google.maps.InfoWindow({
            content: '<div><strong>' + parkingGarage.name + '</strong><br>' +
                    'Some information about the garage</div>'
        });

        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
    });
}