#!/usr/bin/env node

var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.env.PORT, 10) || 4567,
    publicDir = process.argv[2] || __dirname + '/',
    path = require('path');

app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, "/index.html"));
});

app.get('/app', function (req, res) {
  res.sendFile(path.join(publicDir, "/index.html"));
});

app.get('/cashin', function (req, res) {
  res.sendFile(path.join(publicDir, "/index.html"));
});
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(publicDir));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

console.log("Server Serving %s at http://%s:%s", publicDir, hostname, port);
app.listen(port, hostname);
