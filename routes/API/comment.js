var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  	app.get('/api/comments/:articleId', GetAllCommentsByArticleId);
	app.post('/api/comments', SaveComment);

  	dataProvider=database;
  	smtpProvider = smtp;  
};

function GetAllCommentsByArticleId(req, res){
	//
}

function SaveComment(req, res){

}