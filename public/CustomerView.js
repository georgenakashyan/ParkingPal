var userLocation = [40.78343000, -73.96625000];
var areaCode = 10024;
var map;
var garageList = [];
function initMap() {
    setDefaultValues();
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
    /* fillGarageList(); */
    /* fillMapMarkers(); */
}

async function fillGarageList(garageArray) {
    await firebase.firestore().collection("Garage").where("AreaCode", "==", areaCode).get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc.id + " => " + doc.data());
            garageList.push({id: doc.id, data: doc.data()});
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

function fillMapMarkers() {
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
async function retrieveGarages(){

    const address = getElementById("address");
    const display = getElementById(garageList);
    const garagesFound = [];
    const access = false;
    const isOpen = true;
    const arrIndex = 0;
    const db = firebase.firestore();

    await db.collection("Garage").where("Address", "==", address).get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            numOfSpots = doc.data().Spots.length;
            if(numOfSpots > 0){
                for (let index = 0; index < numOfSpots; index++) {
                    const spotID = doc.data().Spots[index];
                    db.collection().doc(spotID).get().then((doc) => {
                        if (doc.exists) {
                            const element = doc.data();
                            garagesFound[arrIndex] = element;
                            arrIndex++;
                            console.log("Document data:", doc.data());
                        } else {
                            // doc.data() will be undefined in this case
                            console.log("No such document!");
                        }
                    })
                }
            }else{
                ///incase no spots are found
            }
        });
    })
    .catch((error) => {
        console.log("Error getting garages: " + error);
    });
    const newList = fillGarageList(garagesFound);
    return newList;
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
    document.getElementById("eDate").value = today;
    document.getElementById("startTime").defaultValue = "00:00";
    document.getElementById("endTime").defaultValue = "23:59";
    document.getElementById("price").defaultValue = "50";
}
function filterGarages(garageArray){
    const filteredGarageList = [];
    var fGLI = 0;
    const sDate = document.getElementById("sDate").value;
    const eDate = document.getElementById("eDate").value;
    const sTime = document.getElementById("startTime").value;
    const eTime = document.getElementById("endTime").value;
    const price = document.getElementById("price").value;

    if(garageArray.length > 0){
        for (let index = 0; index < garageArray.length; index++) {
            const currElement = array[index];
            const openT = currElement.OpenTime;
            const endT = currElement.CloseTime;
            const openD = openT.toDate();
            const endD = endT.toDate();
            openT = openT.toDate().getHours();
            endT = endT.toDate().getHours();
            if(sDate > openD && eDate < endD){
                if(sTime > openT && eTime < endT){
                    filteredGarageList[fGLI] = currElement;
                    fGLI++;
                }
            }
        }
    }
    
}