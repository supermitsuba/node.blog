var validator = require('validator').sanitize;
var path = require('path');
var und = require('../../services/underscore');
var helper = require('../../services/Helper');
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  app.get('/', GetAllArticles);
  app.get('/Title/:title', GetArticleByTitle);
  app.get('/Blog/:id', GetArticleById);
  app.get('/Comments/:blogId/:page', GetArticlesCommentsByPage);
  app.get('/ng', AngularPage);
  dataProvider=database;
  smtpProvider = smtp;  
};

function AngularPage(req, res){
    var filePath = 'views/layout.html';
    res.send(helper.LoadFile(filePath));
    res.end();
};

function GetAllArticles(req, res) {
    var categoryId = -1;
    var paging = 0;

    var RenderObject = {
        Render: function (data, category, title) {
            var filePath = 'public/partials/BlogSummary.html';
            var d = und.sortBy(data, function (item) { return item.DateOfArticle; }).reverse();
                d = und.filter(d, function (item) { return item.PartitionKey != 'Project' && item.PartitionKey != 'AboutMe'; });

            res.render('layout', { description: 'The list of blog articles and summary of each.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { blog: d }) + "</div>", title: "F Bomb Code Blog Summary" });
            res.end();
        },
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, 'Home', dataProvider);
};

function GetArticleByTitle(req, res) {
    var BlogTitle = validator(req.params.title).xss();
    BlogTitle = BlogTitle.split('_').join(' ');

    var RenderObject = {
        Render: function (data, category, title) {
            var filePath = 'public/partials/Post.html';
            var d = und.find(data, function (item) { return item.Title === BlogTitle; });


            var description = '' + d.Summary;
            res.set('Cache-Control', 'no-cache');
            res.render('layout', { description: description.substring(0, 147) + '...', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { post: d, url: req.headers.host }) + "</div>", title: d.Title });
            res.end();
        },
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, "Blog with title :'" + BlogTitle + "'", dataProvider);
}

function GetArticleById(req, res) {
    var BlogId = validator(req.params.id).xss();

    var RenderObject = {
        Render: function (data, category, title) {
            var filePath = 'public/partials/Post.html';
            var d = und.find(data, function (item) { return item.RowKey.trim() === BlogId; });

            res.set('Cache-Control', 'no-cache');
            res.render('layout', { description: d.Summary.substring(0, 147) + '...', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { post: d, url: req.headers.host }) + "</div>", title: d.Title });
            res.end();
        },
        TableName: 'article'
    }

    if (isNaN(BlogId)) {
        helper.DisplayErrorPage(res);
    }
    else {
        helper.ProcessRoute(helper.RenderData, res, RenderObject, "Blog with blogId :'" + BlogId + "'", dataProvider);
    }
}

function GetArticlesCommentsByPage(req, res) {
    var blogId = validator(req.params.blogId).xss();
    var paging = validator(req.params.page).xss();

    var RenderObject = {
        Render: function (data, category, title) {
            res.set('Cache-Control', 'no-cache');

            var d = und.where(data, {PartitionKey: blogId});
                d = und.sortBy(d, function (item) { return new Date(item.Date); }).reverse();
            var end = (1 + parseInt(paging)) * 50;
            var start = (end-50) < 0 ? 0 : end-50;
            res.send({ comment: d.slice(start, end) });
            res.end();
        },
        TableName: 'comments'
    }

    if (isNaN(blogId) && isNaN(page)) {
        helper.DisplayErrorPage(res);
    }
    else {
        helper.ProcessRoute(helper.RenderData, res, RenderObject, "comments with blogId:'" + blogId + "', page:'" + paging + "'", dataProvider);
    }
}
