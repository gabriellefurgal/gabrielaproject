var map;
var infowindow;

function initMap() {
    var pyrmont = {lat: -33.867, lng: 151.195};
    var my_place="Krzywizna"
    var geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 12
    });
    //added
    geocoder.geocode({'address': my_place}, function(results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
    //end of added
    // infowindow = new google.maps.InfoWindow();
    // var service = new google.maps.places.PlacesService(map);
    // service.nearbySearch({
    //     location: pyrmont,
    //     radius: 500,
    //     type: ['store']
    // }, callback);


}

// function callback(results, status) {
//     if (status === google.maps.places.PlacesServiceStatus.OK) {
//         for (var i = 0; i < results.length; i++) {
//             createMarker(results[i]);
//         }
//     }
// }

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}