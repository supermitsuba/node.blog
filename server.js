var path = require('path');
require('./config');
require('./.config');
var BlogProvider = require('./services/BlogProvider').BlogProvider;
var BundleUp = require('bundle-up2');    
var express = require('express');
var emailer = require('nodemailer');
var cache = require('memory-cache');
var app = express();
module.exports = app;

function main() {
  var http = require('http');

  app.configure('production', function () {
    // ... ... ...
  });

  app.configure('development', function () {
    process.env.DEBUGLOGGING = true;
    process.env.PORT = 8081;
  });

  var connectionString = JSON.parse(process.env.MYSQLCONNSTR_TableConnection);
  var blogProvider = new BlogProvider(connectionString.ac, connectionString.akey, cache);
  var smtpTransport = emailer.createTransport("SMTP",{
    service: process.env.EMAILSERVICE,
    auth: {
        user: process.env.EMAILADDRESS,
        pass: connectionString.emailPassword //
    }
  });

  // Configure the application.
  app.configure(function () {
    app.set('view engine', 'ejs');
    app.set('view options', { layout: false });
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.bodyParser());
    app.use(require('etagify')());
    BundleUp(app, path.join(__dirname, 'assets.js'), {
      staticRoot: path.join(__dirname, 'public'),
      staticUrlRoot: '/',
      bundle: !process.env.DEBUGLOGGING,
      minifyCss: !process.env.DEBUGLOGGING,
      minifyJs: !process.env.DEBUGLOGGING
    });
  });
    

  var server = http.createServer(app);

  // Load all routes.
  require('./routes')(app, blogProvider, smtpTransport);

  // Listen on http port.
  server.listen(process.env.PORT);
}

main();
