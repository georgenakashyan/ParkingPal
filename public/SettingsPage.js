document.addEventListener("DOMContentLoaded", event => {
    const auth = firebase.auth();
    auth.onAuthStateChanged(async (user) => {
        setDefaultValues(user);
    });
});


/**
 * this adds a vehicle doc to the Vehicle collection
 * adds the doc reference to customer vehicle map
 */
async function addVehicles(){
    //variables
    var fuelType,handicapBool,licensePlate,make,model,motoBool,year,customerID;
    //link db
    const user=firebase.auth().currentUser;
    const db=firebase.firestore();
    //assign specific collection
    const vehicleDB=db.collection("Vehicle");
    await db.collection("Account").doc(user.uid).get()
    .then((userDoc)=>{
        customerID=userDoc.data().Profile.slice(9);
    })
    .catch((error)=>{
        console.log("Failed to find Customer doc: "+error);
    });
    const customerDB=db.collection("Customer").doc(customerID);
    //get info from HTML
    fuelType=document.getElementById("").value;
    handicapBool=document.getElementById("").value;
    licensePlate=document.getElementById("").value;
    make=document.getElementById("").value;
    model=document.getElementById("").value;
    motoBool=document.getElementById("").value;
    year=document.getElementById("").value;
    //catches errors
    if(inputNullOrEmpty(fuelType)){
        errorField.innerHTML="Please enter the fuel type";
    }
    else if(inputNullOrEmpty(licensePlate)){
        errorField.innerHTML="Please enter the license plate number";
    }
    else if(inputNullOrEmpty(make)){
        errorField.innerHTML="Please enter the make of the car";
    }
    else if(inputNullOrEmpty(model)){
        errorField.innerHTML="Please enter the model of the car";
    }
    else if(inputNullOrEmpty(size)){
        errorField.innerHTML="Please enter the size of the car";
    }
    else if(inputNullOrEmpty(year)){
        errorField.innerHTML="Please enter the make year of the car";
    }
    //adds it to a doc
    var vehicleDoc={
        FuelType: fuelType,
        HandiCap: handicapBool,
        LicensePlate: licensePlate,
        Make: make,
        Model: model,
        Moto: motoBool,
        Year: year
    };
    //adds it do database
    await vehicleDB.add(vehicleDoc)
    .then((document)=>{
        customerDB.update({
            Vehicles: firebase.firestore.FieldValue.arrayUnion("Vehicle/"+document.id)
        });
    })
    .catch((error)=>{
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + " --- " + errorMessage);  
    });
}
//hour log: 5 hours

/**
 * This will save any changes that have been made to a vehicles information
 * @param {*} VehicleRef 
 */
async function saveVehicleChanges(VehicleRef){
    //variables
    var fuelType,handicapBool,licensePlate,make,model,motoBool,year;
    //link db
    const user=firebase.auth().currentUser,db=firebase.firestore();
    //assign specific collection
    const vehicleDB=db.collection("Vehicle").doc(VehicleRef);
    //get info from HTML
    fuelType=document.getElementById("").value;
    handicapBool=document.getElementById("").value;
    licensePlate=document.getElementById("").value;
    make=document.getElementById("").value;
    model=document.getElementById("").value;
    motoBool=document.getElementById("").value;
    year=document.getElementById("").value;
    //catches errors
    if(inputNullOrEmpty(fuelType)){
        errorField.innerHTML="Please enter the fuel type";
    }
    else if(inputNullOrEmpty(handicapBool)){
        errorField.innerHTML="Please enter if you are handicaped or not";
    }
    else if(inputNullOrEmpty(licensePlate)){
        errorField.innerHTML="Please enter the license plate number";
    }
    else if(inputNullOrEmpty(make)){
        errorField.innerHTML="Please enter the make of the car";
    }
    else if(inputNullOrEmpty(model)){
        errorField.innerHTML="Please enter the model of the car";
    }
    else if(inputNullOrEmpty(motoBool)){
        errorField.innerHTML="Please enter the size of the car";
    }
    else if(inputNullOrEmpty(year)){
        errorField.innerHTML="Please enter the make year of the car";
    }
    //adds it to a doc
    var vehicleDoc={
        FuelType: fuelType,
        HandiCap: handicapBool,
        LicensePlate: licensePlate,
        Make: make,
        Model: model,
        Moto: motoBool,
        Year: year
    };
    //updates database by merging the docs
    await vehicleDB.set(vehicleDoc,{merge:true});
}

