var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
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
}

function GetArticleById(req, res){

}