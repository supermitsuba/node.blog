var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, databaseProvider, smtp) {
  app.get('/GetCategories', GetCategories);
  app.get('/GetEvents', GetEvents);

  dataProvider=databaseProvider;  
  smtpProvider = smtp; 
};

function hello(req, res) {
  res.send('Hello world');
}

function GetCategories(req, res) {
    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'Get Categories',
        Render: function (data, category, title) {
            res.set('Vary', 'Accept-Encoding');

            var d = null;
                d = und.uniq(data, false, function (item) { return item.PartitionKey; });
                d = und.filter(d, function (item) { return item.PartitionKey != 'Project' && item.PartitionKey != 'AboutMe'; });

            res.send({ category: d });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, 'GetCategories', dataProvider);
}

function GetEvents(req, res) {
    var today = new Date();
    var RenderObject = {
        MethodName: 'Get Events',
        Render: function (data, category, title) {
            var today = new Date();

            var d = und.filter(data, function (item) { return new Date(item.DateOfEvent) > today });
                d = und.sortBy(d, function (item) { return item.DateOfEvent; }).reverse();

            res.set('Cache-Control', 'private');
            res.set('Vary', 'Accept-Encoding');
            res.send({ event: d });
            res.end();
        },
        TableName: 'event',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataNoCache, res, RenderObject, 'GetEvent', dataProvider);
}