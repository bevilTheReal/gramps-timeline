'use strict';

var express = require('express');
var fs = require('fs');
var sql = require('sql.js')
var bodyParser = require('body-parser')

// Constants
const PORT = 8081;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
   extended: true
}));

app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => {
   res.sendFile('timeline.html', {
      root: __dirname
   });
});

app.post('/timeline-data', (req, res) => {
   var bodyParser = require('body-parser')
   var persons = performSqlQuery(req.body.from, req.body.to, req.body.name)
   console.log('From ' + req.body.from + ' to ' + req.body.to + ', ' + persons.length + ' person(s) found with name ' + req.body.name)

   var personsCount = persons.length
   var result = []
   for (var i = 0; i < personsCount; i++) {
      var person = persons[i]
		var birth = normalizeDate(person.bdate)
		// Exclude persons more than 110 year-old (case of missing year of death)
		if (person.ddate === 'Living' && birth.getFullYear() + 110 < req.body.from)
			continue
			
		var birth1 = Math.max(new Date(req.body.from, 1, 1, 1, 1, 1, 1).valueOf(), birth.valueOf())
		birth = new Date(birth1)
		
		var death
		if (person.ddate === 'Living') {
			death = new Date(req.body.to, 1, 1, 1, 1, 1, 1)
		} else {
			var death = normalizeDate(person.ddate)
			var death1 = Math.min(new Date(req.body.to, 1, 1, 1, 1, 1, 1).valueOf(), death.valueOf())
			death = new Date(death1)
		}
      
      var item = {
         id: i,
         content: person.name + ' ' + person.surname,
         start: birth.toJSON(),
         end: death.toJSON()
      }
      if (person.ddate !== 'Living') {
         item.className = 'dead'
      } else {
         item.className = 'living'
      }
      result.push(item)
   }

   res.json(result)
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

function normalizeDate(d) {
   var s = d.split('-')
   if (s[1] !== '0' && s[2] !== '0')
      return new Date(s[0], s[1], s[2], 1, 1, 1, 1)
   if (s[1] !== '0' && s[2] === '0')
      return new Date(s[0], s[1], 1, 1, 1, 1, 1)
   else
      return new Date(s[0], 1, 1, 1, 1, 1, 1)
}

function performSqlQuery(from, to, name) {
   var filebuffer = fs.readFileSync(__dirname + "/../gramps-timeline-private-data/mydb.sql")
   var db = new sql.Database(filebuffer);

   const sqlRequest = `
   SELECT DISTINCT
   SN1.surname surname,
   NM1.first_name name,
   (DT1.year1 || '-' || DT1.month1 || '-' || DT1.day1) bdate,
   CASE WHEN (DT2.year1 IS NULL)
       THEN 'Living'
       ELSE (DT2.year1 || '-' || DT2.month1 || '-' || DT2.day1)
   END ddate
   FROM person AS PS1
      JOIN link AS LK1 ON ((LK1.from_type = 'person') AND (LK1.to_type = 'name') AND (PS1.handle = LK1.from_handle))
      JOIN name AS NM1 ON (LK1.to_handle = NM1.handle)
      JOIN link AS LK11 ON ((LK11.from_type = 'name') AND (LK11.to_type = 'surname') AND (NM1.handle = LK11.from_handle))
      JOIN surname AS SN1 ON (SN1.handle = LK11.to_handle)
      JOIN link AS LK2 ON ((LK2.from_type = 'event') AND (LK2.to_type = 'date') AND (PS1.birth_ref_handle = LK2.from_handle))
      JOIN date AS DT1 ON (LK2.to_handle = DT1.handle)
      LEFT OUTER
      JOIN link AS LK4 ON ((LK4.from_type = 'event') AND (LK4.to_type = 'date') AND (PS1.death_ref_handle = LK4.from_handle))
      LEFT OUTER
      JOIN date AS DT2 ON (LK4.to_handle = DT2.handle)
      where ((DT1.year1 <= $to and DT1.year1 >= $from)
      	OR (DT2.year1 <= $to and DT2.year1 >= $from)
      	OR (DT1.year1 <= $from AND DT2.year1 >= $to)
      	OR (DT1.year1 <= $from AND DT2.year1 IS NULL)
      	) AND UPPER(SN1.surname) LIKE UPPER($name)
   ORDER BY DT1.year1 ASC;`

   var stmt = db.prepare(sqlRequest, {
      '$from': from,
      '$to': to,
      '$name': '%' + name + '%'
   });

   var result = []
   while (stmt.step())
      result.push(stmt.getAsObject())
   stmt.free();
   return result
}