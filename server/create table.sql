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
*/
UPDATE Plots SET product='Banana' where product='Bananas';