angular.module('mainDirectives', [])
.controller('loginController',
		function($scope, $window, $rootScope, logoutFactory) {
			$scope.facebookLogin = function(){
				$window.open('/auth/facebook?redirect=%2Fprofile','_self');
			}
			$scope.twitterLogin = function(){
				$window.open('/auth/twitter','_self');
			}
			$scope.googleLogin = function(){
				$window.open('/auth/google','_self');
			}
			$scope.logout = function() {
				logoutFactory.logout().then(function() {
					$rootScope.isLoggedIn = false;
					$window.open('/login','_self');
				});
			};
		})
.controller('homeController',
		function($scope, $window, $rootScope) {
		
		})
.directive('barterHeader', function(){
	return {
		templateUrl: './views/components/header.html',
		controller: 'headerController'
	}
})
.directive('barterBar', function() {
  return {
    templateUrl: './views/components/toolbar.html',
    controller: 'loginController'
  };
});