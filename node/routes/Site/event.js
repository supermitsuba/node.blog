
var path = require('path');
var und = require('../../services/underscore');
var helper = require('../../services/Helper');
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
        Render: function (data, category, title) {
            var today = new Date();

            var d = und.filter(data, function (item) { return new Date(item.DateOfEvent) > today });
                d = und.sortBy(d, function (item) { return item.DateOfEvent; }).reverse();
 
            var filePath = 'public/partials/Event.html';
            res.set('Cache-Control', 'no-cache');
            res.render('layout', { description: 'These are events I have recognized and wanted to share.  I do attend these and they should be great places for information.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { event: d }) + "</div>", title: 'Events I Know About' });
            res.end();
        },
        TableName: 'event'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, 'Events', dataProvider);
}