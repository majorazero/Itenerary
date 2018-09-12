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

 directionDisplay.setMap(map);
}
 /////////////////////////////////////////////
 ///// Event Functions
 /////////////////////////////////////////////
 /**
 * Deals with front page transition.
 */
 $("#submitBtn").on("click", function(event) {
     event.preventDefault();
     var inputDestination = $("#destinationInput").val().trim();
     dayStaying = dayOutputter($("#startDateInput").val(),$("#endDateInput").val());
     if(dayStaying <= 0){
       $("#errorModalMess").text("You can't go back in time.");
       $("#submitErrorPrompt").modal("show");
     }
     else if (dayStaying === "badInput"){
       $("#errorModalMess").text("Gotta fill in those dates!");
       $("#submitErrorPrompt").modal("show");
     }
     else{
       if(inputDestination !== ""){
         $("#containerOne").hide();
         $("#containerTwo").show();
         myHotel(inputDestination);
       }
       else{
         console.log("You didn't input a location!");
         $("#errorModalMess").text("You didn't input a location!");
         $("#submitErrorPrompt").modal("show");
       }
     }
 });
/**
* Handles login events.
*/
$("#login").on("submit",function(event){
  event.preventDefault();
  userName = $(this)[0][0].value;
  passWord = $(this)[0][1].value;
  loadUserData(userName,passWord,"login");
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
    loadUserData(userName,passWord,"save");
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
    yelpSearch(trip[0][0].lat+","+trip[0][0].long,"restaurants");
    yelpSearch(trip[0][0].lat+","+trip[0][0].long,"attractions");
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
    yelpSearch(trip[0][0].lat+","+trip[0][0].long,"restaurants");
    yelpSearch(trip[0][0].lat+","+trip[0][0].long,"attractions");
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
});
/**
* This triggers route optimization.
*/
$("#optiTest").on("click",function(){
  calcRoute(latLongParser(trip[currentDay-1]),travelMethod,true);
});
/**
* Load more restaurants
*/
$("#restNext").on("click",function(){
  restOffset += 20;
  yelpSearch(trip[0][0].lat+","+trip[0][0].long,"restaurants",restOffset);
});
/**
* Load previous restaurants
*/
$("#restBack").on("click",function(){
  if(restOffset !== 0){
    restOffset -= 20;
    yelpSearch(trip[0][0].lat+","+trip[0][0].long,"restaurants",restOffset);
  }
});
/**
* Load more attractions
*/
$("#attrNext").on("click",function(){
  attrOffset += 20;
  yelpSearch(trip[0][0].lat+","+trip[0][0].long,"attractions",attrOffset);
});
/**
* Load previous attractions
*/
$("#attrBack").on("click",function(){
  if(attrOffset !== 0){
    attrOffset -= 20;
    yelpSearch(trip[0][0].lat+","+trip[0][0].long,"attractions",attrOffset);
  }
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
      iteDiv.attr("loc",currentDayIte[i].loc.replace(/\s+/g, ''));
      $(iteDiv).append("<h2>"+currentDayIte[i].loc+"</h2>");
      iteDiv.attr("data-pos",i);
      if(i === 0 || i === currentDayIte.length-1){
        iteDiv.attr("id","homeBase");
      }
      // else {
      //   iteDiv.attr("id",idNormalize(currentDayIte[i].loc.replace(/\s+/g, '')));
      // }
      //first and last element should not be able to be move so we won't add an edit button for them
      if (i !== 0 && i !== currentDayIte.length-1){
        $(iteDiv).append("<img class='iteImg' src='"+currentDayIte[i].img+"' />");
        let deleteButton = $("<button>").text("Delete").attr("id", "itButton");
        deleteButton.on("click",function(){
          //removes data from trip
          currentDayIte.splice($(this).parent().attr("data-pos"),1);
          //lets check if it still exists
          let counter = 0;
          for(let i = 0; i<currentDayIte.length; i++){
            if(trip[currentDay-1][i].loc.replace(/\s+/g, '') === $(this).parent().attr("loc")){
              counter++;
            }
          }
          if(counter === 0){
            $("#"+idNormalize($(this).parent().attr("loc"))).animate({backgroundColor: "#63a3ca"},500);
          }
          //visually remove this from the parent
          $(this).parent().remove();
          //update route
          calcRoute(latLongParser(currentDayIte),travelMethod);
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
          }
        });
        $(iteDiv).append(deleteButton);
        $(iteDiv).append(moveUp);
        $(iteDiv).append(moveDown);
      }
      $("#iteContent").append(iteDiv);
      if(i !== currentDayIte.length-1 && dayJourney !== undefined){
        let journeyDiv = $("<div>").addClass("journeyBlock");
        $(journeyDiv).append("Distance: "+dayJourney[i].distance+"  ");
        $(journeyDiv).append("Duration: "+dayJourney[i].duration);
        $("#iteContent").append(journeyDiv);
      }
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
      if(efficientTravel === true){
        optimizeTrip(response.routes[0].waypoint_order);
      }
      marker = new google.maps.Marker({
            position: {lat: parseFloat(trip[currentDay-1][0].lat),lng: parseFloat(trip[currentDay-1][0].long)},
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              strokeColor: "red"
            },
            map: map
      });
      directionDisplay.setDirections(response);
    }
    iteBoxRender();
  });
}
/**
* This rearranges the trip array based on optimized route.
* @param {Array} newWp - An array of the newly oranged index order generated by Google Routes
*/
function optimizeTrip(newWp){
  let newTrip = [];
  for(let j = 0; j < newWp.length; j++){
    newTrip.push(trip[currentDay-1][newWp[j]+1]);
  }
  trip[currentDay-1].splice(1,newTrip.length,...newTrip);
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
function loadUserData(user, pass, type){
  firestore.collection("user").where("name","==",user).get().then(function(response){
    if(response.docs.length > 0) {
      let doc = response.docs[0].data();
      if(pass !== doc.password){
        console.log("Incorrect password");
        isPass = false;
        if(type === "login"){
          $("#loadPrompt").effect("shake");
        }
        else if (type == "save"){
            $("#savePrompt").effect("shake");
        }
        $(".passInput").val("");
      }
      else{
        console.log("Access granted");
        userName = user;
        isPass = true;
        currentData = doc.data;
        if(type === "login"){
          login();
        }
        else if(type === "save"){
          save();
        }
      }
    }
    else{
      console.log("User does not exist.");
      save();
    }
  });
}
/**
* Handles login event.
*/
function login(){
  if(isPass === true){
    $("#wrongPass").hide();
    $("#login").hide();
    let tripObj = JSON.parse(currentData);
    for(let i = 0; i < tripObj.length; i++){
      let tripSelectDiv = $("<div>").addClass("tripButtons");
      let button = $("<button>").text(tripObj[i].tripName).addClass("btn btn-primary");
      $(button).on("click",function(){
        let tripObj = JSON.parse(currentData);
        for(let i = 0; i < tripObj.length; i++){
          if($(this).text() === tripObj[i].tripName){
            trip = tripObj[i].trip;
            tripName = tripObj[i].tripName;
            yelpSearch(trip[0][0].lat+","+trip[0][0].long,"restaurants");
            yelpSearch(trip[0][0].lat+","+trip[0][0].long,"attractions");
            calcRoute(latLongParser(trip[currentDay-1]),travelMethod);
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
}
/**
* Handles save event.
*/
function save(){
  let tripObj;
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
    console.log(tripObj);
    saveUserData(userName,passWord,JSON.stringify(tripObj));
  }
  else if (newUser === true){
    if(tripName !== ""){
      $("#savePrompt").modal("hide");
      tripObj = [{
        tripName: tripName,
        trip: trip
      }];
      saveUserData(userName,passWord,JSON.stringify(tripObj));
    }
    else {
      $("#savePrompt").effect("shake");
      $("#tripError").show();
    }
  }
  else {
    //$("#savePrompt").effect("shake");
    $("#wrongPass2").show();
  }
}
/**
* This searches restaurants or attractions based on the term and appends the elements to their sections
* @param {String} location - It's a string of either a coordinate or address that Yelp's API will interpret
* @param {String} term - This is what we're looking for, either "restaurants" or "attractions"
* @param {Integer} offset - This is how we load new content by offsetting the Yelp query
*/
function yelpSearch(location,term,offset){
    if(term === "restaurants"){
      $("#place").empty();
      $("#place").append('<img class="mx-auto img-fluid" src="assets/images/loading.gif" />');

    }
    else {
      $("#attraction").empty();
      $("#attraction").append('<img class="mx-auto img-fluid" src="assets/images/loading.gif" />');
    }
    let url = corsAnywhereLink+"https://api.yelp.com/v3/businesses/search?term="+term+"&location="+location;
    if(offset !== undefined){
      url += "&offset="+offset;
    }
    $.ajax({
        url: url,
        method: "GET",
        headers: {
        Authorization : "Bearer TxSJ8z1klgIhuCb6UUsaQ35YjBgp7ZUMyktzsEeW3HdM3D7cu0qspdXjNBziwKIe_6WL5PjW7k1EF4rCL4DD-8cXPvU156T2feTri3g6jHMp3Aw4Xs3IFXAJ7o60WnYx"
        }
    }).then(function(response) {
      if(term === "restaurants"){
        $("#place").empty();
      }
      else {
        $("#attraction").empty();
      }
      if(response.businesses.length !== 0){
        for (var i = 0; i < response.businesses.length; i++){
          var newRow = $("<div>").addClass("row");
          if(term === "restaurants"){
            newRow.addClass("restCard");
          }
          else if (term === "attractions"){
            newRow.addClass("attrCard")
          }
          for(let j = 0; j < trip[currentDay-1].length; j++){
            if(trip[currentDay-1][j].loc === response.businesses[i].name){
              newRow.css("background-color","#ffa9ac");
            }
          }
          newRow.attr("lat",response.businesses[i].coordinates.latitude);
          newRow.attr("long",response.businesses[i].coordinates.longitude);
          newRow.attr("loc",response.businesses[i].name);
          newRow.attr("id",idNormalize(response.businesses[i].name.replace(/\s+/g, '')));
          //need to normalize idNames
          newRow.attr("imgUrl",response.businesses[i].image_url);
          var newDiv = $("<div>").addClass("col-md-8 col-sm-8 col-8 infoCard");
          var imageDiv = $("<div>").addClass("col-md-4 col-sm-4 col-4 imageCard");
          var placeImage = $("<img>").attr("src", response.businesses[i].image_url).addClass("pImg");
          var name = $("<p>").text(response.businesses[i].name).addClass("topInfo").attr("id", "titleName");
          var city = $("<p>").text(response.businesses[i].location.city);
          var address = $("<p>").text(response.businesses[i].location.address1);
          var price = $("<p>").text(response.businesses[i].price);
          var rating = $("<img>").attr("src",yelpStar(response.businesses[i].rating));
          $(newRow).on("click",function(){
            $(this).animate({backgroundColor: "#ffa9ac"},500);
            let currentTrip = trip[currentDay-1];
            currentTrip.splice(currentTrip.length-1,0,{
              lat: $(this).attr("lat"),
              long: $(this).attr("long"),
              loc: $(this).attr("loc"),
              id: $(this).attr("id"),
              img: $(this).attr("imgUrl")});
            calcRoute(latLongParser(currentTrip),travelMethod);
          });
          $(imageDiv).append(placeImage);
          $(newDiv).append(name);
          $(newDiv).append(city);
          $(newDiv).append(address);
          $(newDiv).append(price);
          $(newDiv).append(rating);
          $(newRow).append(imageDiv);
          $(newRow).append(newDiv);
          if(term === "restaurants"){
            $("#place").append(newRow);
          }
          else if (term === "attractions"){
            $("#attraction").append(newRow);
          }
        }
      }
      else {
        if(term === "restaurants"){
          $("#place").append("<img class='outGif' src='assets/images/out.gif' />");
          $("#place").append("<h2 class='text-center'>No more Restaurants!</h2>");
        }
        else if (term === "attractions"){
          $("#attraction").append("<img class='outGif' src='assets/images/out.gif' />");
          $("#attraction").append("<h2 class='text-center'>No more Attractions!</h2>");
        }
      }
    });
}
/**
* Generates a list of hotels based on destination input that can be picked from and sets the initial trip
* @param {String} location - A string of a location that Yelp API will interpret
*/
function myHotel(location) {
    $.ajax({
    "url": corsAnywhereLink+"https://api.yelp.com/v3/businesses/search?term=hotels&limit=4&location= " + location,
    "method": "GET",
    "headers": {
      "Authorization": "Bearer DnFZKNqaKHmAOQ2-KzI-F0wsEHmH1HrT-k7U7IILrqGNlqL0J3nz1EM5KaSOu3o6ljzjy8UUPRyAifAu5_yM38LMc3oIUizj_Tp6rNVK0LakJK850r8lAtViWXWRW3Yx",
    }
  }).then(function(response,status) {
      console.log(status);
      $("#insert").empty();
      for (var i = 0; i < response.businesses.length; i++) {
        var hotelRow = $("<div>").addClass("row hotelRow");
        hotelRow.attr("lat",response.businesses[i].coordinates.latitude);
        hotelRow.attr("long",response.businesses[i].coordinates.longitude);
        hotelRow.on("click",function(){
          tripInit(dayStaying,$(this).attr("long"),$(this).attr("lat"));
          yelpSearch($(this).attr("lat")+","+$(this).attr("long"),"restaurants");
          yelpSearch($(this).attr("lat")+","+$(this).attr("long"),"attractions");
          $("#containerOne").hide();
          $("#containerTwo").hide();
          $("#containerThree").show();
        });
        var hotelDiv = $("<div>").addClass("col-sm-9 col-9");
        var hotelImage =$("<div>").addClass("col-sm-3 col-3 hotelImage");
        var hotelPic =$("<img>").attr("src", response.businesses[i].image_url).attr("id", "hotelPic");
        var hotelName = $("<p>").text("Hotel Name : " +  response.businesses[i].name).attr("id", "topName");
        var hotelRating = $("<p>").html("Rating: <img class='hotelStar' src='"+ yelpStar(response.businesses[i].rating)+"' />");
        if(response.businesses[i].price !== undefined){
          var hotelPrice = $("<p>").text("Price : " + response.businesses[i].price);
        }
        else {
          var hotelPrice = $("<p>").text("Price : Sorry! No info!");
        }
        var hotelPhone = $("<p>").text("Phone Number : " + response.businesses[i].display_phone);
        var hotelCoordinates = $("<p>").text("Lat and Long :" + response.businesses[i].coordinates);
        $(hotelDiv).append(hotelName);
        $(hotelDiv).append(hotelRating);
        $(hotelDiv).append(hotelPrice);
        $(hotelDiv).append(hotelPhone);
        $(hotelImage).append(hotelPic);
        $(hotelRow).append(hotelDiv);
        $(hotelRow).append(hotelImage);
        $("#insert").append(hotelRow);
      }

  }).catch(function(error){
      $("#submitErrorPrompt").modal("show");
      $("#errorModalMess").empty();
      $("#errorModalMess").append("<div>Guess we don't know where that is! Try some place else?</div>");
      let backButton = $("<button>").text("Go back?");
      backButton.on("click",function(){
        $("#containerOne").show();
        $("#containerTwo").hide();
        $("#submitErrorPrompt").modal("hide");
      });
      $("#errorModalMess").append(backButton);
    }
  );
}
/**
* Initialize the trip for new users.
* @param {Integer} dayStaying - The length of user's trip.
* @param {String} long - A string of the longitude of initial location.
* @param {String} lat - A string of the latitude of initial location.
*/
function tripInit(dayStaying,long,lat){
  //let's create our trip with length of day Staying
  trip = new Array(dayStaying);
  for(let i = 0; i < trip.length; i++){
    //each day of the trip should have 2 locations (home) popped in
    let baseLoc = {
      lat: lat,
      long: long,
      loc: "Home"
    };
    trip[i] = [];
    trip[i].push(baseLoc);
    trip[i].push(baseLoc);
  }
  calcRoute(latLongParser(trip[currentDay-1]),travelMethod);
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
/**
* Interprets the date inputs and return's the difference in days
* @param {String} startTime - String input of the start date.
* @param {String} endTime - String input of the end date.
*/
function dayOutputter(startTime,endTime){
  if(startTime !== "" && endTime !== ""){
    let startDate = new Date(startTime);
    let endDate = new Date(endTime);
    let timeDiff = endDate.getTime()-startDate.getTime();
    let dayDiff = Math.ceil(timeDiff/(1000*3600*24));
    return dayDiff;
  }
  else{
    return "badInput";
  }
}
/**
* This will return a img path based on the a rating between 1-5, with increments of .5
* @param {String} rating - The rating of the yelp review.
*/
function yelpStar(rating){
  return "assets/images/small_"+rating+".png";
}
/**
* Normalizes wierd charcters into "-" because jQuery
* @param {String} name - the string that's going to have their special characters removed.
*/
function idNormalize(name){
  let newName = "";
  for(let i = 0; i <name.length; i++){
    if(name[i] === "&" || name[i] === "'"){
      newName += "-";
    }
    else{
      newName += name[i];
    }
  }
  return newName;
}
/////////////////////////////////////////////
///// Testing Junk
/////////////////////////////////////////////

//each array is the itenerary for the day.
//this is mock data
// trip = [
//   [{lat: "34.136379", long: "-118.243752", loc: "Home"},{lat: "34.142979",long:"-118.255388", loc: "Point A"},{lat: "34.141133",long:"-118.224108", loc: "Point B"},{lat: "34.143721",long:"-118.256334", loc: "Point C"},{lat: "34.136379", long: "-118.243752", loc: "Home"}],
//   [{lat: "34.136379", long: "-118.243752", loc: "Home"},{lat: "34.142979",long:"-118.255388", loc: "Point A"},{lat: "34.136379", long: "-118.243752", loc: "Home"}],
//   [{lat: "34.136379", long: "-118.243752", loc: "Home"},{lat: "34.142979",long:"-118.255388", loc: "Point A"},{lat: "34.136379", long: "-118.243752", loc: "Home"}]
