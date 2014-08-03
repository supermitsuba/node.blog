var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  	app.get('/api/categories', GetAllCategories);
	app.get('/api/categories/:id', GetCategoriesById);

  	dataProvider=database;
  	smtpProvider = smtp;  
};

function GetAllCategories(req, res){
	//
}

function GetCategoriesById(req, res){

}