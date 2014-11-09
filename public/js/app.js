var routerApp = angular.module('fbombcode', ['ui.router']);

routerApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        .state('home', {
            url : '/home',
            views : {
                'content': {
                    templateUrl: '/partials/angular/home.html'
                },
                'sidebar': {
                    templateUrl: '/partials/angular/sidebar.html',
                    controller: function($scope) {
                        console.log('here');
                    }
                }
            }            
        });
        
        
});