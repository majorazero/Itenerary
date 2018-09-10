$("#submitBtn").click(function(){

    $("#containerOne").hide();
    $("#containerTwo").show();

});

$("#submitButton").click(function(){

    $("#containerOne").hide();
    $("#containerTwo").hide();
    $("#containerThree").show();
});


var location;

function restaurantSearch(location){
    $.ajax({
        url: "http://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=restaurants&location=" + location,
        method: "GET",
        headers: {
        Authorization : "Bearer TxSJ8z1klgIhuCb6UUsaQ35YjBgp7ZUMyktzsEeW3HdM3D7cu0qspdXjNBziwKIe_6WL5PjW7k1EF4rCL4DD-8cXPvU156T2feTri3g6jHMp3Aw4Xs3IFXAJ7o60WnYx"
        }
    }).then(function(response) {
        console.log(response);
        for (var i = 0; i < response.businesses.length; i++){
        var newRow = $("<div>").addClass("row");
        var newDiv = $("<div>").addClass("col-md-8");
        var imageDiv = $("<div>").addClass("col-md-4");
        var placeImage = $("<img>").attr("src", response.businesses[i].image_url);
        var name = $("<p>").text(response.businesses[i].name).addClass("topInfo");
        var city = $("<p>").text(response.businesses[i].location.city);
        var address = $("<p>").text(response.businesses[i].location.address1);
        var price = $("<p>").text(response.businesses[i].price);
        var rating = $("<p>").text(response.businesses[i].rating);
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

var location;

function attractionSearch(location){
    $.ajax({
        url: "http://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=attractions&location=" + location,
        method: "GET",
        headers: {
        Authorization : "Bearer TxSJ8z1klgIhuCb6UUsaQ35YjBgp7ZUMyktzsEeW3HdM3D7cu0qspdXjNBziwKIe_6WL5PjW7k1EF4rCL4DD-8cXPvU156T2feTri3g6jHMp3Aw4Xs3IFXAJ7o60WnYx"
        }
    }).then(function(response) {
        console.log(response);
        for (var i = 0; i < response.businesses.length; i++){
        var newRow = $("<div>").addClass("row");
        var newDiv = $("<div>").addClass("col-md-8");
        var imageDiv = $("<div>").addClass("col-md-4");
        var placeImage = $("<img>").attr("src", response.businesses[i].image_url);
        var name = $("<p>").text(response.businesses[i].name).addClass("topInfo");
        var city = $("<p>").text(response.businesses[i].location.city);
        var address = $("<p>").text(response.businesses[i].location.address1);
        var price = $("<p>").text(response.businesses[i].price);
        var rating = $("<p>").text(response.businesses[i].rating);
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

    restaurantSearch(inputDestination);
    attractionSearch(inputDestination);
  });
