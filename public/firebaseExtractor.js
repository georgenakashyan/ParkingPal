import {getAuth} from "firebase/auth";

document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
});

/**
 * Main method for extracting information from firebase
 * call this instead of each method for getting information
 */
function main(){
    const auth=getAuth();
    const user=auth.currentUser;
    if(user!=null){
        const uid=user.uid;
    }
    dataExtraction(uid);
}

/**
 * extracts information from the firebase
 * @param {*} userID 
 */
function dataExtraction(userID){
    const profileInfo=db.collection('Account').doc(userID);
    const doc=profileInfo.get();
    if(!doc.exists){
        console.log('No such document');
    }
    else{
        console.log('Document data:',doc.data());
    }
}