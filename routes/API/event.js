var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  	app.get('/api/events', GetAllEvents);

  	dataProvider=database;
  	smtpProvider = smtp;  
};

function GetAllEvents(req, res){
	//
}

function GetEventsById(req, res){

}