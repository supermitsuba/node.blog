/**
 * This module loads dynamically all routes modules located in the routes/
 * directory.
 */
var fs = require('fs');
var path = require('path');

module.exports = function (app) {
  fs.readdirSync('./routes').forEach(function (file) {
    // Avoid to read this current file.
    if (file === path.basename(__filename)) { return; }

    // Load the route file.
    require('./' + file)(app);
  });
};