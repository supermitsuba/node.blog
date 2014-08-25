var validator = require('validator').sanitize;
var path = require('path');
var und = require('../../services/underscore');
var helper = require('../../services/Helper');
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  app.get('/Projects', GetAllProjects);
  app.get('/AboutMe', AboutMe);
  app.get('/Search/:text', Search);
  app.get('/rss', rss);
  app.post('/clear', clear);

  dataProvider=database;
  smtpProvider = smtp;  
};

function GetAllProjects(req, res) {
    var categoryId = 7;
    var paging = 0;

    var RenderObject = {
        Render: function (data, category, title) {
            var d = und.where(data, { PartitionKey: 'Project' })
            d = und.sortBy(d, function (item) { return item.DateOfArticle; }).reverse();

            var filePath = 'public/partials/BlogSummary.html';
            res.render('layout', { description: 'This is a list of projects I have created as hobbies of mine.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { blog: d }) + "</div>", title: "F Bomb Code Blog Summary" });
            res.end();
        },
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, 'Projects', dataProvider);
}

function AboutMe(req, res) {
    var RenderObject = {
        Render: function (data, category, title) {
            var d = und.where(data, { PartitionKey: 'AboutMe' })
            res.render('layout', { description: 'This page is about me, Jorden Lowe.  I am a Software developer from Detroit, here to talk about code and coding practices.', body: d[0].Post, Category: category, title: d[0].Title });
            res.end();
        },
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, 'About Me', dataProvider);
}

function Search(req, res) {
    var searchParameter = validator(req.params.text).xss();
    var paging = 0;

    var RenderObject = {
        Render: function (data, category, title) {

            var d = und.filter(data, function (item) { return item.Post.indexOf(searchParameter) > 0; });
            var searchResults = { blog: d };
            res.send(searchResults);
            res.end();
        },
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, "search with search parameter:'" + searchParameter + "'", dataProvider);
}

function rss(req, res) {
    var paging = 0;

    var RenderObject = {
        Render: function (data, category, title) {
            var filePath = 'public/partials/rssTemplate.xml';
            var d = und.sortBy(data, function (item) { return item.DateOfArticle; }).reverse();
            d = und.filter(d, function (item) { return item.PartitionKey != 'Project' && item.PartitionKey != 'AboutMe'; });

            res.set('Content-Type', 'application/xml');
            res.send(helper.LoadTemplate(filePath, { rss: d }));
            res.end();
        },
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, "rss", dataProvider);
}

function clear(req, res){
    if(req.body.super == 'mitsuba')
    {
        dataProvider.ClearAll();

        var mailOptions = {
            from: "fbombcode@gmail.com", // sender address
            to: "supermitsuba@gmail.com", // list of receivers
            subject: "Server cache was reset.", // Subject line
            html: "Hope that was you" // html body
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
    }
    res.send("OK");
    res.end();
}
