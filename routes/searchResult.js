var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');


router.post('/searchForm', function (req, res) {
    var s = req.body.searchValue;
    // var query = "SELECT * ,l.[to] as presentName FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename WHERE p.name= '" + s + "';";
    var query = "SELECT DISTINCT  * ,l.[to] as presentName, p.id as ID FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename WHERE dbo.noPolishSigns(p.name)= [dbo].[noPolishSigns]('" + s + "') OR [dbo].[noPolishSigns](l.[to])= [dbo].[noPolishSigns]('" + s + "') ORDER BY p.name;";
    databases.functionDB(query, function (recordsset) {
        databases.getVoivodeships(function (administration) {
            if (recordsset.recordset.length === 0) {
                res.render('index', {
                    title: "Application",
                    place: {
                        recordset: [{
                            name: 'NoDATA',
                            foreignname: 'NoDATA',
                            presentName: 'NoDATA',
                            gmina: 'NoDATA',
                            powiat: 'NoDATA',
                            wojewodztwo: 'NoDATA',
                            obecnewojewodztwo: 'NoDATA'
                        }]
                    },
                    success: req.session.success,
                    errors: req.session.errors,
                    resource: req.query.resource,
                    userSession: req.session.user,
                    cookies: req.cookies,
                    administration: administration,
                    chosenElement: false
                });
            } else {
                res.render('index', {
                    title: "Application",
                    place: recordsset,
                    success: req.session.success,
                    errors: req.session.errors,
                    resource: req.query.resource,
                    userSession: req.session.user,
                    cookies: req.cookies,
                    administration: administration,
                    chosenElement: false
                });
                res.end();
            }

            req.session.errors = null;
        });
    });
});


router.get('/sortByCountry', function (req, res) {
    var iscountry = true;
    var country = req.query.country;
    if (typeof country == 'undefined') {
        iscountry = false;
    }
    var voivodesip = req.query.v;
    voivodesip = decodeURI(voivodesip);
    country = decodeURI(country);

    country = country.slice(0, 3);
    var voivodeshipsDic = [
        {
            name: "DOLNOŚLĄSKIE",
            value: "dlnśl"
        },
        {
            name: "KUJAWSKO-POMORSKIE",
            value: "kp"
        },
        {
            name: "LUBELSKIE",
            value: "lubel"
        },
        {
            name: "LUBUSKIE",
            value: "lubus"
        },
        {
            name: "ŁÓDZKIE",
            value: "dlnśl"
        },
        {
            name: "MAŁOPOLSKIE",
            value: "małop"
        },
        {
            name: "MAZOWIECKIE",
            value: "dlnśl"
        },
        {
            name: "OPOLSKIE",
            value: "opol"
        },
        {
            name: "PODKARPACKIE",
            value: "podk"
        },
        {
            name: "PODLASKIE",
            value: "podl"
        },

        {
            name: "POMORSKIE",
            value: "pom"
        },
        {
            name: "ŚLĄSKIE",
            value: "śl"
        },
        {
            name: "ŚWIĘTOKRZYSKIE",
            value: "dlnśl"
        },
        {
            name: " WARMIŃSKO-MAZURSKIE",
            value: "warm"
        },

        {
            name: "WIELKOPOLSKIE",
            value: "wlk"
        },
        {
            name: "ZACHODNIOPOMORSKIE",
            value: "zchpm"
        },



    ];
    // var voivodesip1 = voivodesip.slice(0, 4);
    // var voivodesip2 = voivodesip.slice(2, 4);
    // var voivodesip3 = voivodesip.slice(0, 2);

    var voivodeshipChar= "%";
    voivodeshipsDic.forEach(function(voiv){
        if(voiv.name === voivodesip){
            voivodeshipChar = voiv.value;
        }
    });
    var query;
    if (iscountry) {
        query = "SELECT DISTINCT  * ,l.[to] as presentName, p.id as ID FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename WHERE dbo.noPolishSigns(p.powiat)LIKE [dbo].[noPolishSigns]('" + country + "%') AND p.obecnewojewodztwo LIKE '"+ voivodeshipChar +"' ORDER BY p.name;";
    } else {
        query = "SELECT DISTINCT  * ,l.[to] as presentName, p.id as ID FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename WHERE   p.obecnewojewodztwo LIKE '" + voivodeshipChar + "' ORDER BY p.name;";
    }

    databases.functionDB(query, function (recordsset) {
        databases.getVoivodeships(function (administration) {
            if (recordsset.recordset.length === 0) {
                res.render('index', {
                    title: "Application",
                    place: {
                        recordset: [{
                            name: 'NoDATA',
                            foreignname: 'NoDATA',
                            presentName: 'NoDATA',
                            gmina: 'NoDATA',
                            powiat: 'NoDATA',
                            wojewodztwo: 'NoDATA',
                            obecnewojewodztwo: 'NoDATA'
                        }]
                    },
                    success: req.session.success,
                    errors: req.session.errors,
                    resource: req.query.resource,
                    userSession: req.session.user,
                    cookies: req.cookies,
                    administration: administration,
                    chosenElement: false
                });
            } else {
                res.render('index', {
                    title: "Application",
                    place: recordsset,
                    success: req.session.success,
                    errors: req.session.errors,
                    resource: req.query.resource,
                    userSession: req.session.user,
                    cookies: req.cookies,
                    administration: administration,
                    chosenElement: false
                });
                res.end();
            }

            req.session.errors = null;
        });
    });
});
module.exports = router;