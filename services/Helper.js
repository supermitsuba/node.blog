var cache = require('memory-cache');
var fs = require('fs');
var ejs = require('ejs');

exports.RenderDataWithSession = function(obj, dataProvider) {

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

exports.RenderDataNoCache = function(obj, dataProvider) {

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

exports.LoadTemplate = LoadTemplate;

function LoadTemplate(filePath, data) {
    var template = fs.readFileSync(filePath, 'utf8');
    return ejs.render(template, data);
}

exports.ProcessRoute = function(functionToExecute, response, parametersToUse, name, dataProvider) {
    if (process.env.DEBUGLOGGING) {
        console.log("Starting " + name);
        console.log("Parameters: " + JSON.stringify(parametersToUse));
    }
    response.etagify();

    var i = 0;
    while (i < 3) {
        if (Retry(functionToExecute, parametersToUse, dataProvider)) {
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

exports.DisplayErrorPage = DisplayErrorPage;

function DisplayErrorPage(response) {
    response.set('Cache-Control', 'no-cache');
    response.render('Error', {});
    response.end();
}

function Retry(myFunction, value1, dataProvider) {
    var result = false;
    try {
        myFunction(value1, dataProvider);
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