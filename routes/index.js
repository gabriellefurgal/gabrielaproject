var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');
var url = require('url');
var versions = require('../public/javascripts/versionalization')


/* GET home page. */
router.get('/home', function (req, res, next) {

    res.redirect("/");
    res.end();
});


//GET API
router.get("/", function (req, res,next) {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
      var query = "SELECT * ,l.[to] as presentName, p.id as ID FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name LEFT JOIN [Silesia].[dbo].[Links] As l ON l.[from]=d.placename ORDER BY p.name;";
    databases.functionDB(query, function (recordsset) {
        databases.getVoivodeships(function (administration){
               if (recordsset.recordset.length == 0) {
                   res.render('index', {
                       title: "Application",
                       place:{
                           recordset: [{
                               name: 'NoDATA',
                               foreignname: 'NoDATA',
                               presentName: 'NoDATA',
                               gmina: 'NoDATA',
                               powiat: 'NoDATA',
                               wojewodztwo: 'NoDATA'
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
console.log(req.session);
console.log(req.cookies);
    next();

});

router.get("/logOut",function(req,res){
    req.session.errors = null;
    req.session.success = null;
    // req.session.user=null;
    req.session.destroy();
   res.clearCookie("userCookie");
    res.redirect("/");
});



module.exports = router;
