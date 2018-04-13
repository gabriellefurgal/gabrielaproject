/**
 * Created by Gabriela on 07.04.2018.
 */
//var sql = require("mssql");
var sql = require("mssql/msnodesqlv8");

// var dbConfig = {
//     server:"localhost\\SQLEXPRESS",
//     database: "SilesiaMgrDB",
//     trusted_Connection: "Yes",
//     port:1433
//
// }
var config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server={DESKTOP-OEJEP8S\\SQLEXPRESS};Database={SilesiaMgrDB};Trusted_Connection={yes};',
};
function createPlacesTable(){
  //  var conn = new sql.Connection(dbConfig)
    var conn = new sql.ConnectionPool(config);
//var conn = new sql.Connection(config);
var req = new sql.Request(conn);

conn.connect(function(err){
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
       conn.close();
   });
});
}

createPlacesTable();