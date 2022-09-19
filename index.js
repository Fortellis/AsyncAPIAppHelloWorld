/* eslint-disable no-console */
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const fs = require('fs');

const JwtVerifier = require("@okta/jwt-verifier");

const jwtVerifier = new JwtVerifier({
  issuer: `https://identity.fortellis.io/oauth2/aus1p1ixy7YL8cMq02p7`,
  clientId: "{yourAPIKey}",
  assertClaims: {
      sub: "{yourAPIKey}"
  },
});

app.use(bodyParser.json({ extended: true }), express.json());

app.post('/event/hello/world', [verifyToken], function (req, res) {
  jwtVerifier.verifyAccessToken(req.token, "api_providers").then(jwt => {
    console.log(jwt.claims.sub);
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
    })
  })
  .catch(err => {
    console.log(err);
    res.send('Unauthorized');
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Up' });
});

app.get('/', function(req, res){
  //Doesn't update dynamically
  fs.readFile('./queue.json', 'utf8', function(err, data) {
    if (err) throw err;
    console.log(data);
    res.send(data);
  });
})

function verifyToken(req, res, next) {
  //Get the authorization header in the request.
  const bearerHeader = req.headers["authorization"];
  //Check if the request has the authorization header.
  if (bearerHeader) {
      //Break the string array of the bearer token into an array of substrings.
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
  } else {
      //Send a forbidden error if the request doesn't include the bearer token.
      res.sendStatus(403);
      console.log("Forbidden user attempted to access the API.");
  }
}

app.listen(3001, '127.0.0.1');
console.log('Node server running on port 3001');
