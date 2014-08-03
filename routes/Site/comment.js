var validator = require('validator').sanitize;
var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  app.post('/CreateComment', CreateComment);

  dataProvider=database;
  smtpProvider = smtp;  
};

function CreateComment(req, res) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) { dd = '0' + dd } if (mm < 10) { mm = '0' + mm } today = mm + '/' + dd + '/' + yyyy;

    var comment = {
        Name: validator(req.body.Name).xss(),
        Comment: validator(req.body.Comment).xss().replace(/(\r\n|\n|\r)/gm, "<br>"),
        Date: new Date(),
        PartitionKey: req.body.ArticleId+'',
        RowKey: Date.now()+''
    }
    
    var Address= req.body.Address;

    if (comment.PartitionKey < 1) {
        res.send("Your Article Id was not correct.", 406);
        res.end();
        return;
    }

    if (Address != '') {
        res.send("Your Address was not correct.", 406);
        res.end();
        return;
    }

    if (comment.Name.length > 45 || comment.Name.length == 0) {
        res.send("Your Name sucks or it's too long, change it.", 406);
        res.end();
        return;
    }

    if (comment.Comment.length > 2000 || comment.Comment.length == 0) {
        res.send("Your Comment sucks or is too long, change it", 406);
        res.end();
        return;
    }
    var obj = {
        Data: comment,
        TableName: 'comments'
    };


    dataProvider.addQuery(obj, function (error, data) {
        var url = req.protocol + "://" + req.get('host') + "/blog/" + req.body.ArticleId+"#comments";
        var mailOptions = {
            from: "fbombcode@gmail.com", // sender address
            to: "supermitsuba@gmail.com", // list of receivers
            subject: comment.Name+" has wrote a message on article: "+req.body.ArticleId, // Subject line
            html: comment.Name+" has wrote a message:<br /><i>"+comment.Comment+"</i><br /><br />See more at: "+ url // html body
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


        cache.del('comments/' + comment.PartitionKey);

        res.set('Cache-Control', 'no-cache');
        res.send("");
        res.end();
    });
}