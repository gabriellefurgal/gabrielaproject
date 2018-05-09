/**
 * Created by Gabriela on 14.04.2018.
 */
var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');



router.post('/searchForm', function (req, res) {
    var s = req.body.searchValue;
    // var query = "SELECT * ,l.[to] as presentName FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename WHERE p.name= '" + s + "';";
    var query = "SELECT * ,l.[to] as presentName, p.id as ID FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename WHERE dbo.noPolishSigns(p.name)= [dbo].[noPolishSigns]('" + s + "') OR [dbo].[noPolishSigns](l.[to])= [dbo].[noPolishSigns]('" + s + "');";
    databases.functionDB(query, function (recordsset) {
            if (recordsset.recordset.length == 0) {
                var gueryFile = "SELECT fileName FROM [SilesiaMgrDB].[dbo].[scanPages] WHERE placeDictionaryName LIKE '%" + s + "%' ";
                databases.sendRequestToApplicationDB(gueryFile, function (ScanfileName) {
                    if (ScanfileName.recordset.length != 0) {
                        res.render('index', {
                            title: "Application",
                            place: {
                                recordset: [{
                                    name: s,
                                    foreignname: 'NO DATA',
                                    description: 'NO DATA',
                                    presentName: 'NO DATA'
                                }]
                            },
                            placeGUS: {
                                recordset: [{
                                    voivodeship: 'NO DATA',
                                    country: 'NO DATA',
                                    community: 'NO DATA'
                                }]
                            },
                            scanFile: ScanfileName
                        });
                    } else {
                        console.log('Sorry but we could not found ' + s);
//TO DO: napisz tutaj jakis komunikat
                    }
                });

            } else {
                var country = recordsset.recordset[0].powiat.slice(0, -1);
                var query2 = "SELECT voiv.name as 'voivodeship', coun.name as 'country', comm.name as 'community' FROM [silesiaApplicationDataBase].[dbo].communities as comm INNER JOIN voivodeships as voiv ON voiv.voivodeshipID =comm.voivodeshipID INNER JOIN countries as coun ON coun.countryID=comm.countryID WHERE (comm.name='" + recordsset.recordset[0].gmina + "' and coun.name LIKE '" + country + "%') ";
                databases.GUSfunctionDB(query2, function (records) {
                    var guery3 = "SELECT * FROM [Silesia].[dbo].[PlaceReferences] WHERE place_id =" + recordsset.recordset[0].ID + "";
                    var references = [];
                    databases.functionDB(guery3, function (referencesRecords) {
                        if (referencesRecords.recordset.length != 0) {
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
                        var guery4 = "SELECT fileName FROM [SilesiaMgrDB].[dbo].[scanPages] WHERE placeDictionaryName LIKE '%" + recordsset.recordset[0].name + "%'";
                        databases.sendRequestToApplicationDB(guery4, function (ScanfileName) {
                            if (ScanfileName.recordset.length != 0 && recordsset.recordset.length != 0 && records.recordset.length != 0) {
                                res.render('index', {
                                    title: "Application",
                                    place: recordsset,
                                    placeGUS: records,
                                    references: references,
                                    scanFile: ScanfileName,
                                    success: req.session.success,
                                    errors: req.session.errors,
                                    resource: req.query.resource
                                });
                            } else if (records.recordset.length != 0 && ScanfileName.recordset.length == 0 && recordsset.recordset.length != 0) {
                                res.render('index', {
                                    title: "Application",
                                    place: recordsset,
                                    placeGUS: records,
                                    references: references,
                                    scanFile: {recordset: [{fileName: "NoDataFound"}]},
                                    success: req.session.success,
                                    errors: req.session.errors,
                                    resource: req.query.resource
                                });
                            }
                            else if (records.recordset.length == 0 && ScanfileName.recordset.length != 0 && recordsset.recordset.length != 0) {
                                res.render('index', {
                                    title: "Application",
                                    place: recordsset,
                                    references: references,
                                    placeGUS: {
                                        recordset: [{
                                            voivodeship: 'NO DATA',
                                            country: 'NO DATA',
                                            community: 'NO DATA'
                                        }]
                                    },
                                    scanFile: ScanfileName,
                                    success: req.session.success,
                                    errors: req.session.errors,
                                    resource: req.query.resource
                                });
                            }
                            else if (records.recordset.length == 0 && ScanfileName.recordset.length == 0 && recordsset.recordset.length != 0) {
                                res.render('index', {
                                    title: "Application",
                                    place: recordsset,
                                    placeGUS: {
                                        recordset: [{
                                            voivodeship: 'NO DATA',
                                            country: 'NO DATA',
                                            community: 'NO DATA'
                                        }]
                                    },
                                    references: references,
                                    scanFile: {recordset: [{fileName: "NoDataFound"}]},
                                    success: req.session.success,
                                    errors: req.session.errors,
                                    resource: req.query.resource
                                });
                            }
                            else {
                                res.render('index', {
                                    title: "Application",
                                    place: {
                                        recordset: [{
                                            name: s,
                                            foreignname: 'NO DATA',
                                            description: 'NO DATA',
                                            presentName: 'NO DATA'
                                        }]
                                    },
                                    placeGUS: {
                                        recordset: [{
                                            voivodeship: 'NO DATA',
                                            country: 'NO DATA',
                                            community: 'NO DATA'
                                        }]
                                    },
                                    references: {
                                        reference: [{
                                            name: '',
                                            year: '',
                                            source: '',
                                            page: ''
                                        }]
                                    },
                                    scanFile: {recordset: [{fileName: "NoDataFound"}]},
                                    success: req.session.success,
                                    errors: req.session.errors,
                                    resource: req.query.resource
                                });

                            }


                        });
                    });

                });
            }

        }
    );

});

module.exports = router;