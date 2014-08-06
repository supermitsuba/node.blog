var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var category = require(path.join(appDir,'/models/category'));
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

        res.format({
            'application/hal+json': function(){
                var filePath = path.join(appDir,'/views/Hypermedia/Category/haltemplate.ejs');
                var payload = helper.LoadTemplate(filePath, { 'arrayOfCategory':arrayOfCategory });
                res.send(payload);
                res.end();
            },
            'application/json': function(){
                //also need to do some paging
                res.send(JSON.stringify(arrayOfCategory));
                res.end();
            }
        });
    });
}