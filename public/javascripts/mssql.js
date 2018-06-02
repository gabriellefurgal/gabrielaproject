/**
 * Created by Gabriela on 07.04.2018.
 */

var sql = require("mssql/msnodesqlv8");

var configSilesiaMgrDB = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server={LOCALHOST\\SQLEXPRESS};Database={SilesiaMgrDB};Trusted_Connection={yes};'
};
var configSilesiaDictionaryDB = {

    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server={LOCALHOST\\SQLEXPRESS};Database={Silesia};Trusted_Connection={yes};'
};
var configTerytDB = {

    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0};Server={LOCALHOST\\SQLEXPRESS};Database={silesiaApplicationDataBase};Trusted_Connection={yes};'
};
function createPlacesTable() {
    //  var conn = new sql.Connection(dbConfig)
    var connMgrDB = new sql.ConnectionPool(configSilesiaMgrDB);
//var conn = new sql.Connection(config);
    var req = new sql.Request(connMgrDB);

    connMgrDB.connect(function (err) {
        if (err) {
            console.log("Connection error: " + err);
            return;
        }
        req.query("CREATE TABLE places (" +
            "placeID int," +
            "placeIdTERYT int," +
            "countryIdTERYT int," +
            "voivodeshipIdTERYT int," +
            "typeTERYT varchar(25)," +
            "descriptionTERYT varchar(255));", function (err, result) {
            if (err) {
                console.log("Request error: " + err);
                return;
            } else {
                // console.log(result);
            }
            connMgrDB.close();
        });
    });
}

var sendRequestToDictionaryDB = function (query, callback) {
    var conn = new sql.ConnectionPool(configSilesiaDictionaryDB);
    var req = new sql.Request(conn);

    conn.connect(function (err) {
        if (err) {
            console.log("Connection error: " + err);
            callback(err);
        }
        req.query(query, function (err, recordsset) {
            if (err) {
                console.log("Request error: " + err);
                callback(err);
            } else {
                //  console.log(recordsset);
                callback(recordsset);
            }
            conn.close();
        });
    });
}


var sendRequestToApplicationDB = function (query, callback) {
    var conn = new sql.ConnectionPool(configSilesiaMgrDB);
    var req = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Connection error: " + err);
            callback(err);
        }
        req.query(query, function (err, recordsset) {
            if (err) {
                console.log("Request error: " + err);
                callback(err);
            } else {
                // console.log(recordsset);
                callback(recordsset);
            }
            conn.close();
        });
    });
}

var sendRequestToGUSDB = function (query, callback) {

    var conn = new sql.ConnectionPool(configTerytDB);
    var req = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log("Connection error: " + err);
            callback(err);
        }
        req.query(query, function (err, recordsset) {
            if (err) {
                console.log("Request error: " + err);
                callback(err);
            } else {
                //console.log(recordsset);
                callback(recordsset);
            }
            conn.close();
        });
    });
}

var getVoivodeships= function ( callback) {
    var administrationStructure=[];
    var voivodeships = [];
    var countries = [];
    var communities = [];
    var comunity;
    var country;
    var voivodeship;
    var query2 = "SELECT DISTINCT voiv.name as 'voivodeship', coun.name as 'country', comm.name as 'community' FROM [silesiaApplicationDataBase].[dbo].communities as comm INNER JOIN voivodeships as voiv ON voiv.voivodeshipID =comm.voivodeshipID INNER JOIN countries as coun ON coun.countryID=comm.countryID WHERE coun.voivodeshipID = voiv.voivodeshipID;";
    sendRequestToGUSDB(query2, function (administation) {
        if (administation.recordset.length !== 0) {
            comunity = {name: administation.recordset[0].community}
            communities.push(comunity);
            for (var i = 1; i < administation.recordset.length; i++) {
                if (administation.recordset[i].voivodeship != administation.recordset[i - 1].voivodeship) {

                    voivodeship = {
                        name: administation.recordset[i - 1].voivodeship,
                        countries: countries
                    };
                    countries = [];
                    voivodeships.push(voivodeship);
                } else {
                    if (administation.recordset[i].country != administation.recordset[i - 1].country) {
                         country = {
                            name: administation.recordset[i - 1].country,
                            communities: communities
                        };
                        communities = [];
                        countries.push(country);

                    } else {
                        if (administation.recordset[i].community != administation.recordset[i - 1].community) {
                            comunity={name: administation.recordset[i - 1].community}
                            communities.push(comunity);
                        }
                    }
                }
            }
            comunity={name: administation.recordset[administation.recordset.length - 1].community}
            communities.push(comunity);
            var country = {
                name: administation.recordset[administation.recordset.length - 1].country,
                communities: communities
            };
            countries.push(country);
            var voivodeship = {
                name: administation.recordset[administation.recordset.length - 1].voivodeship,
                countries: countries
            };
            voivodeships.push(voivodeship);
            communities = [];
            countries = [];

        }
        administrationStructure= {voivodeships: voivodeships};
        callback( administrationStructure);
//administrationStructure= JSON.stringify(administrationStructure);
        console.log(JSON.stringify(administrationStructure));
    });

   return administrationStructure;
}
module.exports.functionDB = sendRequestToDictionaryDB;
module.exports.GUSfunctionDB = sendRequestToGUSDB;
module.exports.sendRequestToApplicationDB = sendRequestToApplicationDB;
module.exports.getVoivodeships = getVoivodeships;