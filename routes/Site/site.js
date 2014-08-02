
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
  app.get('/Projects', GetAllProjects);
  app.get('/Category/:id', GetArticlesByCategory);
  app.get('/AboutMe', AboutMe);
  app.get('/Events', GetAllEvents);
  app.get('/Categories', GetAllCategories);
  app.get('/Blog/:id', GetArticleById);
  app.get('/Comments/:blogId/:page', GetArticlesCommentsByPage);
  app.get('/Search/:text', Search);
  app.get('/rss', rss);
  app.post('/CreateComment', CreateComment);

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

function GetAllProjects(req, res) {
    var categoryId = 7;
    var paging = 0;

    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'BlogSummary',
        Render: function (data, category, title) {
            var d = und.where(data, { PartitionKey: 'Project' })
            d = und.sortBy(d, function (item) { return item.DateOfArticle; }).reverse();

            var filePath = path.join(appDir, 'public/partials/BlogSummary.html');
            res.render('layout', { description: 'This is a list of projects I have created as hobbies of mine.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { blog: d }) + "</div>", title: "F Bomb Code Blog Summary" });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, 'Projects', dataProvider);
}

function GetArticlesByCategory(req, res) {
    var categoryId = validator(req.params.id).xss();
    var paging = 0;

    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'BlogSummary',
        Render: function (data, category, title) {
            var d = und.where(data, { PartitionKey: categoryId })
                d = und.sortBy(d, function (item) { return item.DateOfArticle; }).reverse();
            var filePath = path.join(appDir, 'public/partials/BlogSummary.html');
            res.render('layout', { description: 'The list of blog articles and summary of each.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { blog: d }) + "</div>", title: "F Bomb Code Blog Summary" });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, 'Category with an id: ' + categoryId, dataProvider);
}

function AboutMe(req, res) {
    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'BlogSummary',
        Render: function (data, category, title) {
            var d = und.where(data, { PartitionKey: 'AboutMe' })
            res.render('layout', { description: 'This page is about me, Jorden Lowe.  I am a Software developer from Detroit, here to talk about code and coding practices.', body: d[0].Post, Category: category, title: d[0].Title });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, 'About Me', dataProvider);
}

function GetAllEvents(req, res) {
    var today = new Date();
    var RenderObject = {
        cacheTime: 86400000,
        MethodName: 'Events',
        Render: function (data, category, title) {
            var today = new Date();

            var d = und.filter(data, function (item) { return new Date(item.DateOfEvent) > today });
                d = und.sortBy(d, function (item) { return item.DateOfEvent; }).reverse();
 
            var filePath = path.join(appDir, 'public/partials/Event.html');
            res.set('Cache-Control', 'no-cache');
            res.render('layout', { description: 'These are events I have recognized and wanted to share.  I do attend these and they should be great places for information.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { event: d }) + "</div>", title: 'Events I Know About' });
            res.end();
        },
        TableName: 'event',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataNoCache, res, RenderObject, 'Events', dataProvider);
}

function GetAllCategories(req, res) {
    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'Categories',
        Render: function (data, category, title) {
            var filePath = path.join(appDir, 'public/partials/Category.html');


            var d = null;
            if (app.get('category') == null) {
                d = und.uniq(data, false, function (item) { return item.PartitionKey;  });
                d = und.filter(d, function (item) { return item.PartitionKey != 'Project' && item.PartitionKey != 'AboutMe'; });
                app.set('category', d);
            }
            else {
                d = app.get('category');
            }
            res.render('layout', { description: 'The categories of articles hosted on the site.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { category: d }) + "</div>", title: 'Categories of Articles' });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, 'Categories', dataProvider);
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

function Search(req, res) {
    var searchParameter = validator(req.params.text).xss();
    var paging = 0;

    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'Search',
        Render: function (data, category, title) {

            var d = und.filter(data, function (item) { return item.Post.indexOf(searchParameter) > 0; });
            var searchResults = { blog: d };
            res.send(searchResults);
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataNoCache, res, RenderObject, "search with search parameter:'" + searchParameter + "'", dataProvider);
}

function rss(req, res) {
    var paging = 0;

    var RenderObject = {
        cacheTime: null,
        AppKey: 'blogSummary',
        MethodName: 'RSS',
        Render: function (data, category, title) {
            var filePath = path.join(appDir, 'public/partials/rssTemplate.xml');
            var d = und.sortBy(data, function (item) { return item.DateOfArticle; }).reverse();
            d = und.filter(d, function (item) { return item.PartitionKey != 'Project' && item.PartitionKey != 'AboutMe'; });

            res.set('Content-Type', 'application/xml');
            res.send(helper.LoadTemplate(filePath, { rss: d }));
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    helper.ProcessRoute(helper.RenderDataWithSession, res, RenderObject, "rss", dataProvider);
}

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