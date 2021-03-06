/**
 * Created by Gabriela on 10.04.2018.
 */
var fs = require('fs'),
    filename = 'dictionaryOCR.txt';
require('xregexp');
var databaseConnections = require('../javascripts/mssql');
var records = [];
var divadedDictionary = [];


const OCRtextFolder = '../images/OCRtextOutput2/';

fs.readdir(OCRtextFolder, function (err, files) {
    files.forEach(function (file) {

        fs.readFile(OCRtextFolder + file, 'utf8', function (errorCallBack, result) {

            if (errorCallBack) {
                console.log("Error with preload: " + errorCallBack);
            } else {
                console.log("Result: " + result);
                findRecords(result);

                pushRecordsToDB(file);
                records = [];
                // divideByRecords(result);
            }
        });
    });

});

function pushRecordsToDB(fileName) {
    records.forEach(function (record) {
        var re = /^[^0-9]/;
        if (re.test(record)) {
            var query = "INSERT INTO [dbo].[scanPages]([placeDictionaryName],[fileName])VALUES('" + record + "','" + fileName.slice(0, -4) + "');";
            databaseConnections.sendRequestToApplicationDB(query, function (records) {
                console.log("All records from file: " + fileName + " inserted.")

            });
        }
    });


}

function findRecords(textInput) {
    var wordsSeparate = textInput.match(/[A-Z-ŻŹÓŁŃ,]+(\w+)[A-Z-ŻŹÓŁŃ,]+/gi);

    var record = "";
    for (var i = 0; i < wordsSeparate.length; i++) {
        if (i != wordsSeparate.length - 1) {
            if (wordsSeparate[i] == wordsSeparate[i].toUpperCase() && isNaN(wordsSeparate[i]) && wordsSeparate[i + 1] == wordsSeparate[i + 1].toUpperCase() && isNaN(wordsSeparate[i + 1])) {
                if (wordsSeparate[i + 1].substr(wordsSeparate[i + 1].length - 1) == ',') {
                    wordsSeparate[i + 1] = wordsSeparate[i + 1].substr(0, wordsSeparate[i + 1].length - 1);
                    record = wordsSeparate[i] + " " + wordsSeparate[i + 1];
                    records.push(record);
                    record = " ";
                    i++;
                }

            } else if (wordsSeparate[i] == wordsSeparate[i].toUpperCase() && isNaN(wordsSeparate[i]) && wordsSeparate[i + 1] != wordsSeparate[i + 1].toUpperCase() && isNaN(wordsSeparate[i + 1])) {
                if (wordsSeparate[i].substr(wordsSeparate[i].length - 1) == ',') {
                    wordsSeparate[i] = wordsSeparate[i].substr(0, wordsSeparate[i].length - 1);
                    record = wordsSeparate[i];
                    records.push(record);
                    record = " ";
                }
            }
        } else {
            if (wordsSeparate[i] == wordsSeparate[i].toUpperCase() && isNaN(wordsSeparate[i])) {
                if (wordsSeparate[i].substr(wordsSeparate[i].length - 1) == ',') {
                    wordsSeparate[i] = wordsSeparate[i].substr(0, wordsSeparate[i].length - 1);
                    record = wordsSeparate[i];
                    records.push(record);
                    record = " ";
                }
            }

        }
    }

    console.log("records: " + records);
}

function divideByRecords(text) {
    for (var i = 0; i < records.length - 1; i++) {
        var rStart = text.search(records[i]);
        var rStop = text.search(records[i + 1]);
        if (rStart != -1 && rStop != -1) {
            divadedDictionary.push(text.substr(rStart, rStop));
        }
    }
    for (var i = 0; i < divadedDictionary.length; i++) {
        console.log("\n" + divadedDictionary[i] + "\n");
    }
}


// divadedDictionary.forEach(function (el) {
//         console.log("\n" + el + "\n");
//     }
// );