/**
 * this will delete the vehicle document
 * this will remove the reference from customer
 * @param {*} VehicleRef 
 */
async function deleteVehicle(VehicleRef){
    //variables
    var customerID;
    var vehicleLink="Vehicle/"+VehicleRef;
    //link db
    const user=firebase.auth().currentUser,db=firebase.firestore();
    //gets customer doc id
    const userAccount=await db.collection("Account").doc(user.uid);
    await db.collection("Account").doc(user.uid).get()
    .then((userDoc)=>{
        customerID=userDoc.data().Profile.slice(9);
    })
    .catch((error)=>{
        console.log("Failed to find Customer doc: "+error);
    });
    //error check
    if(inputNullOrEmpty(VehicleRef)){
        errorField.innerHTML="Ngl I don't even know how the fuck you go here";
    }
    //deletes from customer array
    await db.collection("Customer").doc(customerID)
    .update({
        Vehicles: firebase.firestore.FieldValue.arrayRemove(vehicleLink)
    });
    //deletes doc from database
    await db.collection("Vehicle").doc(VehicleRef).delete();
    //updates HTML code
    document.getElementById(VehicleRef).remove();
    closePopup("");
}


function saveChanges() {
    var errorField = document.getElementById("account-notification-text");
    errorField.innerHTML = "";
    errorField.style.setProperty("color", "red");
    var user = firebase.auth().currentUser;
    var first = document.getElementById("accountFirstName");
    var last = document.getElementById("accountLastName");

    if (inputNullOrEmpty(first.value)) {
        errorField.innerHTML = "Enter your first name"
        return;
    } else if (inputNullOrEmpty(last.value)) {
        errorField.innerHTML = "Enter your last name"
        return;
    } else {
        firebase.firestore().collection("Account").doc(user.uid)
        .update({
            FirstName: first.value,
            LastName: last.value
        })
        .then(() => {
            errorField.style.setProperty("color", "green");
            errorField.innerHTML = "Changes saved!";
        });
    }
}

/**
 * This will add a payment method and link it to the customer
 */
async function addPayment(){
    //variables
    var cvvNum,cardNum,expire=new Date(),customerID,copyCheck=false;
    //links to database
    const user=firebase.auth().currentUser,db=firebase.firestore();
    await db.collection("Account").doc(user.uid).get()
    .then((userDoc)=>{
        customerID=userDoc.data().Profile.slice(9);
    })
    .catch((error)=>{
        console.log("Failed to find Customer doc: "+error);
    });
    const paymentDB=db.collection("Payment");
    //gets info from the HTML
    cvvNum=document.getElementById("").value;
    cardNum=document.getElementById("").value;
    expire=document.getElementById("").value;
    //error check
    await paymentDB.where('CardNum','==',cardNum).get()
    .then((noCopyDoc)=>{
        copyCheck=true;
    })
    .catch((error)=>{
        console.log("There was issue: "+error);
    })
    if(inputNullOrEmpty(cvvNum)&&cvvNum>99&&cvvNum<1000){
        ErrorField.innerHTML("Please enter a valid CVV");
    }
    else if(inputNullOrEmpty(cardNum)){
        ErrorField.innerHTML("Please enter a card number");
    }
    else if(inputNullOrEmpty(expire)){
        ErrorField.innerHTML("Please enter an experation date for your card");
    }
    else if(copyCheck){
        ErrorField.innerHTML("This card is already in your system, please delete the card before continuing");
    }
    //makes doc
    var paymentDoc={
        CVV: cvvNum,
        CardNum: cardNum,
        Expiration: expire
    };
    await paymentDB.add(paymentDoc)
    .then((updateDoc)=>{
        db.collection("Customer").doc(customerID).update({
            Payments: firebase.firestore.FieldValue.arrayUnion("Payment/"+updateDoc.id)
        })
        .then((error)=>{
            console.log("There has been an issue: "+error);
        });
    })
    .catch((error)=>{
        console.log("There has been an issue: "+error);
    });
}

