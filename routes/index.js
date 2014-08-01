/**
 * This module loads dynamically all routes modules located in the routes/
 * directory.
 */
var fs = require('fs');
var path = require('path');

module.exports = function (app) {
  fs.readdirSync('./routes/API').forEach(function (file) {
    // Avoid to read this current file.
    if (file === path.basename(__filename)) { return; }

    // Load the route file.
    require('./API/' + file)(app);

    if(process.env.DEBUGLOGGING){
      console.log('Loading API: %s', file);
    }
  });

  fs.readdirSync('./routes/Site').forEach(function (file) {
    // Avoid to read this current file.
    if (file === path.basename(__filename)) { return; }

    // Load the route file.
    require('./Site/' + file)(app);

    if(process.env.DEBUGLOGGING){
      console.log('Loading Site: %s', file);
    }
  });
};