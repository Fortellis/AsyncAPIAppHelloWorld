/* eslint-disable no-console */
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const fs = require('fs');

app.use(bodyParser.json({ extended: true }), express.json());

app.post('/hello/world', function (req, res) {
  console.log(req.body);
  res.status(202);
  res.send(req.body);
  fs.readFile('./queue.json', 'utf-8', function (err, data) {
    if (err) throw err;
    const arrayOfObjects = JSON.parse(data);
    arrayOfObjects.queue.push(req.body);
    console.log(arrayOfObjects);
    const writer = fs.createWriteStream('./queue.json');
    writer.write(JSON.stringify(arrayOfObjects));
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Up' });
});

app.get('/hello/world', function(req, res){
  //Doesn't update dynamically
  fs.readFile('./queue.json', 'utf8', function(err, data) {
    if (err) throw err;
    console.log(data);
    res.send(data);
  });
})

app.listen(3001, '127.0.0.1');
console.log('Node server running on port 3001');
