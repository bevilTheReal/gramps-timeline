# Gramps-timeline

Gramps-timeline is a simple NodeJS application that aims at showing people living during the same timeframe from a Gramps DB.

It is dockerized to be easily deployed (note: I have not tested this dockerization yet).

## How to deploy

First, you need a [Gramps](https://gramps-project.org/introduction-WP/) DB exported as SQLite3 DB
using the [dedicated gramplet](https://gramps-project.org/wiki/index.php?title=SQLite_Export_Import).

Put you database in directory `../gramps-timeline-private-data/mydb.sql`
(this location should be configurable)

Install the dependencies and run the application with:

```bash
npm install
node server.js
```

The application listen on port 8081.
I should make this port configurable, but since it is intended to run in a docker container,
this configuration should rather be in the deployment of the application.

## How to use

Connect to <http://localhost:8081>, enter a start year, an end year and a name.
THe application will load all people having lived during this timeframe.
People still alive have a different color.

## TODO

This is a very first version.
I know it is not perfect, but I did not spend a lot of time on it.

The name should be optional (I added it for my tests, but it is not convenient at all).

The SQL request should be improved.
Especially, a view should be created instead of executing the full request each time.

The code must be reviewed. I am new to Javascript, but I can do better than this.

