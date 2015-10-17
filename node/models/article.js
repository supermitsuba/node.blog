article = function (title, authorName, isCommentEnabled, isDisabled, categoryType, post, id, dateOfArticle, summary ){
	this.CategoryType = categoryType,
	this.Id = id,
	this.DateOfArticle = dateOfArticle,
	this.Title = title,
	this.AuthorName = authorName,
	this.Summary= summary,
	this.Post = post,
	this.IsDisabled = isDisabled,
	this.IsCommentEnabled = isCommentEnabled
}

article.prototype.toString = function(){
	return this.Id;
}

module.exports = article; 