/**
 * Created by Gabriela on 14.04.2018.
 */
var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');
var versions = require('../public/javascripts/versionalization');


router.get('/see', function (req, res, next) {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    var recordid = req.query.rid;
    var versionNumber = req.query.v;
    var sprVersions;
    if(versionNumber){
        sprVersions="SELECT * , t.dictionaryID as ID FROM [SilesiaMgrDB].[dbo].[applicationPlaces] as t INNER JOIN [SilesiaMgrDB].[dbo].[versions] as v ON v.versionID = t.versionId  WHERE v.versionNumber=" + versionNumber + " AND t.dictionaryID = " + recordid + ";";
    }else{
        sprVersions = "SELECT * , t.dictionaryID as ID FROM [SilesiaMgrDB].[dbo].[applicationPlaces] as t INNER JOIN (SELECT max([versionId])as maxVid,[dictionaryID] FROM [SilesiaMgrDB].[dbo].[applicationPlaces] GROUP BY [dictionaryID]) as vmax ON t.versionId = vmax.maxVid AND t.dictionaryID = vmax.dictionaryID WHERE t.dictionaryID =" + recordid + ";"

    }
    databases.sendRequestToApplicationDB(sprVersions, function (lastVersion) {
        if (lastVersion.recordset.length !== 0) {
            var getVersions=" SELECT  v.versionNumber as versionNumber FROM  [SilesiaMgrDB].[dbo].[versions] as v INNER JOIN [SilesiaMgrDB].[dbo].[applicationPlaces] as p ON v.versionID = p.versionId WHERE p.dictionaryID=" + recordid + ";"
            databases.sendRequestToApplicationDB(getVersions, function (versions) {

                var guery4 = "SELECT DISTINCT fileName FROM [SilesiaMgrDB].[dbo].[scanPages] WHERE placeDictionaryName LIKE '%" + lastVersion.recordset[0].dicName + "%'";
                databases.sendRequestToApplicationDB(guery4, function (ScanfileName) {
                    databases.getVoivodeships(function (administration) {
                        if (ScanfileName.recordset.length === 0) {
                            res.render('index', {
                                title: "Application",
                                place: {
                                    ID: lastVersion.recordset[0].ID,
                                    name: lastVersion.recordset[0].dicName,
                                    presentName: lastVersion.recordset[0].dicName,
                                    powiat: lastVersion.recordset[0].dicCountry,
                                    gmina: lastVersion.recordset[0].dicCommunity,
                                    wojewodztwo: lastVersion.recordset[0].dicVoivoedship,
                                    foreignname: lastVersion.recordset[0].foreignName,
                                    shortdescription: lastVersion.recordset[0].shortDescription,
                                    description: lastVersion.recordset[0].description,
                                    type: lastVersion.recordset[0].type
                                },

                                placeGUS: {
                                    voivodeship: lastVersion.recordset[0].terytVoivodeship,
                                        country: lastVersion.recordset[0].terytCountry,
                                        community: lastVersion.recordset[0].terytCommunity
                                },
                                referencesVersion: lastVersion.recordset[0].dicReferences,
                                references: false,
                                scanFile: {
                                    recordset: [{fileName: "NoDataFound"}]
                                },
                                success: req.session.success,
                                errors: req.session.errors,
                                resource: req.query.resource,
                                userSession: req.session.user,
                                cookies: req.cookies,
                                administration: administration,
                                versions: versions.recordset,
                                chosenElement: true
                            });
                        } else {
                            res.render('index', {
                                title: "Application",
                                place: {
                                    ID: lastVersion.recordset[0].ID,
                                    name: lastVersion.recordset[0].dicName,
                                    presentName: lastVersion.recordset[0].dicName,
                                    powiat: lastVersion.recordset[0].dicCountry,
                                    gmina: lastVersion.recordset[0].dicCommunity,
                                    wojewodztwo: lastVersion.recordset[0].dicVoivoedship,
                                    foreignname: lastVersion.recordset[0].foreignName,
                                    shortdescription: lastVersion.recordset[0].shortDescription,
                                    description: lastVersion.recordset[0].description,
                                    type: lastVersion.recordset[0].type,
                                },

                                placeGUS: {
                                    voivodeship: lastVersion.recordset[0].terytVoivodeship,
                                        country: lastVersion.recordset[0].terytCountry,
                                        community: lastVersion.recordset[0].terytCommunity
                                },
                                referencesVersion: lastVersion.recordset[0].dicReferences,
                                references: false,
                                scanFile: ScanfileName,
                                success: req.session.success,
                                errors: req.session.errors,
                                resource: req.query.resource,
                                userSession: req.session.user,
                                cookies: req.cookies,
                                administration: administration,
                                versions: versions.recordset,
                                chosenElement: true
                            });
                            res.end();
                        }

                        req.session.errors = null;
                    });
                });
            });

        } else {
            //po staremu
            var query = "SELECT * ,l.[to] as presentName, p.id as ID FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename WHERE p.id=" + recordid + ";";
            databases.functionDB(query, function (recordsset) {
                var country = recordsset.recordset[0].powiat.slice(0, -1);
                var query2 = "SELECT voiv.name as 'voivodeship', coun.name as 'country', comm.name as 'community' FROM [silesiaApplicationDataBase].[dbo].communities as comm INNER JOIN voivodeships as voiv ON voiv.voivodeshipID =comm.voivodeshipID INNER JOIN countries as coun ON coun.countryID=comm.countryID WHERE comm.name='" + recordsset.recordset[0].gmina + "' and coun.name LIKE '" + country + "%'";
                databases.GUSfunctionDB(query2, function (records) {
                    var guery3 = "SELECT * FROM [Silesia].[dbo].[PlaceReferences] WHERE place_id =" + recordsset.recordset[0].ID + "";
                    var references = [];
                    databases.functionDB(guery3, function (referencesRecords) {

                        if (referencesRecords.recordset.length !== 0) {
                            for (var i = 0; i < referencesRecords.recordset.length; i++) {
                                var reference = {
                                    'name': referencesRecords.recordset[i].name,
                                    'year': referencesRecords.recordset[i].year,
                                    'source': referencesRecords.recordset[i].source,
                                    'page': referencesRecords.recordset[i].page
                                }
                                references.push(reference);
                            }
                        }
                        var guery4 = "SELECT DISTINCT fileName FROM [SilesiaMgrDB].[dbo].[scanPages] WHERE placeDictionaryName LIKE '%" + recordsset.recordset[0].name + "%'";
                        databases.sendRequestToApplicationDB(guery4, function (ScanfileName) {
                            databases.getVoivodeships(function (administration) {
                                if (ScanfileName.recordset.length === 0) {
                                    res.render('index', {
                                        title: "Application",
                                        place: recordsset.recordset[0],
                                        placeGUS: {
                                        recordset: [{
                                            voivodeship: 'NoDATA',
                                            country: 'NoDATA',
                                            community: 'NoDATA'
                                        }]
                                    },
                                        references: references,
                                        scanFile: {
                                            recordset: [{fileName: "NoDataFound"}]
                                        },
                                        success: req.session.success,
                                        errors: req.session.errors,
                                        resource: req.query.resource,
                                        userSession: req.session.user,
                                        cookies: req.cookies,
                                        administration: administration,
                                        versions: false,
                                        chosenElement: true
                                    });
                                } else if (records.recordset.length === 0) {
                                    res.render('index', {
                                        title: "Application",
                                        place: recordsset.recordset[0],
                                        placeGUS: {
                                            recordset: [{
                                                voivodeship: 'NoDATA',
                                                country: 'NoDATA',
                                                community: 'NoDATA'
                                            }]
                                        },
                                        references: references,
                                        scanFile: ScanfileName,
                                        success: req.session.success,
                                        errors: req.session.errors,
                                        resource: req.query.resource,
                                        userSession: req.session.user,
                                        cookies: req.cookies,
                                        administration: administration,
                                        versions: false,
                                        chosenElement: true

                                    });
                                }
                                else {
                                    res.render('index', {
                                        title: "Application",
                                        place: recordsset.recordset[0],
                                        placeGUS: records.recordset[0],
                                        references: references,
                                        scanFile: ScanfileName,
                                        success: req.session.success,
                                        errors: req.session.errors,
                                        resource: req.query.resource,
                                        userSession: req.session.user,
                                        cookies: req.cookies,
                                        administration: administration,
                                        versions: false,
                                        chosenElement: true
                                    });
                                    res.end();
                                }

                                req.session.errors = null;
                            });

                        });
                    });
                });
            });
        }

    });

    console.log(req.session);
    console.log(req.cookies);
    next();
});




