var path = require('path');
var und = require('../../services/underscore');
var helper = require('../../services/Helper');
var category = require('../../models/category');
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  	app.get('/api/categories', GetAllCategories);

  	dataProvider=database;
  	smtpProvider = smtp;  
};

function GetAllCategories(req, res){


	dataProvider.GetEntities('article', function(error, obj){
        //do a lookup for all unique categories in the articles that come
        //back and cache the articles and categories separately
        if(error){
            DisplayErrorPage(res);
        }
        var arrayOfCategory = [];

        for(var i = 0; i < obj.length; i++){
            var a = new category(obj[i].PartitionKey );
            arrayOfCategory.push(a);
        }

        arrayOfCategory = und.uniq(arrayOfCategory, false, function (item) { return item.CategoryType; });
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.header("Content-Type", "application/json");
    
        res.format({
            'application/json': function(){
                //also need to do some paging
                res.send(JSON.stringify(arrayOfCategory));
                res.end();
            },
            'application/vnd.siren+json': function(){
                var filePath = 'views/Hypermedia/Category/siren.ejs';
                var payload = helper.LoadTemplate(filePath, { 'arrayOfCategory':arrayOfCategory });
                res.send(payload);
                res.end();
            },
            'application/vnd.api+json': function(){
                var filePath = 'views/Hypermedia/Category/apijson.ejs';
                var payload = helper.LoadTemplate(filePath, { 'arrayOfCategory':arrayOfCategory });
                res.send(payload);
                res.end();
            },
            'application/vnd.collection+json': function(){
                var filePath = 'views/Hypermedia/Category/collectionjson.ejs';
                var payload = helper.LoadTemplate(filePath, { 'arrayOfCategory':arrayOfCategory });
                res.send(payload);
                res.end();
            },
            'application/vnd.hal+json': function(){
                var filePath = 'views/Hypermedia/Category/haltemplate.ejs';
                var payload = helper.LoadTemplate(filePath, { 'arrayOfCategory':arrayOfCategory });
                res.send(payload);
                res.end();
            },
            'application/vnd.mason+json': function(){
                var filePath = 'views/Hypermedia/Category/mason.ejs';
                var payload = helper.LoadTemplate(filePath, { 'arrayOfCategory':arrayOfCategory });
                res.send(payload);
                res.end();
            }
        });
    });
}