
comment = function (name,comment,date,articleId,datetimeInMS,address){
    this.Name = name;
    this.Comment = comment;
    this.Date = date;
    this.PartitionKey = articleId;
    this.RowKey = datetimeInMS;
    this.Address = address;
}

comment.prototype.Validate = function(res){
	if (this.PartitionKey < 1) {
        res.send("Your Article Id was not correct.", 406);
        res.end();
        return false;
    }

    if (this.Address != '') {
        res.send("Your Address was not correct.", 406);
        res.end();
        return false;
    }

    if (this.Name.length > 45 || this.Name.length == 0) {
        res.send("Your Name sucks or it's too long, change it.", 406);
        res.end();
        return false;
    }

    if (this.Comment.length > 2000 || this.Comment.length == 0) {
        res.send("Your Comment sucks or is too long, change it", 406);
        res.end();
        return false;
    }

    return true;
}

module.exports = comment; 