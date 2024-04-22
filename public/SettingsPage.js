
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


function SaveChanges() {
    document.getElementById('saveButton').classList.add('hidden');
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
        db.collection("Customer").update({
            Payments: firebase.firestore.FieldValue.arrayUnion("Payment/"+updateDoc.id)
        })
        ,then((error)=>{
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
    //error check
    if(inputNullOrEmpty(PaymentRef)){
        errorField.innerHTML="Ngl I don't even know how the fuck you go here";
    }
    //deletes from customer array
    await db.collection("Customer").doc(customerID)
    .update({
        Payment: firebase.firestore.FieldValue.arrayRemove(paymentLink)
    });
    //deletes doc from database
    await paymentDB.doc(PaymentRef).delete();
    //updates HTML code
    document.getElementById(PaymentRef).remove();
    closePopup("");
}

/**
 * adds billing information to database
 * links to manager doc
 */
async function addBilling(){

}

/**
 * changes billing in database
 * @param {*} BillingRef 
 */
async function saveBillingChanges(BillingRef){

}

/**
 * checks to see if there is a billing doc
 * if there is a billing doc it will send it to saveBillingChanges(BillingRef)
 * if there is no billing doc it will send it to addBilling()
 */
async function checkBilling(){

}