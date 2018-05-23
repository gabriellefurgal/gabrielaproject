var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');
var url = require('url');

/* GET home page. */
router.get('/home', function (req, res, next) {

    res.redirect("/");
});

//GET API
router.get("/", function (req, res) {
    var query = "SELECT * ,l.[to] as presentName, p.id as ID FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename WHERE p.id=48;";
    databases.functionDB(query, function (recordsset) {
        var country = recordsset.recordset[0].powiat.slice(0, -1);
        var query2 = "SELECT voiv.name as 'voivodeship', coun.name as 'country', comm.name as 'community' FROM [silesiaApplicationDataBase].[dbo].communities as comm INNER JOIN voivodeships as voiv ON voiv.voivodeshipID =comm.voivodeshipID INNER JOIN countries as coun ON coun.countryID=comm.countryID WHERE comm.name='" + recordsset.recordset[0].gmina + "' and coun.name LIKE '" + country + "%'";
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
                    if (ScanfileName.recordset.length == 0) {
                        res.render('index', {
                            title: "Application",
                            place: recordsset,
                            placeGUS: records,
                            references: references,
                            scanFile: {
                                recordset: [{fileName: "NoDataFound"}]
                            },
                            success: req.session.success,
                            errors: req.session.errors,
                            resource: req.query.resource
                        });
                    } else if (records.recordset.length == 0) {
                        res.render('index', {
                            title: "Application",
                            place: recordsset,
                            placeGUS: {
                                recordset: [{
                                    voivodeship: 'NoDATA',
                                    country: 'NoDATA',
                                    community: 'NoDATA'
                                }]
                            },
                            references: references,
                            scanFile: [{fileName: "page012.jpg"}],
                            success: req.session.success,
                            errors: req.session.errors,
                            resource: req.query.resource
                        });
                    }
                    else {
                        res.render('index', {
                            title: "Application",
                            place: recordsset,
                            placeGUS: records,
                            references: references,
                            scanFile: ScanfileName,
                            success: req.session.success,
                            errors: req.session.errors,
                            resource: req.query.resource,
                            userSession: req.session.user,
                            cookies: req.cookies
                        });

                    }

                    req.session.errors = null;
                });

            });
        });
    });

console.log(req.session);
console.log(req.cookies);
});

router.get("/logOut",function(req,res){
    req.session.errors = null;
    req.session.success = null;
    // req.session.user=null;
    req.session.destroy();
   res.clearCookie("userCookie");
    res.redirect("/");
});

//poczatek domyslnie do usuniecia

router.get("/gus", function (req, res) {
    var query = "SELECT voiv.name as 'voivodeship', coun.name as 'country', comm.name as 'community' FROM [silesiaApplicationDataBase].[dbo].communities as comm INNER JOIN voivodeships as voiv ON voiv.voivodeshipID =comm.voivodeshipID INNER JOIN countries as coun ON coun.countryID=comm.countryID WHERE comm.name='Kuźnia Raciborska' and coun.name LIKE 'rac%'";

    databases.GUSfunctionDB(query, function (recordsset) {
        res.send(recordsset);
    });
});
router.get("/app", function (req, res) {
    var query = "SELECT * FROM [SilesiaMgrDB].[dbo].[users]";

    databases.sendRequestToApplicationDB(query, function (recordsset) {
        res.send(recordsset);
    });
});


//POST API
router.post("/api/user", function (req, res) {
    var query = "INSERT INTO [user] (Name,Email,Password) VALUES (req.body.Name,req.body.Email,req.body.Password)";

});

//PUT API
router.put("/api/user/:id", function (req, res) {
    var query = "UPDATE [user] SET Name= " + req.body.Name + " , Email=  " + req.body.Email + "  WHERE Id= " + req.params.id;
    executeQuery(res, query);
});

// DELETE API
router.delete("/api/user /:id", function (req, res) {
    var query = "DELETE FROM [user] WHERE Id=" + req.params.id;
    executeQuery(res, query);
});


//konic domyslnych do usuniecia

module.exports = router;
