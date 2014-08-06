var validator = require('validator').sanitize;
var path = require('path');
var und = require('../../services/underscore');
var helper = require('../../services/Helper');
var dataProvider = null;
var smtpProvider = null;

module.exports = function (app, database, smtp) {
    this.dataProvider = database;
    this.smtpProvider = smtp;

    app.get('/Categories', GetAllCategories);
    app.get('/Category/:id', GetArticlesByCategory);
}

function GetAllCategories(req, res) {
    var RenderObject = {
        Render: function (data, category, title) {
            var filePath = 'public/partials/Category.html';


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
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, 'Categories', this.dataProvider);
}

function GetArticlesByCategory(req, res) {
    var categoryId = validator(req.params.id).xss();
    var paging = 0;

    var RenderObject = {
        Render: function (data, category, title) {
            var d = und.where(data, { PartitionKey: categoryId })
                d = und.sortBy(d, function (item) { return item.DateOfArticle; }).reverse();
            var filePath = 'public/partials/BlogSummary.html';
            res.render('layout', { description: 'The list of blog articles and summary of each.', body: "<div class=\"blogSummary\">" + helper.LoadTemplate(filePath, { blog: d }) + "</div>", title: "F Bomb Code Blog Summary" });
            res.end();
        },
        TableName: 'article'
    }

    helper.ProcessRoute(helper.RenderData, res, RenderObject, 'Category with an id: ' + categoryId, this.dataProvider);
}