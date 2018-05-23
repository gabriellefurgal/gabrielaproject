
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCFv1oxqAeRo-fh1nCQzYZsg5SY_zhKCis'

});


googleMapsClient.geocode({
    address: '1600 Amphitheatre Parkway, Mountain View, CA'
}, function(err, response) {
    if (!err) {
        //console.log(response.json.results);
    }
    else{
        throw err;
        //console.log("google maps: "+response.json.results);
    }
})