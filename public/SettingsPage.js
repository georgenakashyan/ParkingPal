/**
 * this adds a vehicle doc to the Vehicle collection
 * adds the doc reference to customer vehicle map
 */
async function addVehicles(FuelTypeRef,LicensePlateRef,MakeRef,ModelRef,SizeRef,YearRef){
    //variables
    var fuelType,licensePlate,make,model,size,year;
    //link db
    const user=firebase.auth().currentUser,db=firebase.firestore();
    //assign specific collection
    /* error on line 12 fix later */
    const customerID=await db.collection("Account").doc(user).data().Profile.slice(9);
    const vehicleDB=db.collection("Vehicle"),customerDB=db.collection(customerID);
    //get info from HTML
    fuelType=/* document.getElementById("").value */FuelTypeRef;
    licensePlate=/* document.getElementById("").value */LicensePlateRef;
    make=/* document.getElementById("").value */MakeRef;
    model=/* document.getElementById("").value */ModelRef;
    size=/* document.getElementById("").value */SizeRef;
    year=/* document.getElementById("").value  */YearRef;
    //catches errors
    if(inputNullorEmpty(fuelType)){
        errorField.innerHTML="Please enter the fuel type";
    }
    else if(inputNullorEmpty(licensePlate)){
        errorField.innerHTML="Please enter the license plate number";
    }
    else if(inputNullorEmpty(make)){
        errorField.innerHTML="Please enter the make of the car";
    }
    else if(inputNullorEmpty(model)){
        errorField.innerHTML="Please enter the model of the car";
    }
    else if(inputNullorEmpty(size)){
        errorField.innerHTML="Please enter the size of the car";
    }
    else if(inputNullorEmpty(year)){
        errorField.innerHTML="Please enter the make year of the car";
    }
    else if(!db.collection("Account").Type_ID.equals("Customer")){
        errorField.innerHTML="You are not a customer please switch your account before contining";
    }
    //adds it to a doc
    var vehicleDoc={
        FuelType: fuelType,
        LicensePlate: licensePlate,
        Make: make,
        Model: model,
        Size: size,
        Year: year
    };
    //adds it do database
    await vehicleDB.add(vehicleDoc)
    .then((document)=>{
        customerDB.update({
            Vehicles: [{vehicle: "Vehicle/"+document.id}]
        });
    })
    .catch((error)=>{
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + " --- " + errorMessage);  
    });
}
//hour log: 1.5 hours

/**
 * This will save any changes that have been made to a vehicles information
 * @param {*} VehicleRef 
 */
async function saveVehicleChanges(VehicleRef){

}

/**
 * this will delete the vehicle document
 * this will remove the reference from customer
 * @param {*} VehicleRef 
 */
async function deleteVehicle(VehicleRef){

}


function SaveChanges() {
    document.getElementById('saveButton').classList.add('hidden');
  }
