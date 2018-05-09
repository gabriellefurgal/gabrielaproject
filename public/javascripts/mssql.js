/**
 * Created by Gabriela on 07.04.2018.
 */
//var sql = require("mssql");
var sql = require("mssql/msnodesqlv8");

var configSilesiaMgrDB = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server={LOCALHOST\\SQLEXPRESS};Database={SilesiaMgrDB};Trusted_Connection={yes};'
};
var configSilesiaDictionaryDB={

    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server={LOCALHOST\\SQLEXPRESS};Database={Silesia};Trusted_Connection={yes};'
};
var configTerytDB={

    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server={LOCALHOST\\SQLEXPRESS};Database={silesiaApplicationDataBase};Trusted_Connection={yes};'
};
function createPlacesTable(){
  //  var conn = new sql.Connection(dbConfig)
    var connMgrDB = new sql.ConnectionPool(configSilesiaMgrDB);
//var conn = new sql.Connection(config);
var req = new sql.Request(connMgrDB);

    connMgrDB.connect(function(err){
   if(err){
       console.log("Connection error: "+err);
       return;
   }
   req.query("CREATE TABLE places (" +
       "placeID int," +
       "placeIdTERYT int," +
       "countryIdTERYT int," +
       "voivodeshipIdTERYT int," +
       "typeTERYT varchar(25)," +
       "descriptionTERYT varchar(255));", function (err,result) {
       if(err){
           console.log("Request error: "+err);
           return;
       }else{
           console.log(result);
       }
       connMgrDB.close();
   });
});
}

var  sendRequestToDictionaryDB = function(query, callback ){
    var conn = new sql.ConnectionPool(configSilesiaDictionaryDB);
    var req = new sql.Request(conn);

    conn.connect(function(err){
        if(err){
            console.log("Connection error: "+err);
            callback(err);
        }
        req.query(query, function (err,recordsset) {
            if(err){
                console.log("Request error: "+err);
               callback(err);
            }else{
                console.log(recordsset);
                callback(recordsset);
            }
            conn.close();
        });
    });
}


    var sendRequestToApplicationDB= function(query, callback ){
        var conn = new sql.ConnectionPool(configSilesiaMgrDB);
        var req = new sql.Request(conn);
        conn.connect(function(err){
            if(err){
                console.log("Connection error: "+err);
                callback(err);
            }
            req.query(query, function (err,recordsset) {
                if(err){
                    console.log("Request error: "+err);
                    callback(err);
                }else{
                    console.log(recordsset);
                    callback(recordsset);
                }
                conn.close();
            });
        });
}

   var  sendRequestToGUSDB= function(query, callback ){

       var conn = new sql.ConnectionPool(configTerytDB);
       var req = new sql.Request(conn);
       conn.connect(function(err){
           if(err){
               console.log("Connection error: "+err);
               callback(err);
           }
           req.query(query, function (err,recordsset) {
               if(err){
                   console.log("Request error: "+err);
                   callback(err);
               }else{
                   console.log(recordsset);
                   callback(recordsset);
               }
               conn.close();
           });
       });
   }


module.exports.functionDB= sendRequestToDictionaryDB;
   module.exports.GUSfunctionDB= sendRequestToGUSDB;
module.exports.sendRequestToApplicationDB= sendRequestToApplicationDB;
