var validator = require('validator').sanitize;
var path = require('path');
var und = require('../../services/underscore');
var helper = require('../../services/Helper');
var comment = require('../../models/comment');
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
	app.get('/api/comments/:articleId', GetAllCommentsByArticleId);

  	dataProvider=database;
  	smtpProvider = smtp;  
};

function GetAllCommentsByArticleId(req, res){
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

    if (req.params.articleId) {
        if(isNaN(req.params.articleId)){
            res.send(400, 'Article id must be a number.');
            res.end();
            return;
        }
    }

	dataProvider.GetEntities('comments', function(error, obj){
        //do a lookup for all unique comments in the articles that come
        //back and cache the articles and comments separately
        if(error){
            DisplayErrorPage(res);
        }
        var arrayOfComments = [];

        if(req.query.q && req.query.q !== ''){
            obj = und.filter(obj, function (item) { return item.Comment.indexOf(validator(req.query.q).xss()) > 0; });
        }

        obj = und.filter(obj, function(item){ return item.PartitionKey == req.params.articleId })

        for(var i = 0; i < obj.length; i++){
            var a = new comment( obj[i].Name, obj[i].Comment, obj[i].Date, obj[i].PartitionKey, obj[i].RowKey, obj[i].Address );
            arrayOfComments.push(a);
        }

        if (req.query.offset) {
            arrayOfComments = und.rest(arrayOfComments, req.query.offset);
        }
        
        if (req.query.limit && req.query.limit <= 25) {
            arrayOfComments = und.first(arrayOfComments, req.query.limit);
        }
        else{            
            arrayOfComments = und.first(arrayOfComments, 10);
        }
        
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.header("Content-Type", "application/json");

        res.format({
            'application/json': function(){
                //also need to do some paging
                res.send(JSON.stringify(arrayOfComments));
                res.end();
            },
            'application/vnd.collection+json': function(){
                var filePath = 'views/Hypermedia/Comments/collectionjson.ejs';
                var payload = helper.LoadTemplate(filePath, { 
                                                                'arrayOfComments':arrayOfComments, 
                                                                'limit':(req.query.limit && req.query.limit <= 25)? req.query.limit :10,
                                                                'offset':((req.query.offset)?req.query.offset: 1),
                                                                'q':(req.query.q ?req.query.q: ""),
                                                                'articleId': req.params.articleId
                                                            });
                res.send(payload);
                res.end();
            },
            'application/hal+json': function(){
                var filePath = 'views/Hypermedia/Comments/haltemplate.ejs';
                var payload = helper.LoadTemplate(filePath, { 
                                                                'arrayOfComments':arrayOfComments, 
                                                                'limit':(req.query.limit && req.query.limit <= 25)? req.query.limit :10,
                                                                'offset':((req.query.offset)?req.query.offset: 1),
                                                                'q':(req.query.q ?req.query.q: ""),
                                                                'articleId': req.params.articleId
                                                            });
                res.send(payload);
                res.end();
            }
        });
    });
}