var routerApp = angular.module('fbombcode', ['ui.router']);
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
                    controller: function($scope, $http) {
                        $http.get("/api/articles").success(function (data, status, headers, config) {
                            $scope.articles = data._embedded["fbomb:articles"];
                        }).error(function (data, status, headers, config) {
                            $scope.articles = [];
                        });
                    }
                },
                'sidebar': {
                    templateUrl: '/partials/angular/sidebar.html',
                    controller: function($scope, $http) {
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
                    }
                }
            }            
        })
        .state('category', {
            url: '/category/:categoryName',
            views : {
                'content': {
                    templateUrl: '/partials/angular/home.html',
                    controller: function($scope, $stateParams, $http) {
                        // get the id
                        var url = "/api/articles?category=" + $stateParams.categoryName; 
                        $http.get(url).success(function (data, status, headers, config) {
                            $scope.articles = data._embedded["fbomb:articles"];
                        }).error(function (data, status, headers, config) {
                            $scope.articles = [];
                        }); 
                    }
                }
            }
        })
        .state('article', {
            url: '/articles/:articleId',
            views : {
                'content': {
                    templateUrl: '/partials/angular/article.html',
                    controller: function($scope, $stateParams, $http) {
                        // get the id
                        var url = "/api/articles/" + $stateParams.articleId; 
                        $http.get(url).success(function (data, status, headers, config) {
                            $scope.article = data;
                        }).error(function (data, status, headers, config) {
                            $scope.article = [];
                        }); 
                    }
                }
            }
        });
        
        
});