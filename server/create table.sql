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
drop table IF EXISTS PlotTempratures;

CREATE TABLE IF NOT EXISTS PlotTempratures (
	plotId Text PRIMARY KEY,
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


delete from PlotTempratures;


INSERT INTO `PlotTempratures` (plotId,janTDay,febTDay,marTDay,aprTDay,mayTDay,junTDay,julTDay,augTDay,sepTDay,octTDay,novTDay,decTDay,janTNight,febTNight,marTNight,aprTNight,mayTNight,junTNight,julTNight,augTNight,sepTNight,octTNight,novTNight,decTNight)
VALUES ("0C0EB1BE0C16F10B47FD",18.5,19.5,23,27,34.5,36.5,39.5,39.5,37,31,26,20.5,7.5,7.5,9,12,17,20,24,24,21,18,13,9.5);

INSERT INTO `PlotTempratures` (plotId,janTDay,febTDay,marTDay,aprTDay,mayTDay,junTDay,julTDay,augTDay,sepTDay,octTDay,novTDay,decTDay,janTNight,febTNight,marTNight,aprTNight,mayTNight,junTNight,julTNight,augTNight,sepTNight,octTNight,novTNight,decTNight)
VALUES ("0EFF89E7F716F10FB533",18.5,19.5,23,27,33,35,38,38,35.5,31,26,20.5,8.5,8.5,10,13,17,20,24,24,21.5,18,13.8,10.5);

INSERT INTO `PlotTempratures` (plotId,janTDay,febTDay,marTDay,aprTDay,mayTDay,junTDay,julTDay,augTDay,sepTDay,octTDay,novTDay,decTDay,janTNight,febTNight,marTNight,aprTNight,mayTNight,junTNight,julTNight,augTNight,sepTNight,octTNight,novTNight,decTNight)
VALUES ("08BBA0314716F1122C26",17.5,19,23,27.5,33.5,37.5,39.5,39.5,36,32,25.5,19.5,7.5,8,10,13.5,17.5,20.5,23.5,24.5,22,19,13.5,9.5);

INSERT INTO `PlotTempratures` (plotId,janTDay,febTDay,marTDay,aprTDay,mayTDay,junTDay,julTDay,augTDay,sepTDay,octTDay,novTDay,decTDay,janTNight,febTNight,marTNight,aprTNight,mayTNight,junTNight,julTNight,augTNight,sepTNight,octTNight,novTNight,decTNight)
VALUES ("0B43D4914116F111112C",17.5,18.5,22,26,31,33,36,36,34,29,25,19.5,7.5,7.5,9,12,15,18,22,22,20,16,13,9.5);

CREATE TABLE IF NOT EXISTS PlotHumidity (
	plotId Text PRIMARY KEY,
	jan Real,
	feb Real,
	mar Real,
	apr Real,
	may Real,
	jun Real,
	jul Real,
	aug Real,
	sep Real,
	oct Real,
	nov Real,
	dec Real
);

delete from PlotHumidity;

INSERT INTO `PlotHumidity` (plotId,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec)
VALUES ("0C0EB1BE0C16F10B47FD",71,72,68,62,57,59,60,62,61,60,61,70);

INSERT INTO `PlotHumidity` (plotId,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec)
VALUES ("0EFF89E7F716F10FB533",71,72,68,62,57,59,60,62,61,60,61,70);

INSERT INTO `PlotHumidity` (plotId,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec)
VALUES ("08BBA0314716F1122C26",75,73,66,56,51,52,52,54,53,54,57,68);

INSERT INTO `PlotHumidity` (plotId,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec)
VALUES ("0B43D4914116F111112C",68,70,65,57,52,55,59,61,58,55,55,64);
