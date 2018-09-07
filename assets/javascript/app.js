function initMap(){
  directionService = new google.maps.DirectionsService();
  directionDisplay = new google.maps.DirectionsRenderer();
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 34.05223, lng: -118.243683},
          zoom: 10
        });
  directionDisplay.setMap(map);
}

function calcRoute(startPoint,endPoint){
  let request = {
    origin: startPoint,
    destination: endPoint,
    travelMode: "DRIVING"
  };
  directionService.route(request, function(response, status){
    if (status === "OK"){
      directionDisplay.setDirections(response);
    }
  });
}

let a = "34.05223,-118.243683";
let b = "34.142509,-118.255074";
$("#test").on("click",function(){
  calcRoute(a,b);
});
