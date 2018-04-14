/**
 * Created by Gabriela on 14.04.2018.
 */
var express = require('express');
var router = express.Router();
var databases = require('../public/javascripts/mssql');

router.post('/searchForm', function (req, res) {
    var s = req.body.searchValue;
    var query = "SELECT * FROM [Silesia].[dbo].[Places] As p INNER JOIN [Silesia].[dbo].[Description] As d ON d.placename= p.name WHERE p.name= '" + s +"';";
    databases.functionDB(query, function (recordsset) {
        res.render('index',{title:"Applciation",place: recordsset});

    });
});

module.exports = router;