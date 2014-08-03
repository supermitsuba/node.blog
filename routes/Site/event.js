
var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {

  app.get('/Events', GetAllEvents);

  dataProvider=database;
  smtpProvider = smtp;  
};


function GetAllEvents(req, res) {
    var today = new Date();
    var RenderObject = {
        cacheTime: 86400000,
        MethodName: 'Events',
        Render: function (data, category, title) {
            var today = new Date();

            var d = und.filter(data, function (item) { return new Date(item.DateOfEvent) > today });
                d = und.sortBy(d, function (item) { return item.DateOfEvent; }).reverse();
 
            var filePath = path.join(appDir, 'public/partials/Event.html');
            res.set('Cache-Control', 'no-cache');
            res.render('layout', { description: 'These are events I have recognized and wanted to share.  I do attend these and they should be great places for information.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { event: d }) + "</div>", title: 'Events I Know About' });
            res.end();
        },
        TableName: 'event',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataNoCache, res, RenderObject, 'Events', dataProvider);
}