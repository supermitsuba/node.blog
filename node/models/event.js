event = function (id, webLink, eventDate, dateToShow, eventName, sort){
	this.Id = id,
	this.WebLink = webLink,
	this.EventDate = eventDate,//short
	this.EventName = eventName,
	this.DateOfEvent = dateToShow,
	this.Sort = sort
}

event.prototype.toString = function(){
	return this.Id;
}

module.exports = event; 