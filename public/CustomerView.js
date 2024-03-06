function initMap() {
    setLocation();
    var map = new google.maps.Map(document.getElementById('map'), {
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

    // Add fictional parking garages as markers
    //TODO: add areaCode based on latitude and longitude (probably with google maps API)
    var areaCode = 10024;
    var garageList = findGarages(areaCode);
    fillGarages(map, garageList);
}

function findGarages(address, areaCode) {
    try {
        const matchingGarages = [];
        firebase.firestore().collection("Garage").where("Address", "==", address).where("AreaCode", "==", areaCode)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.id + " => " + doc.data());
                matchingGarages.push({id: doc.id, data: doc.data()});
            });
        })
        .catch((error) => {
            console.log("Error getting garages: " + error);
        });
        return matchingGarages;
    } catch (error) {
        console.error("Error searching garages:", error);
        return [];
    }
}

function setLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setCoordinates, setDefaultCoordinates)
    }
}

function setCoordinates(position) {
    userLocation = [position.coords.latitude, position.coords.longitude];
}

function setDefaultCoordinates() {
    userLocation = [40.78343000, -73.96625000];
}

function fillGarages(map, garageList) {
    garageList.forEach(function(parkingGarage) {
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