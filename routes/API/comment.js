var validator = require('validator').sanitize;
var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var comment = require(path.join(appDir,'/models/comment'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
	app.get('/api/comments/:articleId', GetAllCommentsByArticleId);
	app.post('/api/comments', SaveComment);

  	dataProvider=database;
  	smtpProvider = smtp;  
};

function GetAllCommentsByArticleId(req, res){
	 dataProvider.GetEntities('comments', function(error, obj){
        //do a lookup for all unique comments in the articles that come
        //back and cache the articles and comments separately
        if(error){
            DisplayErrorPage(res);
        }
        var arrayOfComments = [];

        for(var i = 0; i < obj.length; i++){
            var a = new comment( obj[i].Name, obj[i].Comment, obj[i].Date, obj[i].PartitionKey, obj[i].RowKey, obj[i].Address );
            arrayOfComments.push(a);
        }

        //also need to do some paging
        res.send(JSON.stringify(arrayOfComments));
        res.end();
    });
}

function SaveComment(req, res){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) { dd = '0' + dd } if (mm < 10) { mm = '0' + mm } today = mm + '/' + dd + '/' + yyyy;

    var c = new comment(  validator(req.body.Name).xss(),
                          validator(req.body.Comment).xss().replace(/(\r\n|\n|\r)/gm, "<br>"),
                          new Date(),
                          req.body.ArticleId+'',
                          Date.now()+'',
                          req.body.Address
                         );

    if(!c.Validate(res)) return;

    var obj = {
        Data: c,
        TableName: 'comments'
    };

    dataProvider.InsertQuery(obj, function (error, data) {
        var url = req.protocol + "://" + req.get('host') + "/blog/" + c.PartitionKey+"#comments";
        var mailOptions = {
            from: "fbombcode@gmail.com", // sender address
            to: "supermitsuba@gmail.com", // list of receivers
            subject: c.Name+" has wrote a message on article: "+c.PartitionKey, // Subject line
            html: c.Name+" has wrote a message:<br /><i>"+c.Comment+"</i><br /><br />See more at: "+ url // html body
        };

        // send mail with defined transport object
        smtpProvider.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                //throw error;
            }else{
                res.send();
                res.end;
            }
        });

        res.send("");
        res.end();
    });
}