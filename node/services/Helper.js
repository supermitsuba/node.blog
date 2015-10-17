var fs = require('fs');
var ejs = require('ejs');

exports.RenderData = function(obj, dataProvider) {
    dataProvider.GetEntities(obj.TableName, function (error, data) {
        if (process.env.DEBUGLOGGING) {
            console.log('%s successfully queried', obj.TableName);
        }

        if (data != null) {
            if (process.env.DEBUGLOGGING) {
                console.log('%s has data.', obj.TableName);
            }

            obj.Render(data, '', obj.TableName);
        }
        else {
            if (process.env.DEBUGLOGGING) {
                console.log('%s has no data.', obj.TableName);
            }

            obj.Render('', '', obj.TableName);
        }
    });
}

exports.LoadFile = function(filePath){
    return fs.readFileSync(filePath, 'utf8');
};

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

exports.curiesLink = [{ "name": "fbomb", "href": "http://fbombcode.com/api/documentation/#{rel}", "templated": true }];
    
exports.isArray = isArray;    
function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
};

exports.isObject = isObject;
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
};

exports.escapeEntities = escapeEntities;
function escapeEntities(str) {
    return str.replace(/[&<>]/g, function(key) {
        return entitiesMap[key];
    });
}

exports.escapeJSON = escapeJSON;
function escapeJSON(data) {
    var length, key, i;
    if (isObject(data)) {
        for (key in data) {
            if (data.hasOwnProperty(key)) {
                if (typeof data[key] === 'object') {
                    escapeJSON(data[key]);
                } else if (typeof data[key] === 'string') {
                    data[key] = escapeEntities(data[key]);
                }
            }
        }
        return;
    }
    if (isArray(data)) {
        for (i = 0, length = data.length; i < length; i++) {
            escapeJSON(data[i]);
        }
    }
};