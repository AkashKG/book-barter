angular.module('appRoutes', []).config(
		[ '$routeProvider', '$locationProvider',
				function($routeProvider, $locationProvider) {
					$routeProvider
					.when('/', {
						templateUrl : 'views/pages/home.html',
						controller : 'homeController'
					})
					.when('/login', {
						templateUrl : 'views/pages/home.html',
						controller : 'homeController'
					})
					.when('/profile',{
						templateUrl:'views/pages/profile.html',
						controller: 'profileController'
					})
					.when('/feed',{
						templateUrl:'views/pages/home.html',
						controller: 'homeController'
					})
					.when('/requested',{
						templateUrl:'views/pages/requested.html',
						controller: 'requestedController'
					})
					$locationProvider.html5Mode(true);

				} ]);