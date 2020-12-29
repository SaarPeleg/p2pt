-- SQLite
/*CREATE TABLE IF NOT EXISTS Locations (
	userId INTEGER PRIMARY KEY AUTOINCREMENT,
	plots_name Text DEFAULT "Map1.kml"
) */
/*
DROP table IF EXISTS Plots;
CREATE TABLE IF NOT EXISTS Plots (
	regIg INTEGER PRIMARY KEY AUTOINCREMENT,
	userId INTEGER,
	plotId Text,
	plotName Text Not Null,
	plotSize Integer Not Null,
	soilType Text Not Null,
	product Text,
	year Text,
	productAmount REAL,
	profit REAL
);

UPDATE Plots SET product='Avocado' where plotId='0EFF89E7F716F10FB533';*/
CREATE TABLE IF NOT EXISTS PlotTempratures (
	newregIg INTEGER PRIMARY KEY AUTOINCREMENT,
	userId INTEGER,
	plotName Text,
	plotId Text,
	janTDay Real,
	febTDay Real,
	marTDay Real,
	aprTDay Real,
	mayTDay Real,
	junTDay Real,
	julTDay Real,
	augTDay Real,
	sepTDay Real,
	octTDay Real,
	novTDay Real,
	decTDay Real,
	janTNight Real,
	febTNight Real,
	marTNight Real,
	aprTNight Real,
	mayTNight Real,
	junTNight Real,
	julTNight Real,
	augTNight Real,
	sepTNight Real,
	octTNight Real,
	novTNight Real,
	decTNight Real
);


delete * from PlotTempratures

/*
INSERT INTO `PlotTempratures` (userId, plotId,plotName,janTDay,febTDay,marTDay,aprTDay,mayTDay,junTDay,julTDay,augTDay,sepTDay,octTDay,novTDay,decTDay,janTNight,febTNight,marTNight,aprTNight,mayTNight,junTNight,julTNight,augTNight,sepTNight,octTNight,novTNight,decTNight)
VALUES (0,"ג'ונגל מזרח","0C0EB1BE0C16F10B47FD",18.5,19.5,23,27,34.5,36.5,39.5,39.5,37,31,26,20.5,7.5,7.5,9,12,17,20,24,24,21,18,13,9.5);


INSERT INTO `PlotTempratures` (userId, plotId,plotName,janTDay,febTDay,marTDay,aprTDay,mayTDay,junTDay,julTDay,augTDay,sepTDay,octTDay,novTDay,decTDay,janTNight,febTNight,marTNight,aprTNight,mayTNight,junTNight,julTNight,augTNight,sepTNight,octTNight,novTNight,decTNight)
VALUES (0,"אנדרטה מערב","0EFF89E7F716F10FB533",18.5,19.5,23,27,33,35,38,38,35.5,31,26,20.5,8.5,8.5,10,13,17,20,24,24,21.5,18,13.8,10.5);

INSERT INTO `PlotTempratures` (userId, plotId,plotName,janTDay,febTDay,marTDay,aprTDay,mayTDay,junTDay,julTDay,augTDay,sepTDay,octTDay,novTDay,decTDay,janTNight,febTNight,marTNight,aprTNight,mayTNight,junTNight,julTNight,augTNight,sepTNight,octTNight,novTNight,decTNight)
VALUES (0,"דושן א'","08BBA0314716F1122C26",17.5,19,23,27.5,33.5,37.5,39.5,39.5,36,32,25.5,19.5,7.5,8,10,13.5,17.5,20.5,23.5,24.5,22,19,13.5,9.5);

INSERT INTO `PlotTempratures` (userId, plotId,plotName,janTDay,febTDay,marTDay,aprTDay,mayTDay,junTDay,julTDay,augTDay,sepTDay,octTDay,novTDay,decTDay,janTNight,febTNight,marTNight,aprTNight,mayTNight,junTNight,julTNight,augTNight,sepTNight,octTNight,novTNight,decTNight)
VALUES (0,"המעיין","0B43D4914116F111112C",17.5,18.5,22,26,31,33,36,36,34,29,25,19.5,7.5,7.5,9,12,15,18,22,22,20,16,13,9.5);
*/