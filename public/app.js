angular
		.module(
				'barterApp',
				[ 'ngRoute', 'ngMaterial', 'ngAria', 'ngMessages', 'mainDirectives', 'appRoutes'])
		.config(function($mdIconProvider) {
				$mdIconProvider
					.icon('facebook', 'img/facebook.svg', 32)
					.icon('twitter', 'img/twitter.svg', 32)
					.icon('google', 'img/google.svg', 32);
		})
		.run(
				[
						'$rootScope',
						'$location',
						'userService',
						'dialogFactory',
						function($rootScope, $location, userService,
								dialogFactory) {
							userService.getUser().then(function(data) {
								console.log(data.data);
								if(data.data.user){
									$rootScope.isLoggedIn = true;
									$rootScope.user=data.data.user;
									console.log($rootScope.user)
									if ($location.path() === '/'||$location.path() === '/login'){
										$location.path('/profile')
									}
								}	
								else{
									$rootScope.isLoggedin=false;
									if($location.path()=='/'||$location.path()=='/AkashGupta'||$location.path()=='/resume'){
										
									}
									else if($location.path()!='/login'){
										$location.path('/login');
									}
								}
							}, function(err) {
								
							});
							$rootScope.user = {};
						} ])
						

		.factory(
				'dialogFactory',
				[
						'$mdDialog',
						'$mdToast',
						function($mdDialog, $mdToast) {
							return {
								showToast : function(text) {
									var toast = $mdToast.simple().content(text)
											.action('OK')
											.highlightAction(false).hideDelay(
													30000).position("top");
									$mdToast.show(toast).then(
											function(response) {
												if (response == 'ok') {
													debugger;
												}
											});
								},
								showAlert : function(title, content) {
									$mdDialog.show($mdDialog.alert()
											.clickOutsideToClose(true).title(
													title).content(content)
											.ariaLabel('Alert Dialog Demo').ok(
													'Got it!'));
								}
							}
						} ])

		.filter('reverse', function() {
			return function(items) {
				if (items)
					return items.slice().reverse();
			};
		})

		.service(
				'userService',
				[
						'$q',
						'$http',
						'$rootScope',
						'$location',
						function($q, $http, $rootScope, $location) {
							return {
								getUser : function() {
									return $http.get('api/v1/me').success(
											function(data) {
													return data;
											}).error(function(data, status) {
										if (status = status.UNAUTHORIZED) {
											return null
										}
									});
								}
							};
						} ])
						
	.factory('logoutFactory', [ '$q', '$timeout', '$http', '$rootScope',
		function($q, $timeout, $http, $rootScope) {
			return {
				logout : function() {
					var deferred = $q.defer();
					$http.get('/auth/logout').success(function(data) {
						$rootScope.isLoggedIn=false;
						$rootScope.user={};
						deferred.resolve();
					}).error(function(data) {
						
						deferred.reject();
					})
					return deferred.promise;
				},
			}
		} ]);
