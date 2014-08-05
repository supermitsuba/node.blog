var azure = require('azure');

BlogProvider = function (ac, akey, cache) {
    if(process.env.DEBUGLOGGING){
        console.log('Connecting to database.');
        console.log('Cache: %s', cache?"enabled":"disabled");
    }
    var retryOperations = new azure.ExponentialRetryPolicyFilter();
    this.TableService = azure.createTableService(ac, akey).withFilter(retryOperations);
    this.Cache = cache;
};

BlogProvider.prototype.InsertQuery = function (obj, callback) {

    var cache = this.Cache;
    this.TableService.insertEntity(obj.TableName, obj.Data, function (error) {
        if (!error) {
            cache.del(obj.TableName);
            callback(null);
        }
        else {
            callback(error);
        }
    });
}

BlogProvider.prototype.GetEntities = function(tableName, callback){
    if (this.Cache.get(tableName) != null) {
        if (process.env.DEBUGLOGGING) {
            console.log('%s has cache', tableName);
        }

        var data = this.Cache.get(tableName);        
        callback(null, data);
    }
    else {
        if (process.env.DEBUGLOGGING) {
            console.log('%s has no cache', tableName);
        }

        var query = azure.TableQuery
                         .select()
                         .from(tableName);//.top(10);

        var cache = this.Cache;
        this.TableService.queryEntities(query, function(error, entities){ 
            if (error) {
                callback(error, null);
            }

            if (entities != null) {
                if (process.env.DEBUGLOGGING) {
                    console.log('%s has entities.', tableName);
                }

                cache.put(tableName, entities, 86400000);
                callback(null, entities);
            }
            else {
                if (process.env.DEBUGLOGGING) {
                    console.log('%s has no data.', tableName);
                }
                
                callback(null, null);
            }
        });
    }
}

exports.BlogProvider = BlogProvider;