var map;
var infowindow;

function initMap() {
    var pyrmont = {lat: -33.867, lng: 151.195};
    var my_place = document.getElementById('placeName').textContent.toLowerCase();
   var my_placePresent = document.getElementById('placePresentName').textContent.toLowerCase();
    var voivodeship = document.getElementById('placeVoivodeship').textContent.toLowerCase();
    var country = document.getElementById('placeCountry').textContent.toLowerCase();
    var community = document.getElementById('placeCommunity').textContent.toLowerCase();
    if (my_placePresent === "") {
        my_placePresent = my_place;
        console.log("heeej this is");
    }

    var geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 12
    });
    //added
    geocoder.geocode({'address': my_placePresent+', '+country +', ' + voivodeship,'region': voivodeship}, function (results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        } else {
            geocoder.geocode({'address': my_placePresent}, function (results, status) {
                if (status === 'OK') {
                    map.setCenter(results[0].geometry.location);
                    for (var i = 0; i < results.length; i++) {
                        createMarker(results[i]);
                    }
                } else {
                    geocoder.geocode({'address': community+', '+country +', ' + voivodeship}, function (results, status) {
                        if (status === 'OK') {
                            map.setCenter(results[0].geometry.location);
                            for (var i = 0; i < results.length; i++) {
                                createMarker(results[i])
                            }
                        } else {
                            geocoder.geocode({'address': country+', ' + voivodeship}, function (results, status) {
                                if (status === 'OK') {
                                    map.setCenter(results[0].geometry.location);
                                    for (var i = 0; i < results.length; i++) {
                                        createMarker(results[i]);
                                    }

                                }else {
                                    geocoder.geocode({'address': voivodeship}, function (results, status) {
                                        if (status === 'OK') {
                                            map.setCenter(results[0].geometry.location);
                                            for (var i = 0; i < results.length; i++) {
                                                createMarker(results[i]);
                                            }

                                        } else {
                                            alert('Geocode was not successful for the following reason: ' + status);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
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
    var lat = Math.round(place.geometry.location.lat() * 10000) / 10000;
    var lng = Math.round(place.geometry.location.lng() * 10000) / 10000;
    document.getElementById('locationLat').innerHTML= lat ;
    document.getElementById('locationLng').innerHTML= lng;
    document.getElementById('coordinatesLat').value= lat ;
    document.getElementById('coordinatesLng').value= lng;
       google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}
