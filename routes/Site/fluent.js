var fs = require('fs');
var path = require('path');
var appDir = path.dirname(require.main.filename);

module.exports = function (app) {
  app.get('/Fluent2013', fluent2013);
  app.get('/Fluent2014', fluent2014);
};

function fluent2013(req, res) {
    var template = fs.readFileSync(path.join(appDir, '/views/Conference/fluent2013.html'), 'utf8');
    res.send(template);
    res.end();
};

function fluent2014(req, res) {
    var template = fs.readFileSync(path.join(appDir, '/views/Conference/fluent2014.html'), 'utf8');
    res.send(template);
    res.end();
};