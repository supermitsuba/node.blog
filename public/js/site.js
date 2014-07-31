jQuery.fn.prettify = function () { this.html(prettyPrintOne(this.html())); };

//load twitter async
!function (d, s, id) { var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https'; if (!d.getElementById(id)) { js = d.createElement(s); js.id = id; js.src = p + '://platform.twitter.com/widgets.js'; fjs.parentNode.insertBefore(js, fjs); } }(document, 'script', 'twitter-wjs');

//load google plus async
(function () {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();

$(document).ready(function () {

    $.ajax({
        url: "/GetCategories"
    }).done(CategoriesDone);

    $.ajax({
        url: "/GetEvents"
    }).done(EventsDone);

    if ($('#submitPost').length > 0) {
        $('.formatCode').each(
            function () {
                $(this).prettify();
            }
        );

        PopulateComments();

        $("#pageButton").on("click", function () {
            PopulateComments();
        });

        $('#submitPost').on("click", function () {
            if (ValidateData()) {
                $("#submitPost").toggle();
                $(".loading").toggle();
                $.ajax({
                    type: 'POST',
                    url: "/CreateComment",
                    data: { Name: $('#name').val(), Comment: $('#comment').val(), ArticleId: $('#articleId').val(), Address: $('#address').val() }
                })
                    .done(CreateCommentDone)
                    .fail(CreateCommentFail)
                    .always(CreateCommentAlways);
            }
        });
    }
    else {
        CommentsDone({ comment: [] });
    }

    $('#search').keydown(
		function (event) {
		    if (event.keyCode == 13) {
		        $.ajax({
		            url: "/Search/" + $('#search').val()
		        }).done(SearchDone);
		    }
		});
});

function PopulateComments() {
    var page = $('#page').val();
    $.ajax({
        url: "/Comments/" + $('#articleId').val() + "/" + page
    }).done(CommentsDone);
}

function CategoriesDone(results) {
    var html = new EJS({ url: '/partials/Category.html' }).render(results);
    $('#Categories').html(html);
}

function EventsDone(results) {
    var html = new EJS({ url: '/partials/Event.html' }).render(results);
    $('#Events').html(html);
}

function CommentsDone(results) {
    var html = new EJS({ url: '/partials/Comment.html' }).render(results);
    var page = parseInt($('#page').val(), 10);
    $('#page').val(page + 50);

    if (results.comment.length < 50) {
        $('#pageButton').hide();
        $('#page').val(0);
    }

    if (results.comment.length == 0 && page == 0) {
        html = "<div>No Comments.</div>";
    }

    $('.MoreComments').hide();
    $('.comments').append(html);
}

function CreateCommentDone(results) {
    $('#page').val(0);
    $('.comments').html('<h3>Comments</h3>');
    $('#pageButton').show();
    PopulateComments();
    $('#name').val("");
    $('#comment').val("");
}

function CreateCommentFail(results) {
    alert("Could not submit comments.");
}

function CreateCommentAlways(results) {
    $("#submitPost").toggle();
    $(".loading").toggle();
}

function SearchDone(results) {

    var html = "";
    if (results.blog.length > 0) {
        html = "Search Results:<br />" + new EJS({ url: '/partials/BlogSummary.html' }).render(results);
    }
    else {
        html = "There are no search results"
    }
    $('.blogSummary').html(html);
}

function ValidateData() {
    var isValid = true;
    var Name = $('#name').val();
    Name = Name.replace(/^\s+/, '').replace(/\s+$/, '');
    var Comment = $('#comment').val();
    Comment = Comment.replace(/^\s+/, '').replace(/\s+$/, '');

    var nameErrorTag = $('#nameError');
    var commentErrorTag = $('#commentError');

    nameErrorTag.hide();
    commentErrorTag.hide();
    nameErrorTag.parent().toggleClass("error", false);
    commentErrorTag.parent().toggleClass("error", false);

    if (Name.length > 45 || Name.length == 0) {
        isValid = false;
        nameErrorTag.show();
        nameErrorTag.parent().toggleClass("error", true);
    }

    if (Comment.length > 2000 || Comment.length == 0) {
        isValid = false;
        commentErrorTag.show();
        commentErrorTag.parent().toggleClass("error", true);
    }

    return isValid;
}