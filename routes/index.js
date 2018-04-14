var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');


/* GET home page. */
router.get('/home', function (req, res, next) {

    res.render('index', {title: 'Express'});
});

//GET API
router.get("/", function (req, res) {
    var query = "SELECT * FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name WHERE p.id=48";
    databases.functionDB(query, function (recordsset) {
        res.render('index', {title: 'Express', place: recordsset})
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





module.exports = router;
