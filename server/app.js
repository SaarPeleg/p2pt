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

  // Request methods allowed
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

/// used to get plots file, convert it to json and send to client ///
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


// calculate banana plot request //
app.get("/calculate", async (req, res) => {
  var response = [];
  var tosend={};
  let db = new sqlite3.Database("./sqlitedatabase.db");
  try {
    db.each(
      "SELECT * from PlotTempratures where userId = ? and plotName = ?",
      [req.query.userId,req.query.plotName],
      function (err, row) {
        response.push(row);
      },
      function () {
        // this callback is executed when the query completed
        console.log("~~~New Calculation Request~~~");
        
        try {
          if (response.length > 0) {
            // calculations start here //
            
            // calculations end here, send data //
            res.status(200).json({
              status: "Success",
              results: tosend,
            });
          } else {
            console.error("Failed - error:" + req.query.userId);
            res.status(200).json({
              status: "Failed - error" + req.query.userId,
            });
          }
          console.log("~~~End Calculation Request~~~");
        } catch {
          res.status(200).json({
            status: "data not found in server",
          });
        }
      }
    );
  } catch {
    db.close();
    res.status(200).json({
      status: "data not found in server",
    });
    return console.log("ERROR");
  }
  db.close();
});

/// random colors for the plot lines ///
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/// get, process and send the date to be displayed in plot history ///
app.get("/apigetplotdata", async (req, res) => {
  var response = {};
  response.raw = [];
  response.years = [];
  var midarray = [];
  var general;
  var tosend = [];
  var year = new Date().getFullYear();
  let db = new sqlite3.Database("./sqlitedatabase.db");
  try {
    db.each(
      "SELECT * from Plots where userId = ? AND (year BETWEEN ? and ?)",
      [req.query.userId, year - 5, year - 0 + 5],
      function (err, row) {
        response.raw.push(row);
      },
      function () {
        var after = year - 0 + 5;
        var before = year - 5;

        console.log("~~~New Plots Data Fetch Request~~~");
        console.log(
          "year range: " + "start year - " + year + " - " + before + "-" + after
        );
        for (var i = 0; i <= after - before; i++) {
          response.years.push(before - 0 + i);
        }
        general = response.raw.reduce(function (r, o) {
          var k = o.product; 
          if (r[k] || (r[k] = []))
            r[k].push({
              year: o.year,
              name: o.plotName,
              label: o.product,
              productAmount: o.productAmount,
            });
          return r;
        }, {});
        for (var key in general) {
          var holder = {};
          general[key].forEach(function (d) {
            if (holder.hasOwnProperty(d.year)) {
              holder[d.year] = holder[d.year] + d.productAmount;
            } else {
              holder[d.year] = d.productAmount;
            }
          });
          general[key]=[];
          for (var prop in holder) {
            general[key].push({ year: prop, productAmount: holder[prop] });
          }

        }
        var datasetsg = [];
        for(var key in general){
            var dataset = {};
            dataset.data = [];
            dataset.label = key;
            dataset.showLine = true;
            dataset.fill = false;
            dataset.borderColor = getRandomColor();
            for (var i = 0; i < response.years.length; i++) {
              dataset.data.push(0);
            }
            for (var i = 0; i < general[key].length; i++) {
              dataset.data[general[key][i].year - before] =
              general[key][i].productAmount;
            }
            datasetsg.push(dataset);
        }
        general={ name: "כללי", dataarray: datasetsg };

        midarray = response.raw.reduce(function (r, o) {
          var k = o.plotName; 
          if (r[k] || (r[k] = []))
            r[k].push({
              year: o.year,
              name: k,
              label: o.product,
              productAmount: o.productAmount,
            });
          return r;
        }, {});

        for (var key in midarray) {
          midarray[key] = midarray[key].reduce(function (r, o) {
            var k = o.label; 
            if (r[k] || (r[k] = []))
              r[k].push({
                year: o.year,
                name: o.name,
                label: k,
                productAmount: o.productAmount,
              });
            return r;
          }, {});
        }

        for (var key in midarray) {
          var datasets = [];

          for (var prod in midarray[key]) {
            var dataset = {};
            dataset.data = [];
            dataset.label = prod;
            dataset.showLine = true;
            dataset.fill = false;
            dataset.borderColor = getRandomColor();
            for (var i = 0; i < response.years.length; i++) {
              dataset.data.push(0);
            }
            for (var i = 0; i < midarray[key][prod].length; i++) {
              dataset.data[midarray[key][prod][i].year - before] =
                midarray[key][prod][i].productAmount;
            }
            datasets.push(dataset);
          }
          tosend.push({ name: key, dataarray: datasets });
        }
        // this callback is executed when the query completed
        console.log("user id requested: " + req.query.userId);
        try {
          if (response.raw.length > 0) {
            res.status(200).json({
              general: general,
              status: "Success",
              response: tosend,
              years: response.years,
            });
          } else {
            console.error(
              "Failed to find plot data for user with id - " + req.query.userId
            );
            res.status(200).json({
              status:
                "Failed to find plot data for user with id - " +
                req.query.userId +
                " in the years " +
                year -
                3 +
                "-" +
                year +
                3,
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

app.listen(3000, () => console.log("server running on port 3000"));
