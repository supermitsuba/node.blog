var validator = require('validator').sanitize;
var path = require('path');
var appDir = path.dirname(require.main.filename);
var und = require(path.join(appDir,'/services/underscore'));
var helper = require(path.join(appDir,'/services/Helper'));
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
  app.get('/', GetAllArticles);
  app.get('/Page/:page', GetArticleByPage);
  app.get('/Title/:title', GetArticleByTitle);
  app.get('/Blog/:id', GetArticleById);
  app.get('/Comments/:blogId/:page', GetArticlesCommentsByPage);
  
  dataProvider=database;
  smtpProvider = smtp;  
};

function GetAllArticles(req, res) {
    var categoryId = -1;
    var paging = 0;

    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'BlogSummary',
        Render: function (data, category, title) {
            var filePath = path.join(appDir, 'public/partials/BlogSummary.html');
            var d = und.sortBy(data, function (item) { return item.DateOfArticle; }).reverse();
                d = und.filter(d, function (item) { return item.PartitionKey != 'Project' && item.PartitionKey != 'AboutMe'; });

            res.render('layout', { description: 'The list of blog articles and summary of each.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { blog: d }) + "</div>", title: "F Bomb Code Blog Summary" });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, 'Home', dataProvider);
};

function GetArticleByPage(req, res) {
    var categoryId = -1;
    var paging = validator(req.params.page).xss();

    var RenderObject = {
        cacheTime: 86400000,
        AppKey: 'blogSummary' + categoryId,
        MethodName: 'BlogSummary',
        Render: function (data, category, title) {
            res.send(data);
            res.end();
        },
        StoredProcedureName: 'CALL GetBlogSummary(?,?)',
        StoredProcedureParameters: [categoryId, paging]
    }

    if (debug) {
        console.log('paging: ' + paging);
    }

    if (isNaN(paging)) {
        if (paging != null) {
            DisplayErrorPage(res);
        }
        else {
            RenderObject.StoredProcedureParameters = [categoryId, 0];
            helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, 'Home', dataProvider);
        }
    }
    else {
        helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, 'Home', dataProvider);
    }
}

function GetArticleByTitle(req, res) {
    var BlogTitle = validator(req.params.title).xss();
    BlogTitle = BlogTitle.split('_').join(' ');

    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'Blog Title',
        Render: function (data, category, title) {
            var filePath = path.join(appDir, 'public/partials/Post.html');
            d = und.find(data, function (item) { return item.Title === BlogTitle; });


            var description = '' + d.Summary;
            res.set('Cache-Control', 'no-cache');
            res.render('layout', { description: description.substring(0, 147) + '...', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { post: d, url: req.headers.host }) + "</div>", title: d.Title });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, "Blog with title :'" + BlogTitle + "'", dataProvider);
}

function GetArticleById(req, res) {
    var BlogId = validator(req.params.id).xss();

    var RenderObject = {
        AppKey: 'blogSummary',
        MethodName: 'Blog',
        Render: function (data, category, title) {
            var filePath = path.join(appDir, 'public/partials/Post.html');
            d = und.find(data, function (item) { return item.RowKey === BlogId; });

            res.set('Cache-Control', 'no-cache');
            res.render('layout', { description: d.Summary.substring(0, 147) + '...', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { post: d, url: req.headers.host }) + "</div>", title: d.Title });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    if (isNaN(BlogId)) {
        helper.DisplayErrorPage(res);
    }
    else {
        helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, "Blog with blogId :'" + BlogId + "'", dataProvider);
    }
}

function GetArticlesCommentsByPage(req, res) {
    var blogId = validator(req.params.blogId).xss();
    var paging = validator(req.params.page).xss();

    var RenderObject = {
        cacheTime: 86400000,
        AppKey: 'comments/' + blogId,
        CacheKey: 'comments' + blogId,
        MethodName: 'Comments',
        Render: function (data, category, title) {
            res.set('Cache-Control', 'no-cache');

            var d = und.sortBy(data, function (item) { return new Date(item.Date); }).reverse();
            var end = (1 + parseInt(paging)) * 50;
            var start = (end-50) < 0 ? 0 : end-50;
            res.send({ comment: d.slice(start, end) });
            res.end();
        },
        TableName: 'comments',
        WhereClause: 'PartitionKey eq ?',
        Parameters: blogId
    }

    if (isNaN(blogId) && isNaN(page)) {
        helper.DisplayErrorPage(res);
    }
    else {
        helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, "comments with blogId:'" + blogId + "', page:'" + paging + "'", dataProvider);
    }
}