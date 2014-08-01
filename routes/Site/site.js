
var ejs = require('ejs');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var cache = require('memory-cache');
var fs = require('fs');
var und = require(path.join(appDir,'/services/underscore'));
var dataProvider = null;

module.exports = function (app, databaseProvider) {
  app.get('/', GetAllArticles);
  dataProvider=databaseProvider;  
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

            res.render('layout', { description: 'The list of blog articles and summary of each.', body: "<div class=\"blogSummary\">" + LoadTemplate(filePath, { blog: d }) + "</div>", title: "F Bomb Code Blog Summary" });
            res.end();
        },
        TableName: 'article',
        WhereClause: null,
        Parameters: null
    }

    ProcessRoute(RenderDataWithSession, res, RenderObject, 'Home');
};

function RenderDataWithSession(obj) {

    if (cache.get(obj.AppKey) != null) {
        if (process.env.DEBUGLOGGING) {
            console.log(obj.MethodName + ' has cache');
        }

        var data = cache.get(obj.AppKey);
        
        if(obj.cacheTime != null)
        {
            cache.del(obj.AppKey);
            cache.put(obj.AppKey, data, obj.cacheTime);
        }
        obj.Render(data, '', obj.MethodName);
    }
    else {
        if (process.env.DEBUGLOGGING) {
            console.log(obj.MethodName + ' has no cache');
        }

        dataProvider.getQuery(obj, function (error, data) {

            if (process.env.DEBUGLOGGING) {
                console.log(obj.MethodName + ' successfully queried');
            }

            if (data != null) {
                if (process.env.DEBUGLOGGING) {
                    console.log(obj.MethodName + ' has data.');
                }

                if(obj.cacheTime != null ){
                    cache.put(obj.AppKey, data, obj.cacheTime);
                }
                else{
                    cache.put(obj.AppKey, data, 86400000);
                }
                obj.Render(cache.get(obj.AppKey), '', obj.MethodName);
            }
            else {
                if (process.env.DEBUGLOGGING) {
                    console.log(obj.MethodName + ' has no data.');
                }

                obj.Render('', '', obj.MethodName);
            }
        });
    }
}

function RenderDataNoCache(obj) {

    if (process.env.DEBUGLOGGING) {
        console.log(obj.MethodName + ' has no cache');
    }

    dataProvider.getQuery(obj, function (error, data) {

        if (process.env.DEBUGLOGGING) {
            console.log(obj.MethodName + ' successfully queried');
        }

        if (data != null) {
            if (process.env.DEBUGLOGGING) {
                console.log(obj.MethodName + ' has data.');
            }

            obj.Render(data, '', obj.MethodName);
        }
        else {
            if (process.env.DEBUGLOGGING) {
                console.log(obj.MethodName + ' has no data.');
            }

            obj.Render('', '', obj.MethodName);
        }
    });
}

function LoadTemplate(filePath, data) {
    var template = fs.readFileSync(filePath, 'utf8');
    return ejs.render(template, data);
}

function ProcessRoute(functionToExecute, response, parametersToUse, name) {
    if (process.env.DEBUGLOGGING) {
        console.log("Starting " + name);
        console.log("Parameters: " + JSON.stringify(parametersToUse));
    }
    response.etagify();

    var i = 0;
    while (i < 3) {
        if (Retry(functionToExecute, parametersToUse)) {
            break;
        }
        else {
            i++;
        }
    }

    if (i >= 3) {
        if (process.env.DEBUGLOGGING) {
            console.log("The number of retries were: " + i + ", so going to error out.");
        }

        DisplayErrorPage(response);
    }

    if (process.env.DEBUGLOGGING) {
        console.log("Ending " + name);
    }
}

function DisplayErrorPage(response) {
    response.set('Cache-Control', 'no-cache');
    response.render('Error', {});
    response.end();
}

function Retry(myFunction, value1) {
    var result = false;
    try {
        myFunction(value1);
        result = true;
    }
    catch (err) {
        result = false;
        if (process.env.DEBUGLOGGING) {

            console.log(err);
            console.log('Failed to process...Retrying...');
        }
    }
    return result;
}