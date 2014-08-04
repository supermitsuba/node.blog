var azure = require('azure');

BlogProvider = function (debug, ac, akey) {
    if(process.env.DEBUGLOGGING){
        console.log('Connecting to database.');
    }
    var retryOperations = new azure.ExponentialRetryPolicyFilter();
    this.tableService = azure.createTableService(ac, akey).withFilter(retryOperations);
    this.debug = debug;
};

BlogProvider.prototype.getQuery = function (obj, callback) {
    if (this.debug) console.log("Calling getConnection for SP: " + obj.StoredProcedureName+" and params: "+obj.StoredProcedureParameters);
    var query = azure.TableQuery
                     .select()
                     .from(obj.TableName)

    if( obj.WhereClause != null ){
        query.where(obj.WhereClause, obj.Parameters); //('PartitionKey eq ?', 'hometasks');
    }

    this.tableService.queryEntities(query, function(error, entities){    if (this.debug) console.log('Got Connection ');
        if (error) {
            callback(error);
            return;
        }

        callback(null, entities);
    });
};

BlogProvider.prototype.addQuery = function (obj, callback) {

    this.tableService.insertEntity(obj.TableName, obj.Data, function (error) {
        if (!error) {
            callback(null);
        }
        else {
            callback(error);
        }
    });
}

BlogProvider.prototype.GetEntities = function(tableName, callback){
    var query = azure.TableQuery
                     .select()
                     .from(tableName);//.top(10);
    this.tableService.queryEntities(query, function(error, entities){    
        if (this.debug) console.log('Got Connection ');
            if (error) {
                callback(error, null);
            }
    
            callback(null, entities);
        });
}

exports.BlogProvider = BlogProvider;