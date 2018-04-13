/**
 * Created by Gabriela on 07.04.2018.
 */
var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();


fs.readFile('../TERC_Urzedowy.xml', function (err, data) {

    parser.parseString(data, function (err, result) {
        if (err) {
            console.log("ERROR: " + err);
            return;
        }
        console.dir(JSON.stringify(result));
        console.log('Read finished');
        showVoiev(result);

    });

});


var showVoiev = function (result) {
    try {
        result.teryt.catalog[0].row.forEach(function (item) {
            if (item.POW == "" && item.GMI == "")
                console.log(item.NAZWA + "; type: " + item.NAZWA_DOD);
        });


    } catch (err) {
        console.log("showVoidError: " + err);

    }
};