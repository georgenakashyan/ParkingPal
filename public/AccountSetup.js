function updateUserType(type) {
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const accountDoc = db.collection("Account").doc(user.uid);
    const typeDoc = db.collection(type)
    switch (type) {
        case "Customer":
            typeDoc.add({
                Accessibility: false,
                Favorites: [],
                Payments: [],
                Reservations: [],
                Reviews: [],
                Vehicles: [],
            }).then((doc) => {
                accountDoc.set({
                    Type_ID: type,
                    Profile: "Customer/" + doc.id
                }, { merge: true });
                mainPage();
            });
            break;
        case "Manager":
            typeDoc.add({
                Billing: "",
                Garages: []
            }).then((doc) => {
                accountDoc.set({
                    Type_ID: type,
                    Profile: "Manager/" + doc.id
                }, { merge: true });
                mainPage();
            });
            break;
        default:
            console.log("updateUserType: Incorrect type given");
            break;
    }
}