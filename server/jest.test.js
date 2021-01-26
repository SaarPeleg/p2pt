//var assert = require("assert");
//import {IsLegalRange} from '/server/app.js'
//var app = require("./app");
///var UpdateData = require("./app");
//var DayCalc = require("./app");
//var IsLegalRange = require("./modname");
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
var sqlite = require("sqlite-sync"); //requiring
function IsLegalRange(min, max, val) {
  if (val > max || val < min) {
    return false;
  } else {
    return true;
  }
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
  return "asd";
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
//UpdateData("0C0EB1BE0C16F10B47FD");
test("DayCalc should return -1 for the date 2021/08/20", () => {
  //expect(IsLegalRange(1, 3, 2)).toBe(true);
  UpdateData("0C0EB1BE0C16F10B47FD");
  expect(
    DayCalc(new Date("2021-08-20"), 30, 13, 40, 28, 0.125, 0.3, 25, 45)
  ).toBe(-1);
});
test('DayCalc should return "fail" if the day temprature is lower than min temprature ', () => {
  //expect(IsLegalRange(1, 3, 2)).toBe(true);
  UpdateData("0C0EB1BE0C16F10B47FD");
  expect(
    DayCalc(new Date("2021-08-20"), 30, 999, 40, 28, 0.125, 0.3, 25, 45)
  ).toBe("fail");
});
test('DayCalc should return "fail" if it exceeds or preceed the range given to it, set range as 1-2 days to make it fail ', () => {
  //expect(IsLegalRange(1, 3, 2)).toBe(true);
  UpdateData("0C0EB1BE0C16F10B47FD");
  expect(
    DayCalc(new Date("2021-08-20"), 30, 13, 40, 28, 0.125, 0.3, 1, 2)
  ).toBe("fail");
});
test("IsLegalRange should return true if the third number is between the other numbers, 1, 3, 2 should return true ", () => {
  expect(IsLegalRange(1, 3, 2)).toBe(true);
  //UpdateData("0C0EB1BE0C16F10B47FD");
  //expect(DayCalc(new Date("2021-08-20"), 30, 13, 40, 28, 0.125, 0.3, 25, 45)).toBe(-1);
});
test("IsLegalRange should return false if the third number is  not between the other numbers, 1, 3, 5 should return false ", () => {
  expect(IsLegalRange(1, 3, 5)).toBe(false);
  //UpdateData("0C0EB1BE0C16F10B47FD");
  //expect(DayCalc(new Date("2021-08-20"), 30, 13, 40, 28, 0.125, 0.3, 25, 45)).toBe(-1);
});
test("IsLegalRange should return false if the third number is  not between the other numbers, 1, 3, -1 should return false ", () => {
  expect(IsLegalRange(1, 3, -1)).toBe(false);
  //UpdateData("0C0EB1BE0C16F10B47FD");
  //expect(DayCalc(new Date("2021-08-20"), 30, 13, 40, 28, 0.125, 0.3, 25, 45)).toBe(-1);
});