/**
 * this will remove a payment method and delink it from the customer
 * @param {*} PaymentRef 
 */
async function removePayment(PaymentRef){
    //variables
    var customerID;
    var paymentLink="Payment/"+PaymentRef;
    //links to database
    const user=firebase.auth().currentUser,db=firebase.firestore();
    const paymentDB=db.collection("Payment");
    //gets customer doc id
    await db.collection("Account").doc(user.uid).get()
    .then((userDoc)=>{
        customerID=userDoc.data().Profile.slice(9);
    })
    .catch((error)=>{
        console.log("Failed to find Customer doc: "+error);
    });
    //deletes from customer array
    await db.collection("Customer").doc(customerID)
    .update({
        Payment: firebase.firestore.FieldValue.arrayRemove(paymentLink)
    });
    //deletes doc from database
    await paymentDB.doc(PaymentRef).delete();
    //updates HTML code
    document.getElementById(PaymentRef).remove();
}

/**
 * adds billing information to database
 * links to manager doc
 * @param {*} ManagerRef
 */
async function addBilling(ManagerRef){
    //variables
    var accountNum,address,org,routingNum;
    //links database
    const user=firebase.auth().currentUser,db=firebase.firestore();
    const billingDB=db.collection("Billing"),managerDB=db.collection("Manager").doc(ManagerRef);
    //gets data from HTML
    accountNum=document.getElementById("").value;
    address=document.getElementById("").value;
    org=document.getElementById("").value;
    routingNum=document.getElementById("").value;
    //error checking
    if(inputNullOrEmpty(accountNum)){
        ErrorField.innerHTML("Please enter a valid account number");
    }
    else if(inputNullOrEmpty(address)){
        ErrorField.innerHTML("Please enter a valid address");
    }
    else if(inputNullOrEmpty(org)){
        ErrorField.innerHTML("Please enter a valid organization");
    }
    else if(inputNullOrEmpty(routingNum)){
        ErrorField.innerHTML("Please enter a valid routingNum");
    }
    //making doc
    var billingDoc={
        accountNum: accountNum,
        Address: address,
        Organization: org,
        RoutingNum:routingNum
    };
    //add to database
    await billingDB.add(billingDoc)
    .then((updateDoc)=>{
        managerDB.update({
            Billing: "Billing/"+updateDoc.id
        })
        .catch((error)=>{
            console.log("Couldn't find Manager doc: "+error);
        });
    })
    .catch((error)=>{
        console.log("Couldn't add the doc to billing: "+error);
    });
}

/**
 * changes billing in database
 * @param {*} BillingRef 
 */
async function saveBillingChanges(BillingRef){
    //variables
    var accountNum,address,org,routingNum;
    //links to database
    const user=firebase.auth().currentUser,db=firebase.firestore();
    const billingDB=db.collection("Billing").doc(BillingRef);
    //gets data from HTML
    accountNum=document.getElementById("").value;
    address=document.getElementById("").value;
    org=document.getElementById("").value;
    routingNum=document.getElementById("").value;
    //error checking
    if(inputNullOrEmpty(accountNum)){
        ErrorField.innerHTML("Please enter a valid account number");
    }
    else if(inputNullOrEmpty(address)){
        ErrorField.innerHTML("Please enter a valid address");
    }
    else if(inputNullOrEmpty(org)){
        ErrorField.innerHTML("Please enter a valid organization");
    }
    else if(inputNullOrEmpty(routingNum)){
        ErrorField.innerHTML("Please enter a valid routingNum");
    }
    //making doc
    var billingDoc={
        accountNum: accountNum,
        Address: address,
        Organization: org,
        RoutingNum:routingNum
    };
    //merges doc
    await billingDB.set(billingDoc,{merge:true});
}

/**
 * checks to see if there is a billing doc
 * if there is a billing doc it will send it to saveBillingChanges(BillingRef)
 * if there is no billing doc it will send it to addBilling()
 */ 
