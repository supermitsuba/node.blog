var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var article = require(path.join(appDir,'/models/article'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  	app.get('/api/articles', GetAllArticles);
	app.get('/api/articles/:id', GetArticleById);

  	dataProvider=database;
  	smtpProvider = smtp;  
};

function GetAllArticles(req, res){
	//gets all articles By:
		//search
		//category
		//type ( i.e. Project, AboutMe, etc. )
		//also have a state for just summary
	dataProvider.GetEntities('article', function(error, obj){
        //do a lookup for all unique events in the articles that come
        //back and cache the articles and events separately
        if(error){
            DisplayErrorPage(res);
        }
        var arrayOfArticles = [];

        for(var i = 0; i < obj.length; i++){
        	var a = new article(obj[i].Title, obj[i].AuthorName, obj[i].IsCommentEnabled, obj[i].IsDisabled, obj[i].PartitionKey, obj[i].Post, obj[i].RowKey, obj[i].DateOfArticle, obj[i].Summary );
        	arrayOfArticles.push(a);
        }

        //also need to do some paging
        res.send(JSON.stringify(arrayOfArticles));
        res.end();
    });
}

function GetArticleById(req, res){

}