router.post('/saveChanges', function (req, res) {
    const dicName = req.body.placeName;
    const terytName = req.body.presentName;
    const terytCountry = req.body.countryPresent;
    const dicCountry = req.body.countryDic;
    const dicCommunity = req.body.communityDic;
    const terytCommunity = req.body.communityPresent;
    const dicVoivodesip = req.body.voivodeshipDic;
    const terytVoivodesip = req.body.voivodeshipPresent;
    const foreignName = req.body.foreignName;
    const shortDescription = req.body.shortDescription;
    const description = req.body.description;
    const references = req.body.references;
    const latitude = req.body.coordinatesLat;
    const longitude = req.body.coordinatesLng;
    const type = req.body.typeList;
    const dictionaryID = req.body.dictionaryID;

    console.log("!!!!!!!!!!!!!!!dictionaryID: " + req.body.dictionaryID + " userMail: " + req.session.user.Email);
    var newRecordVersion = {
        dicName: dicName,
        terytName: terytName,
        terytCountry: terytCountry,
        dicCountry: dicCountry,
        dicCommunity: dicCommunity,
        terytCommunity: terytCommunity,
        dicVoivodesip: dicVoivodesip,
        terytVoivodesip: terytVoivodesip,
        foreignName: foreignName,
        shortDescription: shortDescription,
        description: description,
        references: references,
        latitude: latitude,
        longitude: longitude,
        type: type,
        dictionaryID: dictionaryID
    }


    // function successCallback(result) {
    //     console.log("It succeeded with " + result);
    //     var newVersion = {
    //         versionNumber: result.version + 1,
    //         userID: req.session.user.userID,
    //         data: '23.05.2017'.toDate()
    //     }
    //
    //     addNewRecordVersion(newRecordVersion, function (err) {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         } else {
    //             addNewVersion(newVersion, function (err) {
    //                 if (err) {
    //                     console.log(err);
    //                     return;
    //                 }
    //             });
    //         }
    //     });
    // }
    //
    // function failureCallback(error) {
    //     req.check('email', "Email already exist").equals(req.body.email);
    //     var newVersion = {
    //         versionNumber: 1,
    //         userID: req.session.user.userID,
    //         data: '23.05.2017'.toDate()
    //     }
    //
    //     addNewRecordVersion(newRecordVersion, function (err) {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         } else {
    //             addNewVersion(newVersion, function (err) {
    //                 if (err) {
    //                     console.log(err);
    //                     return;
    //                 }
    //             });
    //         }
    //     });
    // }
    // findRecordByDicName(req.body.placeName).then(successCallback,failureCallback);
    var datetime = new Date();
    var newVersion = {
        userMail: req.session.user.Email,
        dateOfSave: datetime
    }
    //TODO do sprawdzenia czy juz istnieje jakas wersja tego miasta i czy sie różni?
    //no na pewno trzeba sprawdzic jaki jest number ostantiej wersji tego
    addNewRecordVersion = function (recordVersion, f) {
//        var query = "BEGIN TRANSACTION  DECLARE @DataID int;  INSERT INTO [dbo].[versions]([versionNumber],[userID],[date]) VALUES('" + newVersion.versionNumber + "', '" + newVersion.userID + "', '" + '2012-06-18 10:34:09' + "')SELECT @DataID = scope_identity(); INSERT INTO [dbo].[applicationPlaces]([versionId],[dicName],[terytName],[type],[dicCountry],[terytCountry],[dicVoivoedship],[terytVoivodeship],[dicCommunity],[terytCommunity],[foreignName],[shortDescription],[description],[dicReferences],[coordinatesLatitude],[coordinatesLongitude]) VALUES( @DataID , '" + recordVersion.dicName + "', '" + recordVersion.terytName + "', '" + recordVersion.type + "', '" + recordVersion.dicCountry + "', '" + recordVersion.terytCountry + "', '" + recordVersion.dicVoivoedship + "', '" + recordVersion.terytVoivodeship + "', '" + recordVersion.dicCommunity + "', '" + recordVersion.terytCommunity + "', '" + recordVersion.foreignName + "', '" + recordVersion.shortDescription + "', '" + recordVersion.description + "', '" + recordVersion.dicReferences + "', '" + recordVersion.coordinatesLatitude + "', '" + recordVersion.coordinatesLongitude + "');  ";
        var query = "BEGIN TRANSACTION  DECLARE @DataID int; DECLARE @version bigint; SET @version = (SELECT versionNumber FROM [SilesiaMgrDB].[dbo].[versions] WHERE versionID = (SELECT MAX(versionId)FROM [SilesiaMgrDB].[dbo].[applicationPlaces] WHERE [dictionaryID] = " + recordVersion.dictionaryID + ")); if (@version is NULL) begin SET @version = 1; end else begin SET @version = @version + 1; end  INSERT INTO [dbo].[versions]([versionNumber], [userID], [date]) VALUES( @version , (SELECT UserID FROM [SilesiaMgrDB].[dbo].[users] WHERE email= '" + newVersion.userMail + "'),  (CONVERT (date, GETDATE())) ); SELECT @DataID = scope_identity(); INSERT INTO [SilesiaMgrDB].[dbo].[applicationPlaces]([dictionaryID], [versionId], [dicName], [terytName], [type], [dicCountry], [terytCountry], [dicVoivoedship], [terytVoivodeship], [dicCommunity], [terytCommunity], [foreignName], [shortDescription], [description], [dicReferences], [coordinatesLatitude], [coordinatesLongitude]) VALUES( '" + recordVersion.dictionaryID + "', @DataID , '" + recordVersion.dicName + "', '" + recordVersion.terytName + "', '" + recordVersion.type + "', '" + recordVersion.dicCountry + "', '" + recordVersion.terytCountry + "', '" + recordVersion.dicVoivodesip + "', '" + recordVersion.terytVoivodesip + "', '" + recordVersion.dicCommunity + "', '" + recordVersion.terytCommunity + "', '" + recordVersion.foreignName + "', '" + recordVersion.shortDescription + "', '" + recordVersion.description + "', '" + recordVersion.references + "', '" + recordVersion.latitude + "', '" + recordVersion.longitude + "');  COMMIT TRANSACTION ;";

        databases.sendRequestToApplicationDB(query, function (err, result) {
            if (err) {
                console.log(err);
                f = err;
            }
        });

    };

    // addNewVersion = function (newVersion, f) {
    //     var query = "INSERT INTO [dbo].[versions]([versionNumber],[userID],[date]) VALUES('" + newVersion.versionNumber + "', '" + newVersion.userID + "', '" + '2012-06-18 10:34:09' + "')";
    //     databases.sendRequestToApplicationDB(query, function (err, result) {
    //         if (err) {
    //             console.log(err);
    //             f = err;
    //         }
    //     });
    //
    // };


    addNewRecordVersion(newRecordVersion, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        // else {
        //     addNewVersion(newVersion, function (err) {
        //         if (err) {
        //             console.log(err);
        //             return;
        //         }
        //     });
        // }
    });
    res.redirect('/see?rid='+newRecordVersion.dictionaryID+'');

});

module.exports = router;