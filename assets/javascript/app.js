$("#submitBtn").click(function(){

    $("#containerOne").hide();
    $("#containerTwo").show();

});

$("#submitButton").click(function(){

    $("#containerOne").hide();
    $("#containerTwo").hide();
    $("#containerThree").show();
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

//this is test code, will eventually be deleted.
let destinArr = ["34.05223,-118.243683","34.153351,-118.165794","34.136120,-117.865341","34.142509,-118.255074"];
$("#test").on("click",function(){
  calcRoute(destinArr,"WALKING",true);

});
