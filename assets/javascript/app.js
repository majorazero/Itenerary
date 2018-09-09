/////////////////////////////////////////////
///// Database
/////////////////////////////////////////////
 let config = {
   apiKey: "AIzaSyDv_zM8h9A6Oko14vD1d_KdWg6oV1MtkCQ",
   authDomain: "project1travel-itenerary-app.firebaseapp.com",
   databaseURL: "https://project1travel-itenerary-app.firebaseio.com",
   projectId: "project1travel-itenerary-app",
   storageBucket: "",
   messagingSenderId: "136977891330"
 };
 firebase.initializeApp(config);
 const firestore = firebase.firestore();
 const settings = {/* your settings... */ timestampsInSnapshots: true};
 firestore.settings(settings);
 /////////////////////////////////////////////
 ///// Intialization
 /////////////////////////////////////////////
 /**
 * Required to initialize the google maps object
 */
 function initMap(){
   directionService = new google.maps.DirectionsService();
   directionDisplay = new google.maps.DirectionsRenderer();
   map = new google.maps.Map(document.getElementById('map'), {
           center: {lat: 34.05223, lng: -118.243683},
           zoom: 10
         });
   directionDisplay.setMap(map);
 }
 /////////////////////////////////////////////
 ///// Event Functions
 /////////////////////////////////////////////
$("#submitBtn").click(function(){
    $("#containerOne").hide();
    $("#containerTwo").show();
});
$("#submitButton").click(function(){
    $("#containerOne").hide();
    $("#containerTwo").hide();
    $("#containerThree").show();
});
/////////////////////////////////////////////
///// Functions
/////////////////////////////////////////////
/**
* This will be how we calculate our routes, will display the trip as well as return an array of objects with the DISTANCE and DURATION of each leg of the trip
* @param {Array} routeArr - An array of coordinates, should be at least 2 but no more than 10 (the top-limit is something to do on google's side)
* @param {String} method - Determines how the journey should be done... default is "DRIVING", also accepts "WALKING" for now, will consider adding "TRANSIT"
* @param {Boolean} efficientTravel - Turn on optimization to auto-organize the in-between part of the trip.
*/
function calcRoute(routArr, method, efficientTravel){
  let startPoint;
  let endPoint;
  let waypts = [];
  let tMethod = "DRIVING";
  let journey = [];
  for(let i =0; i < routArr.length; i++){
    if(i === 0){
      startPoint = routArr[i];
    }
    else if (i === routArr.length-1){
      endPoint = routArr[i];
    }
    else{
      waypts.push({location: routArr[i]});
    }
  }
  if(method === "WALKING"){
    tMethod = method;
  }
  let request = {
    origin: startPoint,
    destination: endPoint,
    waypoints: waypts,
    travelMode: tMethod
  };
  if (efficientTravel === true){
    request.optimizeWaypoints = true;
  }
  directionService.route(request, function(response, status){
    if (status === "OK"){
      console.log(response);
      for(let i = 0; i < response.routes[0].legs.length; i++){
        journey.push({
          distance: response.routes[0].legs[i].distance.text,
          duration: response.routes[0].legs[i].duration.text
        });
      }
      directionDisplay.setDirections(response);
      console.log(journey);
      return journey;
    }
  });
}
/**
* This will either create new user data, or save existing user data.
* @param {String} userName - String that is the username the user wants to either add to or update
* @param {String} pass - String that is the password, needed for new users and/or to update existing files
* @param {Object} saveObject - Object that contains all the data our page needs.
*/
function saveUserData(userName, pass, saveObject){
  if (saveObject === undefined){
    saveObject = {};
  }
  firestore.collection("user").where("name","==",userName).get().then(function(response){
    if(response.docs.length > 0){
      console.log("User found!");
      if(pass === response.docs[0].data().password){
        console.log("Updating...");
        firestore.collection("user").doc(userName).set({
          name: userName,
          password: pass,
          data: saveObject
        });
      }
      else{
        console.log("Wrong password.");
      }
    }
    else {
      console.log("Doesn't exist!");
      console.log("Creating new user...");
      firestore.collection("user").doc(userName).set({
        name: userName,
        password: pass,
        data: saveObject
      });
    }
  });
}
/**
* Will load user data based on their usernname and password
* @param {String} userName - String that is the username the user wants to load
* @param {String} pass - String that is the password, needed for new users to load existing files
*/
function loadUserData(userName, pass){
  firestore.collection("user").where("name","==",userName).get().then(function(response){
    if(response.docs.length > 0) {
      let doc = response.docs[0].data();
      if(pass !== doc.password){
        console.log("Incorrect password");
      }
      else{
        console.log("Access granted");
        return doc.data;
      }
    }
    else{
      console.log("User does not exist.");
    }
  });
}
/////////////////////////////////////////////
///// Testing Junk
/////////////////////////////////////////////
//this is test code, will eventually be deleted.
let destinArr = ["34.05223,-118.243683","34.153351,-118.165794","34.136120,-117.865341","34.142509,-118.255074"];
$("#test").on("click",function(){
  calcRoute(destinArr,"WALKING",true);
});

let day = new Array(10);
let currentDay = 4;
console.log(day.length);
iteBoxRender();
//we'll use this to render the itinerary box info
function iteBoxRender(){
  $("#iteDay").text(currentDay+"/"+day.length);
}
//set up day event functions
$("#iteButNextDay").on("click",function(){
  if(currentDay !== 10){
    currentDay++;
    iteBoxRender();
  }
});
$("#iteButPrevDay").on("click",function(){
  if(currentDay !== 1){
    currentDay--;
    iteBoxRender();
  }
});
