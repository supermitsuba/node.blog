var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var event = require(path.join(appDir,'/models/event'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  	app.get('/api/events', GetAllEvents);

  	dataProvider=database;
  	smtpProvider = smtp;  
};

function GetAllEvents(req, res){
	//
	dataProvider.GetEntities('event', function(error, obj){
        //do a lookup for all unique events in the articles that come
        //back and cache the articles and events separately
        var arrayOfEvents = [];

        for(var i = 0; i < obj.length; i++){
            var a = new event( obj[i].RowId, obj[i].WebLink, obj[i].DateOfEvent, obj[i].EventDate, obj[i].EventName, obj[i].Sort );
            arrayOfEvents.push(a);
        }

        //also need to do some paging
        res.send(JSON.stringify(arrayOfEvents));
        res.end();
    });
}

function GetEventsById(req, res){
    //same as above, just for one
}