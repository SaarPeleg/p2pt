const express = require("express");
const tj = require("@tmcw/togeojson");
const fs = require("fs");
const DOMParser = require("xmldom").DOMParser;
var cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
  );

  // Pass to next layer of middleware
  next();
});

app.get("/apilogin", async (req, res) => {
  var response = [];
  var userIds = null;
  var plots = null;
  let db = new sqlite3.Database("./sqlitedatabase.db");
  try {
    db.each(
      "SELECT * from Locations where userId = ?",
      [req.query.userId],
      function (err, row) {
        response.push(row);
        userIds = row.userId;
        plots = row.plots_name;
      },
      function () {
        // this callback is executed when the query completed
        console.log("~~~New Fetch Request~~~");
        console.log("user id requested: " + req.query.userId);
        try {
          if (response.length > 0) {
            var kml = new DOMParser().parseFromString(
              fs.readFileSync("./Maps/" + plots, "utf8")
            );
            var converted = tj.kml(kml);
            var convertedWithStyles = tj.kml(kml, { styles: true });
            res.status(200).json({
              status: "Success",
              userId: userIds,
              plotsJson: convertedWithStyles,
            });
          } else {
            console.error("Failed to find user with id - " + req.query.userId);
            res.status(200).json({
              status: "Failed to find user with id - " + req.query.userId,
            });
          }
          console.log("~~~End Fetch Request~~~");
        } catch {
          res.status(200).json({
            status: "User not found",
          });
        }
      }
    );
  } catch {
    db.close();
    return console.log("ERROR");
  }
  db.close();
});

app.get("/apigetplotdata", async (req, res) => {
  var response = [];
  var year=new Date().getFullYear();
  let db = new sqlite3.Database("./sqlitedatabase.db");
  try {
    db.each(
      "SELECT * from Plots where userId = ? AND (year BETWEEN ? and ?)",
      [req.query.userId,year-5,year-0+5],
      function (err, row) {
        response.push(row);
      },
      function () {
        var after=year-0+5;
        var before=year-5;
        
        console.log("~~~New Plots Data Fetch Request~~~");
        console.log("year range: "+"start year - "+year+" - "+before+"-"+after);
        // this callback is executed when the query completed
        console.log("user id requested: " + req.query.userId);
        try {
          if (response.length > 0) {
            res.status(200).json({
              status: "Success",
              rows: response,
            });
          } else {
            console.error("Failed to find plot data for user with id - " + req.query.userId);
            res.status(200).json({
              status: "Failed to find plot data for user with id - " + req.query.userId+" in the years "+year-3+"-"+year+3,
            });
          }
          console.log("~~~End Plots Data Fetch Request~~~");
        } catch {
          res.status(200).json({
            status: "invalid request, resource not found",
          });
        }
      }
    );
  } catch {
    db.close();
    return console.log("ERROR");
  }
  db.close();
});

app.listen(3000, () => console.log("server running on port 3000, "));
