const express = require("express");
const tj = require("@tmcw/togeojson");
const fs = require("fs");
var sqlite = require("sqlite-sync"); //requiring
const DOMParser = require("xmldom").DOMParser;
var cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const app = express();
var tempratures = [];
var humidity = [];
var WindSpeed = [];
var DayLength = [];
var delta = 0;
const monthNames = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
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
  var tosend = {};
  console.log("~~~New Calculation Request~~~");
  console.log("plot id requested: " + req.query.plotId);
  console.log("start date: " + req.query.startDate);
  let db = new sqlite3.Database("./sqlitedatabase.db");
  try {
    db.each(
      "SELECT * from Plots where plotId = ?",
      [req.query.plotId],
      function (err, row) {
        response.push(row);
      },
      function () {
        // this callback is executed when the query completed
        try {
          if (response.length > 0) {
            //suc
            var result = SecretAlgorithm(new Date(req.query.startDate), req.query.plotId);
            if (result == "fail") {
              console.error(
                "Failed to find possible date to plant in plot with id" +
                  req.query.plotId
              );
              res.status(200).json({
                status:
                  "Failed to find possible date to plant in plot with id" +
                  req.query.plotId,
              });
            } else {
              res.status(200).json({
                status: "Success",
                result: result,
              });
            }
          } else {
            console.error("Failed to find plot with id - " + req.query.plotId);
            res.status(200).json({
              status: "Failed to find plot with id - " + req.query.plotId,
            });
          }
          console.log("~~~End Fetch Request~~~");
        } catch {
          res.status(200).json({
            status: "Failed to find plot with id - " + req.query.plotId,
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
          general[key] = [];
          for (var prop in holder) {
            general[key].push({ year: prop, productAmount: holder[prop] });
          }
        }
        var datasetsg = [];
        for (var key in general) {
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
        general = { name: "כללי", dataarray: datasetsg };

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

function SecretAlgorithm(date, plot) {
  //for(var i=0;i<(365/7);i++){}
  UpdateData(plot);
  var fail = true;
  var startdate;
  var bestDate;
  var weeks = 365 / 7;
  var index = 0;
  var return_obj={};
  
  while (fail && index < weeks) {
    fail = false;
    startdate = new Date(date);

    var timew = (index * 7)+1;
    
    startdate.setDate(startdate.getDate() + timew);
    var tmp = Establishment(startdate);
    if (tmp == "fail") {
      fail = true;
    }
    var estend=new Date(tmp);
    tmp = Suckers(tmp);
    if (tmp == "fail") {
      fail = true;
    }
    var sucend=new Date(tmp);
    tmp = Growth(tmp);
    if (tmp == "fail") {
      fail = true;
    }
    var groend=new Date(tmp);
    tmp = Shooting(tmp);
    if (tmp == "fail") {
      fail = true;
    }
    var shooend=new Date(tmp);
    tmp = Hands(tmp);
    if (tmp == "fail") {
      fail = true;
    }
    var hanend=new Date(tmp);
    tmp = Bunch(tmp);
    if (tmp == "fail") {
      fail = true;
    }
    //console.log("real date", tmp);
    //console.log("total delta", delta);
    //var d = new Date(startdate);
    //d.setDate(d.getDate() + delta + 206);
    //console.log("d", d);
    if (fail == false) {
      bestDate = startdate;
      bestEnd = tmp;
      var start=new Date(bestDate);
      return_obj={
        Start:start,
        Planting: bestDate,
        Establishment:estend,
        Suckers: sucend,
        Growth:groend,
        Shooting:shooend,
        Hands:hanend,
        Bunch:bestEnd,
        order:"Establishment,Suckers,Growth,Shooting,Hands,Bunch"
      };
    }
    index++;
  }
  if (!bestDate) {
    return "fail";
  }
  while (index < weeks) {
    var fail = false;
    startdate = new Date(date);
    var timew = (index * 7)+1;
    startdate.setDate(startdate.getDate() + timew);
    UpdateData(plot);
    var tmp = Establishment(startdate);
    if (tmp == "fail") {
      console.log("Establishment: failed to plant at date: " + startdate);
      fail = true;
    }
    var estend=new Date(tmp);
    tmp = Suckers(tmp);
    if (tmp == "fail") {
      console.log("Suckers: failed to plant at date: " + startdate);
      fail = true;
    }
    var sucend=new Date(tmp);
    tmp = Growth(tmp);
    if (tmp == "fail") {
      console.log("Growth: failed to plant at date: " + startdate);
      fail = true;
    }
    var groend=new Date(tmp);
    tmp = Shooting(tmp);
    if (tmp == "fail") {
      console.log("Shooting: failed to plant at date: " + startdate);
      fail = true;
    }
    var shooend=new Date(tmp);
    tmp = Hands(tmp);
    if (tmp == "fail") {
      console.log("Hands: failed to plant at date: " + startdate);
      fail = true;
    }
    var hanend=new Date(tmp);
    tmp = Bunch(tmp);
    if (tmp == "fail") {
      console.log("Bunch: failed to plant at date: " + startdate);
      fail = true;
    }
    //console.log("real date", tmp);
    //console.log("total delta", delta);
    //var d = new Date(startdate);
    //d.setDate(d.getDate() + delta + 206);
    //console.log("d", d);
    if (tmp < bestEnd && fail == false) {
      bestDate = startdate;
      bestEnd = tmp;
      var start=new Date(bestDate);
      return_obj={
        Start:start,
        Planting: bestDate,
        Establishment:estend,
        Suckers: sucend,
        Growth:groend,
        Shooting:shooend,
        Hands:hanend,
        Bunch:bestEnd,
        order:"Establishment,Suckers,Growth,Shooting,Hands,Bunch"
      };
    }
    index++;
  }
  //var test2=new Date(bestDate);
  //test2.setDate(test2.getDate()+);
  console.log("best date", return_obj);
  return return_obj;
  //26.06.22
}

function IsLegalRange(min, max, val) {
  if (val > max || val < min) {
    return false;
  } else {
    return true;
  }
}

function DayCalc(
  startdate,
  daysnum,
  minTemp,
  maxTemp,
  baseDegrees,
  degreeAbove,
  degreeBelow,
  mindays,
  maxdays
) {
  ///// day temprature ////
  var establishmentDate = new Date(startdate);
  var permdays = daysnum;
  var days = daysnum;
  var establishmentCounter = 1;
  //console.log(tempratures);
  while (days > 1) {
    var tempday =
      tempratures[0][monthNames[establishmentDate.getMonth()] + "TDay"];
    if (tempday < minTemp || tempday > maxTemp) {
      return "fail";
    }
    var diff = baseDegrees - tempday; //1
    if (diff < 0) {
      diff = diff * degreeAbove;
    } else if (degreeBelow == "dontcheck") {
      diff = diff * degreeBelow;
    }
    days = days - 1 + diff / permdays;
    establishmentCounter++;
    establishmentDate.setDate(establishmentDate.getDate() + 1);
  }
  if (!IsLegalRange(mindays, maxdays, establishmentCounter)) {
    return "fail";
  }

  establishmentCounter = establishmentCounter - permdays;
  //console.log("tday", establishmentCounter);
  return establishmentCounter;
}
module.exports = DayCalc;

function NightCalc(
  startdate,
  daysnum,
  minTemp,
  influence,
  baseDegrees,
  degreeA,
  degreeB,
  mindays,
  maxdays
) {
  ///// night temprature ////
  var establishmentDateNight = new Date(startdate);
  var permdays = daysnum;
  var days = daysnum;
  var establishmentCounterNight = 1;
  while (days > 1) {
    var tempNight =
      tempratures[0][monthNames[establishmentDateNight.getMonth()] + "TNight"];
    if (tempNight < minTemp) {
      return "fail";
    }
    var diff = baseDegrees - tempNight; //1
    switch (influence.stepsNum) {
      case 0:
        if (diff > 0) {
          diff = diff * degreeB;
        } else {
          diff = diff * degreeA;
        }
        break;
      case 1:
        if (tempNight >= baseDegrees) {
          diff = 0;
        } else if (tempNight < baseDegrees && tempNight >= influence.step1) {
          diff = diff * degreeA;
        } else {
          diff = diff * degreeB;
        }
        break;
      case 2:
        if (tempNight >= baseDegrees) {
          diff = 0;
        } else if (tempNight < baseDegrees && tempNight >= influence.step1) {
          diff = diff * degreeA;
        } else if (
          tempNight < influence.step1 &&
          tempNight >= influence.step2
        ) {
          diff = diff * degreeB;
        } else {
          diff = diff * influence.degreeC;
        }
        break;
    }
    days = days - 1 + diff / permdays;
    establishmentCounterNight++;
    establishmentDateNight.setDate(establishmentDateNight.getDate() + 1);
  }

  if (!IsLegalRange(mindays, maxdays, establishmentCounterNight)) {
    return "fail";
  }

  establishmentCounterNight = establishmentCounterNight - permdays;
  //console.log("tnight", establishmentCounterNight);

  return establishmentCounterNight;
}
module.exports = NightCalc;

function RH(startdate, daysnum, minHu, steps, mindays, maxdays) {
  var permdays = daysnum;
  var days = daysnum;
  var establishmentDateHumid = new Date(startdate);
  var establishmentCounterHumid = 1;
  while (days > 1) {
    var temp = humidity[0][monthNames[establishmentDateHumid.getMonth()]];
    if (temp < minHu) {
      return "fail";
    }

    var diff = 0;
    if (steps.stepsNum == 3) {
      if (temp == steps.A) {
        diff = 0;
      } else if (temp >= steps.B && temp < steps.A) {
        diff = steps.Adata;
      } else if (temp >= steps.C && temp < steps.B) {
        diff = steps.Bdata;
      } else if (temp < steps.C) {
        diff = steps.Cdata;
      }
    } else {
      if (temp == steps.A) {
        diff = 0;
      } else if (temp >= steps.B && temp < steps.A) {
        diff = steps.Adata;
      } else if (temp < steps.B) {
        diff = steps.Bdata;
      }
    }
    days = days - 1 + diff / permdays;
    establishmentCounterHumid++;
    establishmentDateHumid.setDate(establishmentDateHumid.getDate() + 1);
  }
  if (!IsLegalRange(mindays, maxdays, establishmentCounterHumid)) {
    return "fail";
  }
  establishmentCounterHumid = establishmentCounterHumid - permdays;
  //console.log("humid", establishmentCounterHumid);
  return establishmentCounterHumid;
}
module.exports = RH;

function DayLengthF(
  startdate,
  daysnum,
  minH,
  maxH,
  hours,
  less,
  toadd,
  mindays,
  maxdays
) {
  /// day hourslength ///
  permdays = daysnum;
  days = daysnum;
  var establishmentDateLength = new Date(startdate);
  var establishmentCounterLength = 1;
  while (days > 1) {
    var temp = DayLength[0][monthNames[establishmentDateLength.getMonth()]];
    temp = parseFloat(temp.split(":")[0]) + parseFloat(temp.split(":")[1]) / 60;
    //console.log("TEST TEMP LENGTH",monthNames[establishmentDateLength.getMonth()],temp);
    if (temp > maxH || temp < minH) {
      return "fail";
    }
    var diff = (hours - temp) * (1 / less) * toadd;
    //console.log(diff);
    days = days - 1 + diff / permdays;
    establishmentCounterLength++;
    establishmentDateLength.setDate(establishmentDateLength.getDate() + 1);
    //console.log(days);
  }
  if (!IsLegalRange(mindays, maxdays, establishmentCounterLength)) {
    return "fail";
  }
  establishmentCounterLength = establishmentCounterLength - permdays;
  //console.log("DAY LENGTH", establishmentCounterLength);
  return establishmentCounterLength;
}
module.exports = DayLengthF;

function WindF(
  startdate,
  daysnum,
  maxS,
  minS,
  noinf,
  eachN,
  extender,
  mindays,
  maxdays
) {
  /// Wind ///
  var permdays = daysnum;
  var days = daysnum;
  var establishmentDateWind = new Date(startdate);
  var establishmentCounterWind = 1;
  while (days > 1) {
    var temp = WindSpeed[0][monthNames[establishmentDateWind.getMonth()]];
    //console.log("TEST TEMP LENGTH",monthNames[establishmentDateLength.getMonth()],temp);
    if (temp > maxS || temp < minS) {
      return "fail";
    }
    var diff = 0;
    if (temp > noinf) {
      diff = ((temp - noinf) / eachN) * extender;
    }

    //console.log(diff);
    days = days - 1 + diff / permdays;
    establishmentCounterWind++;
    establishmentDateWind.setDate(establishmentDateWind.getDate() + 1);
    //console.log(days);
  }
  //console.log("Wind", establishmentCounterWind);
  if (!IsLegalRange(mindays, maxdays, establishmentCounterWind)) {
    return "fail";
  }
  establishmentCounterWind = establishmentCounterWind - permdays;
  //console.log("Wind", establishmentCounterWind);
  return establishmentCounterWind;
}
function Establishment(startdate) {
  var date = startdate;
  var toreturn = new Date(startdate);
  var mid = 25;
  var deltadays = DayCalc(date, 30, 13, 40, 28, 0.125, 0.3, 25, 45);
  if (deltadays == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + mid + deltadays);
  //console.log("dateday", toreturn);
  var influence = {
    stepsNum: 0,
    step1: 0,
    step2: 0,
    degreeC: 0,
  };

  var deltanight = NightCalc(date, 30, 8, influence, 26, 0.08, 0.04, 25, 45);
  if (deltanight == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltanight);
  var steps = {
    stepsNum: 3,
    A: 80,
    Adata: 0.008,
    B: 65,
    Bdata: 0.016,
    C: 50,
    Cdata: 0.035,
  };
  var deltarh = RH(date, 25, 20, steps, 25, 45);
  if (deltarh == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltarh);

  var deltalength = DayLengthF(date, 25, 2, 20, 20, 0.5, 0.27, 25, 45);
  if (deltalength == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltalength);

  var deltawind = WindF(date, 25, 70, 0, 15, 5, 0.05, 25, 45);
  if (deltawind == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltawind);
  var totaldays =
    mid + deltawind + deltadays + deltalength + deltanight + deltarh;
  toreturn.setDate(toreturn.getDate() + totaldays);
  if (!IsLegalRange(25, 45, totaldays)) {
    return "fail";
  }
  delta += deltawind + deltadays + deltalength + deltanight + deltarh;
  console.log(
    "Establishment date",
    toreturn /*, "",
    deltawind + deltadays + deltalength + deltanight + deltarh*/
  );
  return toreturn;
}

function Suckers(startdate) {
  var date = startdate;

  var toreturn = new Date(startdate);
  var min = 60;
  var max = 180;
  var mid = min;
  var deltadays = DayCalc(date, 180, 12, 42, 12, 1.2, "dontcheck", min, max);

  if (deltadays == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + mid + deltadays);
  var influence = {
    stepsNum: 1,
    step1: 12,
    step2: 0,
    degreeC: 0,
  };

  var deltanight = NightCalc(date, 90, 6, influence, 20, 0.51, 1.31, min, max);
  if (deltanight == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltanight);

  var steps = {
    stepsNum: 3,
    A: 80,
    Adata: 0.056,
    B: 65,
    Bdata: 0.112,
    C: 50,
    Cdata: 0.238,
  };
  var deltarh = RH(date, 60, 20, steps, min, max);
  if (deltarh == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltarh);

  var deltalength = DayLengthF(date, 60, 2, 20, 20, 0.5, 1.67, min, max);
  if (deltalength == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltalength);

  var deltawind = WindF(date, 60, 90, 0, 15, 5, 0.33, min, max);
  if (deltawind == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltawind);
  var totaldays =
    mid + deltawind + deltadays + deltalength + deltanight + deltarh;
  toreturn.setDate(toreturn.getDate() + totaldays);
  if (!IsLegalRange(min, max, totaldays)) {
    return "fail";
  }
  delta += deltawind + deltadays + deltalength + deltanight + deltarh;

  console.log(
    "Suckers date",
    toreturn/*,
    deltawind + deltadays + deltalength + deltanight + deltarh*/
  );
  return toreturn;
}

function Growth(startdate) {
  var date = startdate;
  var toreturn = new Date(startdate);
  var min = 60;
  var max = 90;
  var mid = min;
  var deltadays = DayCalc(date, 90, 12, 42, 12, 0.3, "dontcheck", min, max);
  if (deltadays == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + mid + deltadays);
  var influence = {
    stepsNum: 1,
    step1: 12,
    step2: 0,
    degreeC: 0,
  };
  var daysN = 0.25 * (max - min) + min;
  var deltanight = NightCalc(
    date,
    Math.ceil(daysN),
    6,
    influence,
    20,
    0.13,
    0.32,
    min,
    max
  );
  if (deltanight == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltanight);

  var steps = {
    stepsNum: 3,
    A: 80,
    Adata: 0.014,
    B: 65,
    Bdata: 0.028,
    C: 50,
    Cdata: 0.06,
  };
  var deltarh = RH(date, min, 20, steps, min, max);
  if (deltarh == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltarh);

  var deltalength = DayLengthF(date, min, 2, 20, 20, 0.5, 0.42, min, max);
  if (deltalength == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltalength);

  var deltawind = WindF(date, min, 90, 0, 15, 5, 0.08, min, max);
  if (deltawind == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltawind);
  var totaldays =
    mid + deltawind + deltadays + deltalength + deltanight + deltarh;

  toreturn.setDate(toreturn.getDate() + totaldays);
  //console.log("totaldays", totaldays);
  if (!IsLegalRange(min, max, totaldays)) {
    return "fail";
  }
  console.log(
    "Growth date",
    toreturn/*,
    deltawind + deltadays + deltalength + deltanight + deltarh*/
  );
  delta += deltawind + deltadays + deltalength + deltanight + deltarh;

  return toreturn;
}

function Shooting(startdate) {
  var date = startdate;
  var toreturn = new Date(startdate);
  var min = 15;
  var max = 30;
  var mid = min;
  var deltadays = DayCalc(date, 30, 12, 42, 12, 0.15, "dontcheck", min, max);
  if (deltadays == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + mid + deltadays);
  var influence = {
    stepsNum: 1,
    step1: 12,
    step2: 0,
    degreeC: 0,
  };
  var daysN = 0.25 * (max - min) + min;
  var deltanight = NightCalc(
    date,
    Math.ceil(daysN),
    6,
    influence,
    20,
    0.06,
    0.15,
    min,
    max
  );
  if (deltanight == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltanight);

  var steps = {
    stepsNum: 2,
    A: 65,
    Adata: 0.014,
    B: 50,
    Bdata: 0.028,
    C: 0,
    Cdata: 0,
  };
  var deltarh = RH(date, min, 20, steps, min, max);
  if (deltarh == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltarh);

  var deltalength = DayLengthF(date, min, 2, 20, 20, 0.5, 0.21, min, max);
  if (deltalength == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltalength);

  var deltawind = WindF(date, min, 90, 0, 15, 5, 0.04, min, max);
  if (deltawind == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltawind);
  var totaldays =
    mid + deltawind + deltadays + deltalength + deltanight + deltarh;

  toreturn.setDate(toreturn.getDate() + totaldays);
  //console.log("totaldays", totaldays);
  if (!IsLegalRange(min, max, totaldays)) {
    return "fail";
  }
  console.log(
    "Shooting date",
    toreturn/*,
    deltawind + deltadays + deltalength + deltanight + deltarh*/
  );
  delta += deltawind + deltadays + deltalength + deltanight + deltarh;
  return toreturn;
}

function Hands(startdate) {
  var date = startdate;
  var toreturn = new Date(startdate);
  var min = 15;
  var max = 30;
  var mid = min;
  var deltadays = DayCalc(date, 30, 12, 42, 12, 0.15, "dontcheck", min, max);
  if (deltadays == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + mid + deltadays);
  var influence = {
    stepsNum: 1,
    step1: 12,
    step2: 0,
    degreeC: 0,
  };
  var daysN = 0.25 * (max - min) + min;
  var deltanight = NightCalc(
    date,
    Math.ceil(daysN),
    6,
    influence,
    20,
    0.06,
    0.15,
    min,
    max
  );
  if (deltanight == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltanight);

  var steps = {
    stepsNum: 2,
    A: 65,
    Adata: 0.014,
    B: 50,
    Bdata: 0.028,
    C: 0,
    Cdata: 0,
  };
  var deltarh = RH(date, min, 20, steps, min, max);
  if (deltarh == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltarh);

  var deltalength = DayLengthF(date, min, 2, 20, 20, 0.5, 0.21, min, max);
  if (deltalength == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltalength);

  var deltawind = WindF(date, min, 70, 0, 15, 5, 0.04, min, max);
  if (deltawind == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltawind);
  var totaldays =
    mid + deltawind + deltadays + deltalength + deltanight + deltarh;
  //console.log("totaldays", totaldays);
  toreturn.setDate(toreturn.getDate() + totaldays);
  if (!IsLegalRange(min, max, totaldays)) {
    return "fail";
  }
  console.log(
    "Hands date",
    toreturn/*,
    deltawind + deltadays + deltalength + deltanight + deltarh*/
  );
  delta += deltawind + deltadays + deltalength + deltanight + deltarh;
  return toreturn;
}

function Bunch(startdate) {
  var date = startdate;
  var toreturn = new Date(startdate);
  var min = 30;
  var max = 120;
  var mid = min;
  var deltadays = DayCalc(date, max, 12, 42, 12, 0.9, "dontcheck", min, max);
  if (deltadays == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + mid + deltadays);
  var influence = {
    stepsNum: 2,
    step1: 20,
    step2: 12,
    degreeC: 0.85,
  };
  //console.log(influence.degreeC);
  var daysN = 0.25 * (max - min) + min;
  var deltanight = NightCalc(
    date,
    Math.ceil(daysN),
    6,
    influence,
    27,
    0.17,
    0.34,
    min,
    max
  );
  if (deltanight == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltanight);

  var steps = {
    stepsNum: 2,
    A: 65,
    Adata: 0.084,
    B: 50,
    Bdata: 0.17,
    C: 0,
    Cdata: 0,
  };
  var deltarh = RH(date, min, 20, steps, min, max);
  if (deltarh == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltarh);

  var deltalength = DayLengthF(date, min, 2, 20, 20, 0.5, 1.25, min, max);
  if (deltalength == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltalength);

  var deltawind = WindF(date, min, 70, 0, 15, 5, 0.25, min, max);
  if (deltawind == "fail") {
    return "fail";
  }
  //toreturn.setDate(toreturn.getDate() + deltawind);
  var totaldays =
    mid + deltawind + deltadays + deltalength + deltanight + deltarh;
  toreturn.setDate(toreturn.getDate() + totaldays);
  //console.log("totaldays", totaldays);
  if (!IsLegalRange(min, max, totaldays)) {
    return "fail";
  }
  console.log(
    "Bunch date",
    date/*,
    deltawind + deltadays + deltalength + deltanight + deltarh*/
  );
  delta += deltawind + deltadays + deltalength + deltanight + deltarh;
  return toreturn;
}

function UpdateData(plotid) {
  sqlite.connect("./sqlitedatabase.db");

  //Creating table - you can run any command
  sqlite.run(
    "SELECT * from PlotTempratures where plotId =" + "'" + plotid + "'" + ";",
    function (res) {
      if (res.error) throw res.error;
      tempratures = res;
    }
  );
  sqlite.run(
    "SELECT * from PlotHumidity where plotId =" + "'" + plotid + "'" + ";",
    function (res) {
      if (res.error) throw res.error;
      humidity = res;
    }
  );
  sqlite.run(
    "SELECT * from WindSpeed where plotId =" + "'" + plotid + "'" + ";",
    function (res) {
      if (res.error) throw res.error;
      WindSpeed = res;
    }
  );
  sqlite.run(
    "SELECT * from DayLength where plotId =" + "'" + plotid + "'" + ";",
    function (res) {
      if (res.error) throw res.error;
      DayLength = res;
    }
  );
  sqlite.close();
}

app.listen(3000, () => {
  //UpdateData();

  /*SecretAlgorithm(
    new Date("2021-08-20" ),
    "0EFF89E7F716F10FB533"
  );*/
  /*Establishment(new Date("2021-08-20"));
  Suckers(new Date("2021-09-21"));
  Growth(new Date("2022-01-26"));
  Shooting(new Date("2022-04-03"));
  Hands(new Date("2022-04-23"));
  Bunch(new Date("2022-05-12"));*/

  console.log("server running on port 3000");
});
