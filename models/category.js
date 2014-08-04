
category = function (categoryType){
	this.CategoryType = categoryType;
}

category.prototype.toString = function(){
	return this.Id;
}

module.exports = category; 