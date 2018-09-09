/////////////////////////////////////////////
///// Database
/////////////////////////////////////////////
 let config = {
   apiKey: apiKeyGoogle,
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
 function initMap(lat,long,zoomLevel,setMarker){
   directionService = new google.maps.DirectionsService();
   directionDisplay = new google.maps.DirectionsRenderer();
   if(lat === undefined && long === undefined){
     lat = 34.05223;
     long = -118.243683;
     zoomLevel = 10;
    }
    map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: lat, lng: long},
            zoom: zoomLevel
          });
    if (setMarker === true){
      var marker = new google.maps.Marker({
         position: {lat: lat, lng: long},
         map: map,
         title: 'Home Base'
       });
    }
   directionDisplay.setMap(map);
   let listener1 = map.addListener("tilesloaded",function(){
     calcRoute(latLongParser(trip[currentDay-1]),travelMethod);
     setTimeout(function(){
       iteBoxRender();
     },50);
     google.maps.event.removeListener(listener1);
   });
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
/**
* On click function for next day of the itinerary box
*/
$("#iteButNextDay").on("click",function(){
  if(trip !== undefined && currentDay !== trip.length){
    $("#iteContent").empty();
    currentDay++;
    //update route
    calcRoute(latLongParser(trip[currentDay-1]),travelMethod);
    iteBoxRender();
  }
});
/**
* On click function for previous day of the itinerary box
*/
$("#iteButPrevDay").on("click",function(){
  if(currentDay !== 1){
    $("#iteContent").empty();
    currentDay--;
    //update route
    calcRoute(latLongParser(trip[currentDay-1]),travelMethod);
    iteBoxRender();
  }
});
/**
* This runs the travel method button.
*/
$("#methodSwitch").on("click",function(){
  if(travelMethod === "DRIVING"){
    travelMethod = "WALKING";
  }
  else {
    travelMethod = "DRIVING";
  }
  calcRoute(latLongParser(trip[currentDay-1]),travelMethod);
  iteBoxRender();
});
/////////////////////////////////////////////
///// Functions
/////////////////////////////////////////////
/**
* This renders all the functionalities of the itineraryBox
*/
function iteBoxRender(){
  if(trip !== undefined){
    $("#iteDay").text(currentDay+"/"+trip.length);
    //current day itinerary to display
    let currentDayIte = trip[currentDay-1];
    //we'll clear previous displays of iteContent
    $("#iteContent").empty();
    //we'll display the map around the Hotel, which should always by the initial point.
    for(let i = 0; i < currentDayIte.length; i++){
      let iteDiv = $("<div>").addClass("iteDiv");
      $(iteDiv).append(currentDayIte[i].loc);
      iteDiv.attr("data-pos",i);
      //first and last element should not be able to be move so we won't add an edit button for them
      if (i !== 0 && i !== currentDayIte.length-1){
        let deleteButton = $("<button>").text("Delete");
        deleteButton.on("click",function(){
          //removes data from trip
          currentDayIte.splice($(this).parent().attr("data-pos"),1);
          //update route
          calcRoute(latLongParser(currentDayIte),travelMethod);
          //visually remove this from the parent
          $(this).parent().remove();
          //call the render function again to re-render
          iteBoxRender();
        });
        let moveUp = $("<button>").text("Move Up");
        moveUp.on("click",function(){
          //can't move element past 1st index
          if(i !== 1){
            let currentPoint = trip[currentDay-1].splice($(this).parent().attr("data-pos"),1);
            let newPos = parseInt($(this).parent().attr("data-pos"))-1;
            trip[currentDay-1].splice(newPos,0,currentPoint[0]);
            //update route
            calcRoute(latLongParser(currentDayIte),travelMethod);
            //call the render function again to re-render
            iteBoxRender();
          }
        });
        let moveDown = $("<button>").text("Move Down");
        moveDown.on("click",function(){
          //can't move element past 1st index
          if(i !== currentDayIte.length-2){
            let currentPoint = trip[currentDay-1].splice($(this).parent().attr("data-pos"),1);
            let newPos = parseInt($(this).parent().attr("data-pos"))+1;
            trip[currentDay-1].splice(newPos,0,currentPoint[0]);
            //update route
            calcRoute(latLongParser(currentDayIte),travelMethod);
            console.log(dayJourney);
            //call the render function again to re-render
            iteBoxRender();
          }
        });
        $(iteDiv).append(deleteButton);
        $(iteDiv).append(moveUp);
        $(iteDiv).append(moveDown);
      }
      //if its not the last array piece, we'll add a journey block
      //timeout is required since ajaxcalls take time... this is hardcoded for now
      setTimeout(function(){
        $("#iteContent").append(iteDiv);
        if(i !== currentDayIte.length-1 && dayJourney !== undefined){
          let journeyDiv = $("<div>").addClass("journeyBlock");
          $(journeyDiv).append("Distance: "+dayJourney[i].distance+"  ");
          $(journeyDiv).append("Duration: "+dayJourney[i].duration);
          $("#iteContent").append(journeyDiv);
        }
      },100);
    }
  }
}
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
      for(let i = 0; i < response.routes[0].legs.length; i++){
        journey.push({
          distance: response.routes[0].legs[i].distance.text,
          duration: response.routes[0].legs[i].duration.text
        });
        if(i === response.routes[0].legs.length-1){
          dayJourney = journey;
        }
      }
      directionDisplay.setDirections(response);
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
/**
* This extracts latitude and longitude out of the object, and produces an array compatible with calcRoute()
* @param {Array} arr - Array of Objects that represent trip locations.
*/
function latLongParser(arr){
  let parsedArr = [];
  for(let i = 0; i < arr.length; i++){
    parsedArr.push(arr[i].lat+","+arr[i].long);
  }
  return parsedArr;
}
/////////////////////////////////////////////
///// Testing Junk
/////////////////////////////////////////////

//each array is the itenerary for the day.
//this is mock data
trip = [
  [{lat: "34.136379", long: "-118.243752", loc: "Home"},{lat: "34.142979",long:"-118.255388", loc: "Point A"},{lat: "34.141133",long:"-118.224108", loc: "Point B"},{lat: "34.143721",long:"-118.256334", loc: "Point C"},{lat: "34.136379", long: "-118.243752", loc: "Home"}],
  [{lat: "34.136379", long: "-118.243752", loc: "Home"},{lat: "34.142979",long:"-118.255388", loc: "Point A"},{lat: "34.136379", long: "-118.243752", loc: "Home"}],
  [{lat: "34.136379", long: "-118.243752", loc: "Home"},{lat: "34.142979",long:"-118.255388", loc: "Point A"},{lat: "34.136379", long: "-118.243752", loc: "Home"}]
];
//Might not be needed since there are previous interfaces we will be interacting with.
