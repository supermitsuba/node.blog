require('./config');
var database = require('./services/BlogProvider');
var BundleUp = require('bundle-up2');    
var express = require('express');
var path = require('path');
var app = express();
module.exports = app;

//var blogProvider = new database.BlogProvider(debug, connectionString.ac, connectionString.akey);
//var debug = process.env.DEBUGLOGGING || false;
//var connectionString = JSON.parse(process.env.MYSQLCONNSTR_TableConnection);
//var port = process.env.PORT;
//var localDir = path.join(__dirname, env.localDirectory);

function main() {
  var http = require('http');

  // Configure the application.
  app.configure(function () {
    app.set('view engine', 'ejs');
    app.set('view options', { layout: false });
    app.use(express.static(path.join(__dirname, 'public')));
    //app.use(express.static(localDir));
    app.use(express.bodyParser());
    app.use(require('etagify')());
    BundleUp(app, path.join(__dirname, 'assets.js'), {
    staticRoot: path.join(__dirname, 'public'),
    staticUrlRoot: '/',
    //bundle: !debug,
    //minifyCss: !debug,
    //minifyJs: !debug
});
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
  //server.listen(process.env.PORT);
  server.listen(8081);
}

main();
