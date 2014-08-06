var path = require('path');
var validator = require('validator').sanitize;
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
	//must test q and other query string parameters    
    if (req.query.limit) {
        if(isNaN(req.query.limit)){
            res.send(400, 'limit must be a number.');
            res.end();
            return;
        }
    }

    if (req.query.offset) {
        if(isNaN(req.query.offset)){
            res.send(400, 'offset must be a number.');
            res.end();
            return;
        }
    }

	dataProvider.GetEntities('article', function(error, obj){
        //do a lookup for all unique events in the articles that come
        //back and cache the articles and events separately
        if(error){
            DisplayErrorPage(res);
        }
        var arrayOfArticles = [];

        if(req.query.q && req.query.q !== ''){
            obj = und.filter(obj, function (item) { return item.Post.indexOf(validator(req.query.q).xss()) > 0; });
        }

        for(var i = 0; i < obj.length; i++){
        	var a = new article(obj[i].Title, obj[i].AuthorName, obj[i].IsCommentEnabled, obj[i].IsDisabled, obj[i].PartitionKey, null, obj[i].RowKey, obj[i].DateOfArticle, obj[i].Summary );
        	arrayOfArticles.push(a);
        }
        
        arrayOfArticles = und.sortBy(arrayOfArticles, function (item) { return item.DateOfArticle; }).reverse();
        
        if(req.query.category && req.query.category !== ''){
            arrayOfArticles = und.filter(arrayOfArticles, function(item) { return item.CategoryType == validator(req.query.category).xss(); })
        }

        if (req.query.offset) {
            arrayOfArticles = und.rest(arrayOfArticles, req.query.offset);
        }
        
        if (req.query.limit && req.query.limit <= 25) {
            arrayOfArticles = und.first(arrayOfArticles, req.query.limit);
        }
        else{            
            arrayOfArticles = und.first(arrayOfArticles, 10);
        }

        res.format({
            'application/hal+json': function(){
                var filePath = path.join(appDir,'/views/Hypermedia/Articles/haltemplate.ejs');
                var payload = helper.LoadTemplate(filePath, { 
                                                                'arrayOfArticles':arrayOfArticles, 
                                                                'limit':(req.query.limit && req.query.limit <= 25)? req.query.limit :10,
                                                                'offset':((req.query.offset)?req.query.offset: 1),
                                                                'q':(req.query.q ?req.query.q: ""),
                                                                'category':(req.query.category ?req.query.category: "")
                                                            });
                res.send(payload);
                res.end();
            },
            'application/json': function(){
                //also need to do some paging
                res.send(JSON.stringify(arrayOfArticles));
                res.end();
            }
        });
    });
}

function GetArticleById(req, res){
//must test q and other query string parameters    
    if (req.params.id) {
        if(isNaN(req.params.id)){
            res.send(400, 'id must be a number.');
            res.end();
            return;
        }
    }

    dataProvider.GetEntities('article', function(error, obj){
        //do a lookup for all unique events in the articles that come
        //back and cache the articles and events separately
        if(error){
            DisplayErrorPage(res);
        }
        var articles = null;

        obj = und.filter(obj, function (item) { return item.RowKey === req.params.id; });

        for(var i = 0; i < obj.length; i++){
            var a = new article(obj[i].Title, obj[i].AuthorName, obj[i].IsCommentEnabled, obj[i].IsDisabled, obj[i].PartitionKey, obj[i].Post, obj[i].RowKey, obj[i].DateOfArticle, obj[i].Summary );
            articles = a;
            break;
        }
        
        if(articles === null){
            res.send(400, 'Invalid Id.');
            res.end();
            return;
        }

        res.format({
            'application/hal+json': function(){
                var filePath = path.join(appDir,'/views/Hypermedia/Articles/Id/haltemplate.ejs');
                var payload = helper.LoadTemplate(filePath, { 
                                                                'article':articles,
                                                                'id':(req.params.id)
                                                            });
                res.send(payload);
                res.end();
            },
            'application/json': function(){
                //also need to do some paging
                res.send(JSON.stringify(articles));
                res.end();
            }
        });
    });
}