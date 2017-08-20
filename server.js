'use strict';

const express = require('express');
var fs = require('fs');
var sql = require('sql.js')

// Constants
const PORT = 8081;
const HOST = '0.0.0.0';

// App
const app = express();
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile('timeline.html', { root: __dirname });
});

app.post('/timeline-data', (req, res) => {
   var data = [
    {id: 1, content: 'item 1', start: '2014-04-20'},
    {id: 2, content: 'item 2', start: '2014-04-14'},
    {id: 3, content: 'item 3', start: '2014-04-18'},
    {id: 4, content: 'item 4', start: '2014-04-16', end: '2014-04-19'},
    {id: 5, content: 'item 5', start: '2014-04-25'},
    {id: 6, content: 'item 6', start: '2014-04-27', type: 'point'}
  ]
  
   var filebuffer = fs.readFileSync(__dirname + "/../gramps-timeline-private-data/mydb.sql")
   var db = new sql.Database(filebuffer);
  
   const sqlRequest=`
   SELECT DISTINCT
   SN1.surname surname,
   NM1.first_name name,
   (DT1.year1 || '::' || DT1.month1 || '::' || DT1.day1) bdate,
   CASE WHEN (DT2.year1 IS NULL)
       THEN 'Living'
       ELSE (DT2.year1 || '::' || DT2.month1 || '::' || DT2.day1)
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
      where DT1.year1 < 1981 and DT1.year1 > 1970
   ORDER BY DT1.year1 ASC;`
   
   var xx = db.exec(sqlRequest)
   console.log(xx)
  
   res.json(data)
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
