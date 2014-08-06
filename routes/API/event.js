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
    //must test current and other query string parameters
    if(req.query.current){
        var value = req.query.current.toLowerCase();
        if(value !== 'true' && value !== 'false'){
            res.send(400, 'current must be either "true" or "false"');
            res.end();
            return;
        }
    }
	//
	dataProvider.GetEntities('event', function(error, obj){
        //do a lookup for all unique events in the articles that come
        //back and cache the articles and events separately
        var arrayOfEvents = [];

        for(var i = 0; i < obj.length; i++){
            var a = new event( obj[i].RowId, obj[i].WebLink, obj[i].DateOfEvent, obj[i].EventDate, obj[i].EventName, obj[i].Sort );
            arrayOfEvents.push(a);
        }

        if(req.query.current == 'true'){
            arrayOfEvents= und.filter(arrayOfEvents, function(item){ return new Date(item.DateOfEvent) > (new Date()) });
        }

        res.format({
            'application/hal+json': function(){
                var filePath = path.join(appDir,'/views/Hypermedia/Events/haltemplate.ejs');
                res.send(helper.LoadTemplate(filePath, { 'arrayOfEvents':arrayOfEvents, 'current':'false'  }));
                res.end();
            },
            'application/json': function(){
                //also need to do some paging
                res.send(JSON.stringify(arrayOfEvents));
                res.end();
            }
        });
    });
}