
var databases = require('mssql');


//TODO zmien querry i baze danych!! w obu funkcjach
    addNewRecordVersion = function (recordVersion, f) {
        var query = "INSERT INTO [dbo].[applicationPlaces]([versionId],[dicName],[terytName],[type],[dicCountry],[terytCountry],[dicVoivoedship],[terytVoivodeship],[dicCommunity],[terytCommunity],[foreignName],[shortDescription],[description],[dicReferences],[coordinatesLatitude],[coordinatesLongitude]) VALUES('" + recordVersion.versionId + "', '" + recordVersion.dicName + "', '" + recordVersion.terytName + "', '" + recordVersion.type + "', '" + recordVersion.dicCountry + "', '" + recordVersion.terytCountry + "', '" + recordVersion.dicVoivoedship + "', '" + recordVersion.terytVoivodeship + "', '" + recordVersion.dicCommunity + "', '" + recordVersion.terytCommunity + "', '" + recordVersion.foreignName + "', '" + recordVersion.shortDescription + "', '" + recordVersion.description + "', '" + recordVersion.dicReferences + "', '" + recordVersion.coordinatesLatitude + "', '" + recordVersion.coordinatesLongitude + "')";
        databases.sendRequestToApplicationDB(query, function (err, result) {
            if (err) {
                console.log(err);
                f = err;
            }
        });

    };

    addNewVersion = function (newVersion, f) {
        var query = "INSERT INTO [dbo].[versions]([versionNumber],[userID],[date]) VALUES('" + newVersion.versionNumber + "', '" + newVersion.userID + "', '" + newVersion.date + "')";
        databases.sendRequestToApplicationDB(query, function (err, result) {
            if (err) {
                console.log(err);
                f = err;
            }
        });

    };

module.exports.addNewRecordVersion= addNewRecordVersion;
module.exports.addNewVersion= addNewVersion;