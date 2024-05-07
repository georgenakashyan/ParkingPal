var startLocation = [40.76343000, -73.98625000];
var map;
var mapCenter;
var garageList = [];
var markers = [];
var selectedMarker = null;

document.addEventListener("DOMContentLoaded", event => {
    const auth = firebase.auth();
    const zeroPad = (num, places) => String(num).padStart(places, '0');
    document.getElementById("vehicleList").onchange = replaceGarages;
    document.getElementById("spotRequest").onchange = replaceGarages;
    document.getElementById("sDate").onchange = replaceGarages;
    document.getElementById("startTime").onchange = replaceGarages;
    document.getElementById("endTime").onchange = replaceGarages;
    document.getElementById("price").onchange = replaceGarages;
    auth.onAuthStateChanged(async (user) => {
        var today = new Date();
        var minDate = "" + today.getFullYear() + "-" + zeroPad(parseInt(today.getMonth()) + 1, 2) + "-" + zeroPad(today.getDate(), 2);
        document.getElementById("sDate").min = minDate;
        await fillVehicleList();
        await new Promise(r => setTimeout(r, 1000));
        fillGarageList();
        fillPaymentList(user);
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
    const zeroPad = (num, places) => String(num).padStart(places, '0');
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

    if (inputNullOrEmpty(vehicle)) {
        var errorField = document.getElementById("vehicleError");
        errorField.classList.add("flex");
        errorField.classList.remove("hidden");
        return;
    } else {
        var errorField = document.getElementById("vehicleError");
        errorField.classList.add("hidden");
        errorField.classList.remove("flex");
    }

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

    let [sHours, sMins] = sTime.split(":");
    var requestStartTime = parseInt(sHours)*100 + parseInt(sMins);
    let [eHours, eMins] = eTime.split(":");
    var requestEndTime = parseInt(eHours)*100 + parseInt(eMins);

    await db.collection("Garage")
    .where("Lng", ">", mapCenter.lng() - 0.02)
    .where("Lng", "<", mapCenter.lng() + 0.02)
    .where("Lat", ">", mapCenter.lat() - 0.015)
    .where("Lat", "<", mapCenter.lat() + 0.015)
    .where("" + dbSpotName + ".Price", "<=", parseInt(price))
    .orderBy("Lng")
    .get()
    .then(async (querySnapshot) => {
        deleteGarageCards();
        querySnapshot.forEach(async (doc) => {
            const data = doc.data();
            //Calculating taken spots
            var takenSpots = 0;
            await data.Reservations.forEach(async (reservation) => {
                await db.collection("Reservation").doc(reservation.slice(12)).get()
                .then((doc) => {
                    const data = doc.data();
                    const spotType = data.SpotInfo.Type;
                    var resStart = data.Start.toDate();
                    var resStartDate = "" + resStart.getFullYear() + "-" + zeroPad(parseInt(resStart.getMonth()) + 1, 2) + "-" + zeroPad(resStart.getDate(), 2);
                    var resStartTime = parseInt(resStart.getHours())*100 + parseInt(resStart.getMinutes());
                    var resEnd = data.End.toDate();
                    var resEndTime = parseInt(resEnd.getHours())*100 + parseInt(resEnd.getMinutes());

                    if (sDate === resStartDate && spotType === sTypeSelected
                    && ((requestStartTime >= resStartTime && requestStartTime <= resEndTime) 
                    || (requestEndTime >= resStartTime && requestEndTime <= resEndTime))) {
                        takenSpots += 1;
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
            // Calculating open time
            var openTimeDate = data.OpenTime.toDate();
            var actualStartTime = openTimeDate.getHours()*100 + openTimeDate.getMinutes();
            // Calculating close time
            var closeTimeDate = data.CloseTime.toDate();
            var actualEndTime = closeTimeDate.getHours()*100 + closeTimeDate.getMinutes();

            await new Promise(r => setTimeout(r, 500));

            if(requestStartTime >= actualStartTime 
            && requestEndTime <= actualEndTime 
            && requestEndTime > requestStartTime
            && totalSpots > takenSpots) {
                garageList.push(data);
                await addMapMarker(data, doc.id, sTypeSelected);
            }
        });
    })
    .then(async () => {
        await new Promise(r => setTimeout(r, 500));
        if (garageList.length <= 0) {
            var errorField = document.getElementById("filterError");
            errorField.classList.add("flex");
            errorField.classList.remove("hidden");
        } else {
            var errorField = document.getElementById("filterError");
            errorField.classList.add("hidden");
            errorField.classList.remove("flex");
        }
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

async function addMapMarker(garageData, garageID, spotType) {
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
    displayOneGarage(garageData, garageID, marker, spotType);
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

function displayOneGarage(data, garageID, marker, spotType) {
    const gName = data.Name;
    const gAddress = data.Address + ", " + data.AreaCode;
    let garageList = document.getElementById('GarageList');
    var newGarage = document.createElement('li');
    newGarage.className = 'bg-slate-300 p-3 mb-3 rounded-xl hover:bg-slate-400';
    var pName = document.createElement('p');
    pName.id = "" + garageID + "-name"
    var pAddress = document.createElement('p');
    pAddress.id = "" + garageID + "-address"
    var pPrice = document.createElement('p');
    pPrice.id = "" + garageID + "-price"
    var bookButton = document.createElement('button');
    bookButton.className = "object-right text-white text- p-2 rounded-3xl bg-PP-light-orange border-4 border-PP-orange hover:bg-PP-orange";
    bookButton.innerHTML = "Book"
    bookButton.onclick = function() {
        document.getElementById("bookReservationTitle").innerHTML = "Confirm reservation for " + gName;
        document.getElementById("book-notification-text").innerHTML = "";
        handleBookButton(garageID);
        openPopup("bookReservation");
    };
    var bottomRow = document.createElement('div');
    var growBox = document.createElement('div');
    growBox.className = "grow mr-4"
    bottomRow.className = "flex"
    bottomRow.appendChild(pPrice);
    bottomRow.appendChild(growBox);
    bottomRow.appendChild(bookButton);
    var gPrice
    switch (spotType) {
        case "Normal":
            gPrice = data.Spots_Normal.Price;
            break;
        case "EV":
            gPrice = data.Spots_EV.Price;
            break;
        case "Handicap":
            gPrice = data.Spots_Handicap.Price;
            break;   
        case "Moto":
            gPrice = data.Spots_Moto.Price;
            break;
    }
    pName.innerHTML = gName;
    pAddress.innerHTML = gAddress;
    pPrice.innerHTML = "$" + gPrice + "/Hour";
    newGarage.id = garageID;
    newGarage.appendChild(pName);
    newGarage.appendChild(pAddress);
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
    const sDate = new Date(document.getElementById("sDate").value);
    const sTime = document.getElementById("startTime").value;
    const eTime = document.getElementById("endTime").value;
    const vehicleName = document.getElementById("vehicleList").options[document.getElementById("vehicleList").selectedIndex].text;
    const vehicleRef = document.getElementById("vehicleList").value;
    const sTypeSelected = document.getElementById("spotRequest").value;
    const price = document.getElementById(GarageRef + "-price");
    var paymentRef = document.getElementById("bookReservationPayment").value;
    startStr = "" + (parseInt(sDate.getMonth()) + 1) + "/" +  (parseInt(sDate.getDate()) + 1) + "/" + sDate.getFullYear() + " - " + timeConvert("" + sTime.substr(0,2) + ":" + sTime.substr(3,2))
    var startTime = firebase.firestore.Timestamp.fromDate(new Date(
        sDate.getFullYear(),sDate.getMonth(),(parseInt(sDate.getDate()) + 1),sTime.substr(0,2),sTime.substr(3,2)
    ));
    endStr = "" + (parseInt(sDate.getMonth()) + 1) + "/" + (parseInt(sDate.getDate()) + 1) + "/" + sDate.getFullYear() + " - " + timeConvert("" + eTime.substr(0,2) + ":" + eTime.substr(3,2))
    var endTime = firebase.firestore.Timestamp.fromDate(new Date(
        sDate.getFullYear(),sDate.getMonth(),(parseInt(sDate.getDate()) + 1),eTime.substr(0,2),eTime.substr(3,2)
    ));
    // Fill info
    const bGarageName = document.getElementById("bookReservationGarageName");
    const bGarageAddress = document.getElementById("bookReservationGarageAddress");
    const bBookVehicle = document.getElementById("bookReservationVehicle");
    const bBookSpotType = document.getElementById("bookReservationSpotType");
    const bBookStartTime = document.getElementById("bookReservationStartTime");
    const bBookEndTime = document.getElementById("bookReservationEndTime");
    const bBookHourlyPrice = document.getElementById("bookReservationSpotHourlyPrice");
    const bBookTotalPrice = document.getElementById("bookReservationSpotTotalPrice");

    bGarageName.innerHTML = document.getElementById(GarageRef + "-name").innerHTML;
    bGarageAddress.innerHTML = document.getElementById(GarageRef + "-address").innerHTML;
    bBookVehicle.innerHTML = vehicleName;
    bBookSpotType.innerHTML = sTypeSelected;
    bBookStartTime.innerHTML = startStr;
    bBookEndTime.innerHTML = endStr;
    bBookHourlyPrice.innerHTML = document.getElementById(GarageRef + "-price").innerHTML;
    var hourlyPrice = parseInt(bBookHourlyPrice.innerHTML.replace("$","").replace("/Hour", ""));
    var totalPriceInt = hourlyPrice * (parseInt(eTime.substr(0,2)) - parseInt(sTime.substr(0,2)));
    if (totalPriceInt < 1) {totalPriceInt = hourlyPrice;}
    bBookTotalPrice.innerHTML = "$" + totalPriceInt;

    document.getElementById("finalizeReservationButton").onclick = function() {
        addReservation(GarageRef, sTypeSelected, totalPriceInt, vehicleRef, paymentRef, startTime, endTime);
    };
}

function setDefaultValues(){
    const zeroPad = (num, places) => String(num).padStart(places, '0');
    var today = new Date();
    var currentDate = "" + today.getFullYear() + "-" + zeroPad(parseInt(today.getMonth()) + 1, 2) + "-" + zeroPad(today.getDate(), 2);
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
    document.getElementById("price").value = "20";
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

async function fillPaymentList(user) {
    const paymentList = document.getElementById("bookReservationPayment");
    const db = firebase.firestore();
    var customerID = "";
    var paymentCount = 0;
    await db.collection("Account").doc(user.uid).get()
    .then((doc) => {
        customerID = doc.data().Profile.slice(9);
    });
    await db.collection("Customer").doc(customerID).get()
    .then((doc) => {
        var data = doc.data();
        data.Payments.forEach(async (payment) => {
            const newPayment = document.createElement("option");
            newPayment.value = payment.slice(8);
            await db.collection("Payment").doc(payment.slice(8)).get()
            .then((doc) => {
                paymentCount++;
                var data = doc.data();
                var expDate = data.Expiration.toDate();
                const paymentName = "Card:" + String(data.CardNum).slice(-4) + ", exp:" + (parseInt(expDate.getMonth()) + 1) + "/" + String(expDate.getFullYear()).slice(2);
                newPayment.innerHTML = paymentName;
                paymentList.appendChild(newPayment);
            })
            .catch((error) => {
                console.log("Failed to get payment data: " + error);
                return;
            });
        });
    })
    .then(async() => {
        await new Promise(r => setTimeout(r, 500));
        if (paymentCount <= 0) {
            var errorField = document.getElementById("paymentError");
            errorField.classList.add("flex");
            errorField.classList.remove("hidden");
        } else {
            var errorField = document.getElementById("paymentError");
            errorField.classList.add("hidden");
            errorField.classList.remove("flex");
        }
    });
}

async function handleShowReservations() {
    openPopup("openReservation");
    document.getElementById("reservationBody").innerHTML = "";

    var user = firebase.auth().currentUser;
    var db = firebase.firestore();

    await db.collection("Account").doc(user.uid).get()
    .then(async(accountDoc) => {
        const accountData = accountDoc.data();
        await db.collection("Customer").doc(accountData.Profile.slice(9)).get()
        .then((customerDoc) => {
            var customerData = customerDoc.data();
            customerData.Reservations.forEach(displayReservation);
        })
        .catch((error) => {
            console.log("Error finding customer doc: " + error);
        });
    })
    .catch((error) => {
        console.log("Error finding account doc: " + error);
    });
}