var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, databaseProvider, smtp) {
  app.get('/GetCategories', GetCategories);
  app.get('/GetEvents', GetEvents);
  app.get('/api', GetInitialState);

  dataProvider=databaseProvider;  
  smtpProvider = smtp; 
};

function hello(req, res) {
  res.send('Hello world');
}

function GetCategories(req, res) {
    var RenderObject = {
        Render: function (data, category, title) {
            res.set('Vary', 'Accept-Encoding');

            var d = null;
                d = und.uniq(data, false, function (item) { return item.PartitionKey; });
                d = und.filter(d, function (item) { return item.PartitionKey != 'Project' && item.PartitionKey != 'AboutMe'; });

            res.send({ category: d });
            res.end();
        },
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, 'GetCategories', dataProvider);
}

function GetEvents(req, res) {
    var today = new Date();
    var RenderObject = {
        Render: function (data, category, title) {
            var today = new Date();

            var d = und.filter(data, function (item) { return new Date(item.DateOfEvent) > today });
                d = und.sortBy(d, function (item) { return item.DateOfEvent; }).reverse();

            res.set('Cache-Control', 'private');
            res.set('Vary', 'Accept-Encoding');
            res.send({ event: d });
            res.end();
        },
        TableName: 'event'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, 'GetEvent', dataProvider);
}

function GetInitialState(req, res){
    res.format({
        'application/hal+json': function(){
            var apiObject = {
                '_links': {
                    'self': { 'href':'/api' },
                    'fbomb:events':{ 'href':'/api/events?current=true' },
                    'fbomb:categories':{ 'href':'/api/categories' },
                    'fbomb:articles':{ 'href':'/api/articles' },
                    "curies": helper.curiesLink
                }
            };
            res.send(apiObject);
            res.end();
        },

        'application/json': function(){
            res.send({ message: 'The purpose of this URI is more for hypermedia API.  Below is a list of all the accept headers to discover.',
                       acceptHeaders: ['application/hal+json']});
            res.end();
        }
    });
}