async function checkBilling(){
    //variables
    var managerID,billingID;
    //links to database
    const user=firebase.auth().currentUser,db=firebase.firestore();
    //gets manager doc link
    await db.collection("Account").doc(user.uid).get()
    .then((userDoc)=>{
        managerID=userDoc.data().Profile.slice(8);
    })
    .catch((error)=>{
        console.log("Failed to find Manager doc: "+error);
    });
    //gets billing from manager doc
    await db.collection("Billing").doc(managerID).get()
    .then((managerDoc)=>{
        billingID=managerDoc.data().Billing.slice(8);
    })
    .catch((error)=>{
        console.log("Failed to find Manager Doc: "+error);
    });
    //sends to approate function
    if(inputNullOrEmpty(billingID)){
        await addBilling(managerID);
        return;
    }
    else{
        await saveBillingChanges(billingID);
        return;
    }
}

async function setDefaultValues(user){
    const db = firebase.firestore();
    const accFirst = document.getElementById("accountFirstName");
    const accLast = document.getElementById("accountLastName");
    const accEmail = document.getElementById("accountEmail");

    await db.collection("Account").doc(user.uid)
    .get()
    .then((doc) => {
        var data = doc.data();
        accFirst.value = data.FirstName;
        accLast.value = data.LastName;
        accEmail.value = data.Email;
        if (data.Profile.includes("Manager")) {
            setDefaultBilling(data.Profile.slice(8));
        } else {
            setDefaultPayments(data.Profile.slice(9));
            setDefaultVehicles(data.Profile.slice(9));
        }
    });
}

async function setDefaultPayments(customerRef) {
    const db = firebase.firestore();
    const profileInfo = await db.collection('Customer').doc(customerRef);
    profileInfo.get()
    .then((doc) => {
        var paymentList = doc.data().Payments;
        paymentList.forEach(displayOnePayment);
    })
    .catch((error) => {
        console.log("Failed to find customer doc: " + error);
    });
}

async function displayOnePayment(paymentRef) {
    let paymentList = document.getElementById('paymentList');
    var newPayment = document.createElement('li');
    newPayment.className = 'bg-slate-300 p-3 ml-3 mr-3 mb-3 rounded-xl hover:bg-slate-400';
    var pNumber = document.createElement('p');
    var pExpiration = document.createElement('p');
    const db = firebase.firestore();
    await db.collection('Payment').doc(paymentRef.slice(8)).get()
    .then((doc) => {
        const data = doc.data();
        const gNum = String(data.CardNum).slice(12);
        var expDate = data.Expiration.toDate();
        const gExpiration = "" + (parseInt(expDate.getMonth()) + 1) + "/" + String(expDate.getFullYear()).slice(2);
        pNumber.innerHTML = "Card ending with: " + gNum;
        pExpiration.innerHTML = "Expires: " + gExpiration;
        newPayment.id = doc.id;

        var delPaymentButton = document.createElement('button');
        delPaymentButton.className = "text-gray-500 font-bold text-4xl self-center items-center float-right hover:text-red-700 hover:no-underline hover:cursor-pointer";
        delPaymentButton.innerHTML = "&times"
        delPaymentButton.onclick = function() {removePayment(paymentRef)};
        var mainDiv = documnet.createElement('div');
        mainDiv.className = "bg-slate-300 p-3 ml-3 mr-3 mb-3 rounded-xl grid grid-cols-2";

        var leftDiv = document.createElement('div');
        leftDiv.appendChild(pNumber);
        leftDiv.appendChild(pExpiration);
        var rightDiv = document.createElement('div');
        rightDiv.appendChild(delPaymentButton);

        mainDiv.appendChild(leftDiv);
        mainDiv.appendChild(rightDiv);
        newPayment.appendChild(maindDiv);
        paymentList.appendChild(newPayment);
    })
    .catch((error) => {
        console.log("Failed to find garage info doc");
    });
}

async function setDefaultVehicles(customerRef) {
    
}

async function setDefaultBilling(managerRef) {
    
}