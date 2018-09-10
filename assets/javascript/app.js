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

/**
* 2nd page to 3rd Page.
*/
$("#submitButton").click(function(){
    $("#containerOne").hide();
    $("#containerTwo").hide();
    $("#containerThree").show();
});
/**
* Handles login events.
*/
$("#login").on("submit",function(event){
  event.preventDefault();
  userName = $(this)[0][0].value;
  passWord = $(this)[0][1].value;
  loadUserData(userName,passWord);
  setTimeout(function(){
    if(isPass === true){
      $("#wrongPass").hide();
      $("#login").hide();
      tripObj = JSON.parse(currentData);
      for(let i = 0; i < tripObj.length; i++){
        let tripSelectDiv = $("<div>").addClass("tripButtons");
        let button = $("<button>").text(tripObj[i].tripName).addClass("btn btn-primary");
        $(button).on("click",function(){
          let tripObj = JSON.parse(currentData);
          for(let i = 0; i < tripObj.length; i++){
            if($(this).text() === tripObj[i].tripName){
              trip = tripObj[i].trip;
              tripName = tripObj[i].tripName;
              newUser = false;
              break;
            }
          }
          $("#containerOne").hide();
          $("#containerTwo").hide();
          $("#containerThree").show();
          $("#loadPrompt").modal("hide");
        });
        $(tripSelectDiv).append(button);
        $("#loadBody").append(tripSelectDiv);
      }
    }
    else{
      $("#wrongPass").show();
    }
  },500);
});
/**
* Handles how save button behaves on last page.
*/
$("#saveButton").on("click",function(){
  if (newUser === false){
    $("#userInput").val(userName);
    $("#tripInput").val(tripName);
  }
});
/**
* Handles how the data is actually saved.
*/
$("#saveForm").on("submit",function(event){
  event.preventDefault();
  userName = $(this)[0][0].value;
  passWord = $(this)[0][1].value;
  tripName = $(this)[0][2].value;
  $(this)[0][1].value = "";
  let tripObj;
  if(newUser === false){ //since the user exists we need to load the data and manipulate it.
    loadUserData(userName,passWord);
    setTimeout(function(){
      if(isPass === true){
        $("#wrongPass2").hide();
        $("#savePrompt").modal("hide");
        tripObj = JSON.parse(currentData);
        console.log(tripObj);
        // check if trip already exists
        for(let i = 0; i<tripObj.length; i++){
          if(tripObj[i].tripName === tripName){ //it does exist
            tripObj[i].trip = trip;
            saveUserData(userName,passWord,JSON.stringify(tripObj));
            return;
          }
        }
        tripObj.push({
          tripName: tripName,
          trip: trip
        });
        saveUserData(userName,passWord,JSON.stringify(tripObj));
      }
      else {
        $("#wrongPass2").show();
      }
    },500);
  }
  else{
    saveUserData(userName,passWord,JSON.stringify([{
      tripName: tripName,
      trip: trip
    }]));
  }
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
      if(i === 0 || i === currentDayIte.length-1){
        iteDiv.attr("id","homeBase")
      }
      //first and last element should not be able to be move so we won't add an edit button for them
      if (i !== 0 && i !== currentDayIte.length-1){
        let deleteButton = $("<button>").text("Delete").attr("id", "itButton");
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
        let moveUp = $("<button>").text("Move Up").attr("id", "itButton");
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
        let moveDown = $("<button>").text("Move Down").attr("id", "itButton");
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
function saveUserData(user, pass, saveObject){
  if (saveObject === undefined){
    saveObject = [];
  }
  firestore.collection("user").where("name","==",user).get().then(function(response){
    if(response.docs.length > 0){
      console.log("User found!");
      if(pass === response.docs[0].data().password){
        console.log("Updating...");
        firestore.collection("user").doc(userName).set({
          name: user,
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
      firestore.collection("user").doc(user).set({
        name: user,
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
function loadUserData(user, pass){
  firestore.collection("user").where("name","==",user).get().then(function(response){
    if(response.docs.length > 0) {
      let doc = response.docs[0].data();
      if(pass !== doc.password){
        console.log("Incorrect password");
        isPass = false;
      }
      else{
        console.log("Access granted");
        userName = user;
        isPass = true;
        currentData = doc.data;
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




function restaurantSearch(location){
    $.ajax({
        url: corsAnywhereLink+"https://api.yelp.com/v3/businesses/search?term=restaurants&location=" + location,
        method: "GET",
        headers: {
        Authorization : "Bearer TxSJ8z1klgIhuCb6UUsaQ35YjBgp7ZUMyktzsEeW3HdM3D7cu0qspdXjNBziwKIe_6WL5PjW7k1EF4rCL4DD-8cXPvU156T2feTri3g6jHMp3Aw4Xs3IFXAJ7o60WnYx"
        }
    }).then(function(response) {
        console.log(response);
        for (var i = 0; i < response.businesses.length; i++){
        var newRow = $("<div>").addClass("row restCard");
        newRow.attr("lat",response.businesses[i].coordinates.latitude);
        newRow.attr("long",response.businesses[i].coordinates.longitude);
        newRow.attr("locName",response.businesses[i].name);
        newRow.attr("imgUrl",response.businesses[i].image_url);
        var newDiv = $("<div>").addClass("col-md-8 infoCard");
        var imageDiv = $("<div>").addClass("col-md-4 imageCard");
        var placeImage = $("<img>").attr("src", response.businesses[i].image_url);
        var name = $("<p>").text(response.businesses[i].name).addClass("topInfo").attr("id", "titleName");
        var city = $("<p>").text(response.businesses[i].location.city);
        var address = $("<p>").text(response.businesses[i].location.address1);
        var price = $("<p>").text(response.businesses[i].price);
        var rating = $("<p>").text(response.businesses[i].rating);
        $(newRow).on("click",function(){
          //we'll push to the end of the trip of the current day
          let currentTrip = trip[currentDay-1];
          currentTrip.splice(currentTrip.length-1,0,{
            lat: $(this).attr("lat"),
            long: $(this).attr("long"),
            loc: $(this).attr("locName")});
          calcRoute(latLongParser(currentTrip,travelMethod));
          setTimeout(iteBoxRender,500);
        });
        $(imageDiv).append(placeImage);
        $(newDiv).append(name);
        $(newDiv).append(city);
        $(newDiv).append(address);
        $(newDiv).append(price);
        $(newDiv).append(rating);
        $(newRow).append(imageDiv);
        $(newRow).append(newDiv);
        $("#place").append(newRow);
        }


    })
}

function attractionSearch(location){
    $.ajax({
        url: corsAnywhereLink+"https://api.yelp.com/v3/businesses/search?term=attractions&location=" + location,
        method: "GET",
        headers: {
        Authorization : "Bearer TxSJ8z1klgIhuCb6UUsaQ35YjBgp7ZUMyktzsEeW3HdM3D7cu0qspdXjNBziwKIe_6WL5PjW7k1EF4rCL4DD-8cXPvU156T2feTri3g6jHMp3Aw4Xs3IFXAJ7o60WnYx"
        }
    }).then(function(response) {
        console.log(response);
        for (var i = 0; i < response.businesses.length; i++){
          var newRow = $("<div>").addClass("row attrCard");
          newRow.attr("lat",response.businesses[i].coordinates.latitude);
          newRow.attr("long",response.businesses[i].coordinates.longitude);
          newRow.attr("locName",response.businesses[i].name);
          newRow.attr("imgUrl",response.businesses[i].image_url);
          var newDiv = $("<div>").addClass("col-md-8 infoCard");
          var imageDiv = $("<div>").addClass("col-md-4");
          var placeImage = $("<img>").attr("src", response.businesses[i].image_url);
          var name = $("<p>").text(response.businesses[i].name).addClass("topInfo").attr("id", "titleName");;
          var city = $("<p>").text(response.businesses[i].location.city);
          var address = $("<p>").text(response.businesses[i].location.address1);
          var price = $("<p>").text(response.businesses[i].price);
          var rating = $("<p>").text(response.businesses[i].rating);
          $(newRow).on("click",function(){
            //we'll push to the end of the trip of the current day
            let currentTrip = trip[currentDay-1];
            currentTrip.splice(currentTrip.length-1,0,{
              lat: $(this).attr("lat"),
              long: $(this).attr("long"),
              loc: $(this).attr("locName")});
            calcRoute(latLongParser(currentTrip,travelMethod));
            setTimeout(iteBoxRender,500);
          });
          $(imageDiv).append(placeImage);
          $(newDiv).append(name);
          $(newDiv).append(city);
          $(newDiv).append(address);
          $(newDiv).append(price);
          $(newDiv).append(rating);
          $(newRow).append(imageDiv);
          $(newRow).append(newDiv);
          $("#attraction").append(newRow);
        }


    })
}
$("#submitBtn").on("click", function(event) {

    event.preventDefault();

    var inputDestination = $("#destinationInput").val().trim();
    if(inputDestination !== ""){
      $("#containerOne").hide();
      $("#containerTwo").show();
      restaurantSearch(inputDestination);
      attractionSearch(inputDestination);
    }
    else{
      console.log("You didn't input a location!");
    }
  });
