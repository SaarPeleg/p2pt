var tempratures = [];
var humidity = [];
var WindSpeed = [];
var DayLength = [];

var sqlite = require("sqlite-sync"); //requiring
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
test("update should make it so tempratures is filled and is not empty", () => {
  UpdateData("0C0EB1BE0C16F10B47FD");
  expect(tempratures).not.toEqual([]);
});
test("update should make it so humidity is filled and is not empty", () => {
    UpdateData("0C0EB1BE0C16F10B47FD");
    expect(humidity).not.toEqual([]);
  });
  test("update should make it so DayLength is filled and is not empty", () => {
    UpdateData("0C0EB1BE0C16F10B47FD");
    expect(DayLength).not.toEqual([]);
  });
  test("update should make it so WindSpeed is filled and is not empty", () => {
    UpdateData("0C0EB1BE0C16F10B47FD");
    console.log(WindSpeed)
    expect(WindSpeed).not.toEqual([]);
  });
  
