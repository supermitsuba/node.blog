jQuery.fn.prettify = function () { this.html(prettyPrintOne(this.html())); };

//load twitter async
!function (d, s, id) { var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https'; if (!d.getElementById(id)) { js = d.createElement(s); js.id = id; js.src = p + '://platform.twitter.com/widgets.js'; fjs.parentNode.insertBefore(js, fjs); } }(document, 'script', 'twitter-wjs');

//load google plus async
(function () {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();

var routerApp = angular.module('fbombcode', ['ui.router', 'ngSanitize']);
routerApp.run(function($http){
    $http.defaults.headers.common.Accept = 'application/vnd.hal+json';
});

routerApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        .state('home', {
            url : '/home',
            views : {
                'content': {
                    templateUrl: '/partials/angular/home.html',
                    controller: 'homeContentController'
                },
                'sidebar': {
                    templateUrl: '/partials/angular/sidebar.html',
                    controller: 'sidebarController'
                }
            }            
        })
        .state('category', {
            url: '/category/:categoryName',
            views : {
                'content': {
                    templateUrl: '/partials/angular/home.html',
                    controller: 'homeContentController'
                },
                'sidebar': {
                    templateUrl: '/partials/angular/sidebar.html',
                    controller: 'sidebarController'
                }
            }
        })
        .state('article', {
            url: '/articles/:articleId',
            views : {
                'content': {
                    templateUrl: '/partials/angular/article.html',
                    controller: 'articleContentController'
                },
                'sidebar': {
                    templateUrl: '/partials/angular/sidebar.html',
                    controller: 'sidebarController'
                },
                'comments@article':{
                    templateUrl: '/partials/angular/article-comments.html',
                    controller: 'articleCommentsController'
                }
            }
        });        
});


routerApp
    .controller('sidebarController', function($scope, $http) {
        $http.get("/api/categories").success(function (data, status, headers, config) {
            $scope.categories = data._embedded["fbomb:categories"];
        }).error(function (data, status, headers, config) {
            $scope.categories = [{'CategoryType':'Loading...'}];
        });

        $http.get("/api/events?current=true").success(function (data, status, headers, config) {
            $scope.events = data._embedded["fbomb:events"];
        }).error(function (data, status, headers, config) {
            $scope.events = [{'EventName':'Loading...'}];
        });
    })
    .controller('homeContentController', function($scope, $stateParams, $http) {
        var category = $stateParams.categoryName;
        var url = "/api/articles";

        if(category !== null && category !== '' && category !== undefined) {
            url += "?category="+ category;
        }

        $http.get(url).success(function (data, status, headers, config) {
            $scope.articles = data._embedded["fbomb:articles"];
        }).error(function (data, status, headers, config) {
            $scope.articles = [];
        }); 
    })
    .controller('articleContentController', function($scope, $stateParams, $http) {
        // get the id
        var url = "/api/articles/" + $stateParams.articleId; 
        $http.get(url).success(function (data, status, headers, config) {
            $scope.article = data;
        }).error(function (data, status, headers, config) {
            $scope.article = [];
        }); 
    })
    .controller('articleCommentsController', function($scope, $stateParams, $http) {
        // get the id
        var url = "/api/comments/" + $stateParams.articleId; 
        $http.get(url).success(function (data, status, headers, config) {
            $scope.comments = data;
        }).error(function (data, status, headers, config) {
            $scope.comments = [];
        }); 
    });