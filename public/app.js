angular
		.module(
				'barterApp',
				[ 'ngRoute', 'ngMaterial', 'ngAria', 'ngMessages', 'mainDirectives', 'appRoutes'])
		.config(function($mdIconProvider, $mdThemingProvider) {
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
								//console.log(data.data);
								if(data.data.profile){
									$rootScope.isLoggedIn = true;
									$rootScope.user=data.data.profile;
									//console.log($rootScope.user)
									if ($location.path() === '/'||$location.path() === '/login'){
										$location.path('/profile')
									}
								}	
								else{
									$rootScope.isLoggedin=false;
									if($location.path()!='/'){
										$location.path('/');
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
						'$location', '$filter',
						function($q, $http, $rootScope, $location, $filter) {
							var books;
							var requestedBooks;
							return {
								getUser : function() {
									return $http.get('api/v1/user/me').success(
											function(data) {
													//console.log(data);
													user = data;
													return data;
											}).error(function(data, status) {
										if (status = status.UNAUTHORIZED) {
											return null
										}
									});
								},
								getUserId : function() {
									return $http.get('api/v1/user/me/id').success(
											function(data) {
													//console.log(data);
													return data;
											}).error(function(data, status) {
										if (status = status.UNAUTHORIZED) {
											return null
										}
									});
								},
								getUserBooks : function() {
									return $http.get('api/v1/user/userbooks').success(
											function(data) {
													//console.log(data);
													books = data.books;
													return data;
											}).error(function(data, status) {
										if (status = status.UNAUTHORIZED) {
											return null
										}
									});
								},
								getAllRequestedBooks : function(){
									return $http.get('api/v1/user/requestedBooks').success(
											function(data) {
												
													requestedBooks = data.books;
													return data;
											}).error(function(data, status) {
										if (status = status.UNAUTHORIZED) {
											return null
										}
									});
								},
								getBookById : function(id) {
									console.log(books);
									return $filter('filter')(books, id);
								},
								getSomeBooks : function(query) {
									return $http.get('/api/v1/universe/book/' + query).success(
											function(data) {
													return data;
											}).error(function(data, status) {
										if (status = status.UNAUTHORIZED) {
											return null
										}
									});
								},
								getBookById_ : function(id) {
									return $http.get('/api/v1/universe/bookbyid/' + id).success(
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
