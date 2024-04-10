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
        garageList = [];
        deleteMarkers();
        await fillGarageList();
    });
    fillGarageList();
});

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
        querySnapshot.forEach(async (doc) => {
            const data = doc.data()
            garageList.push(data);
            await addMapMarker(data, doc.id);
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