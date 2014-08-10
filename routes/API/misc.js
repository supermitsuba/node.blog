var path = require('path');
var und = require('../../services/underscore');
var helper = require('../../services/Helper');
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, databaseProvider, smtp) {
  app.get('/GetCategories', GetCategories);
  app.get('/GetEvents', GetEvents);
  app.get('/api', GetInitialState);
  app.get('/api/documentation', Documentation);

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
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Content-Type", "application/json");

    res.format({
        'application/json': function(){
            res.send(
                { 
                    message: 'The purpose of this URI is more for hypermedia API.  Below is a list of all the accept headers to discover.',
                    acceptHeaders: [
                        'application/json', 
                        'application/hal+json', 
                        'application/vnd.collection+json',
                        'application/vnd.api+json',
                        'application/vnd.siren+json'
                    ]});
            res.end();
        },
        'application/vnd.siren+json': function(){
            var apiObject = { 
                "class" : [ "API" ],
                "properties":{},
                "entities": [
                    {"rel":["categories"], "href":"/api/categories"},
                    {"rel":["curies"], "href":"/api/documentation"}
                ],
                "actions": [
                    {
                        "name": "filter-events",
                        "title": "filter events",
                        "method": "GET",
                        "href": "/api/events",
                        "type": "application/vnd.siren+json",
                        "fields": [
                            { "name": "current", "type": "text", "value": "false" },
                        ]
                    },
                    {
                        "name": "filter-articles",
                        "title": "filter articles",
                        "method": "GET",
                        "href": "/api/articles",
                        "type": "application/vnd.siren+json",
                        "fields": [
                            { "name": "current", "type": "text", "value": "false" },
                            { "name": "limit", "type": "number", "value":"25"}, 
                            { "name":"offset", "type": "number", "value":"1"}, 
                            {"name":"q", "type": "text", "value":""}, 
                            {"name":"category", "type": "text", "value":""}
                        ]
                    }
                ],
                "links":[
                    {"rel":["self"], "href":"/api"},
                    
                ]
            };

            res.send(apiObject);
            res.end();
        },
        'application/vnd.api+json': function(){
            var apiObject = { 
                '_links': {
                    'self': { 'href':'/api', "type":"api" },
                    'events':{ 'href':'/api/events?current=true', "type":"events" },
                    'categories':{ 'href':'/api/categories', "type":"categories" },
                    'articles':{ 'href':'/api/articles', "type":"articles" }
                }
            };

            res.send(apiObject);
            res.end();
        },
        'application/vnd.collection+json': function(){
            var apiObject = { "collection" : 
                {
                    "version" : "1.0",
                    "href" : "http://fbombcode.com/api/",
                    "links" : [
                        {"rel" : "home", "href" : "http://fbombcode.com/api"},
                        {"rel" : "categories", "href" : "http://fbombcode.com/api/categories"},
                        {"rel" : "curies", "href": "http://fbombcode.com/api/documentation"}
                    ],
                    'items': [],
                    'queries': [
                        {"rel" : "events", "href" : "http://fbombcode.com/api/events", "prompt": "filter events", "data": [{"name":"current", "value":"", "prompt":"Current Events?"}]},
                        {"rel" : "articles", "href" : "http://fbombcode.com/api/articles", "prompt": "filter articles", "data": [{"name":"limit", "value":"", "prompt":"Number of Records"}, {"name":"offset", "value":"", "prompt":"The starting record"}, {"name":"q", "value":"", "prompt":"Search Criteria"}, {"name":"category", "value":"", "prompt":"Category Of Articles"}]}
                    ],
                    'template': {}
                } 
            };
            res.send(apiObject);
            res.end();
        },
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
        }
    });
}

function Documentation(req, res){
    res.send("Coming soon!");
    res.end();
}