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
  //needed to update map
  directionDisplay.setMap(map);
}
/**
* The route will accept an array
*/
function calcRoute(routArr, method){
  //we need to process the array given to us...
  let startPoint;
  let endPoint;
  let waypts = [];
  let tMethod = "DRIVING";
  for(let i =0; i < routArr.length; i++){
    //if the index is the first item, it becomes the startPoint
    if(i === 0){
      startPoint = routArr[i];
    }
    //if the index is the last item it bcomes the endPoint
    else if (i === routArr.length-1){
      endPoint = routArr[i];
    }
    //for all other cases well push it into "waypoints" as a location in a waypoints object
    else{
      waypts.push({location: routArr[i]});
    }
  }
  if(method === "WALKING"){
    tMethod = method;
  }
  //we'll define our request here.
  let request = {
    origin: startPoint,
    destination: endPoint,
    waypoints: waypts,
    travelMode: tMethod
  };
  directionService.route(request, function(response, status){
    if (status === "OK"){
      console.log(response);
      console.log(response.routes[0].legs[0].distance.text);
        console.log(response.routes[0].legs[0].duration.text);
      directionDisplay.setDirections(response);
    }
  });
}

let destinArr = ["34.05223,-118.243683","34.153351,-118.165794","34.142509,-118.255074"];
$("#test").on("click",function(){
  calcRoute(destinArr,"WALKING");
});
