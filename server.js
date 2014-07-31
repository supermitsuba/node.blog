require('./config');
var database = require('./services/database');
var express = require('express');
var app = express();
module.exports = app;

function main() {
  var http = require('http');

  // Configure the application.
  app.configure(function () {
    // ... ... ...
  });
  app.configure('production', function () {
    // ... ... ...
  });
  app.configure('development', function () {
    // ... ... ...
  });

  var server = http.createServer(app);

  // Load all routes.
  require('./routes')(app);

  // Listen on http port.
  server.listen(3000);
}

database.connect(function (err) {
  if (err) { 
    // ...
  }
  main();
});