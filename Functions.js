function login(){
    let defaultUser =  "admin";
    let defaultPassword = "123";

    let user = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    //console.log(user + password);
    //console.log(defaultUser + defaultPassword);

    if(user == defaultUser && password == defaultPassword){
        location.href="Parking-Pal.html";
    }else {
        alert("Incorrect username or password");
    }
}


function create(){

}

