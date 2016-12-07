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
		function($scope, $window, $rootScope, $http, userService, $filter, dialogFactory) {
			$scope.about = "The Book Barter web-app is a new platform to share the books. Long gone are the days when people will wait for a book " +
            	"to arrive in stock or waiting for price to drop for purchasing book. This website encourages people to share books for free according to their requirements." + 
            	" This is the era where internet has become a part of social culture. People are connected to each other via internet nowadays, so our creative team thought of "+
            	"sharing knowledge in the society via internet."
            	
            	$scope.query="";
				userService.getAllRequestedBooks().then(function(data, err){
					$scope.requested = data.data.books;
					//console.log($scope.requested);
				})
				$scope.search=function(){
				userService.getSomeBooks($scope.query, $scope.selectedState_, $scope.selectedCity_).then(function(data, err){
            		$scope.searched = data.data.data;
					$scope.searchedBooks = $filter('filter')($scope.searched, $scope.query);
					//console.log($scope.searchedBooks);
				})
				
				}
				$scope.notInRequestedBooks = function(id){
					return $scope.requested.indexOf(id) == -1?false:true;
				}
				/* State and cities*/
				$scope.cities_ = userService.getAllCities();

				$scope.states_ = [{ id: 1, name: 'Maharashtra' },
				                { id: 2, name: 'Odisha' },
				                { id: 3, name: 'Jharkhand' },
				                { id: 4, name: 'Karnataka' },
				                { id: 5, name: 'Bihar' },
				                { id: 6, name: 'Uttar Pradesh' },
				                ];
				$scope.getCity_ = function(){
					return $filter('filter')($scope.cities_, $scope.selectedState_ );
				}
				$scope.isSelected_ = function(){
					if($scope.selectedState_ == null)
						return true;
					else return false;
				}
				$scope.change_ = function(val){$scope.selectedState_ = val;}
				$scope.changeCity_ = function(val){$scope.selectedCity_ = val;}
				/* state and cities ends */
				$scope.requestBook = function(bid,aid){
					console.log(aid  + '  '  + bid);
					$http.put('/api/v1/user/request/' + aid + '/' + bid).success(
							function(data) {
								dialogFactory.showToast(data.success);
								userService.getAllRequestedBooks().then(function(data, err){
									$scope.requested = data.data.books;
									//console.log($scope.requested);
								})
							}).error(function(data) {
					
					});
				}
            
		})
.controller('requestedController',
		function($scope, $window, $rootScope, userService, $route, $http) {
		userService.getAllRequestedBooks().then(function(data, err){
			$scope.requested = data.data.books;
			$scope.books=[];
			for(var i=0;i<$scope.requested.length;i++){
				userService.getBookById_($scope.requested[i]).then(function(data, err){
					$scope.books.push(data.data);
				})
			}
		})
		
		userService.getAllAcceptedBooks().then(function(data, err){
			$scope.accepted = data.data.books;
			$scope.acceptedBooks=[];
			for(var i=0;i<$scope.accepted.length;i++){
				userService.getBookById_($scope.accepted[i]).then(function(data, err){
					$scope.acceptedBooks.push(data.data);
				})
			}
		})
		$scope.returnBook = function(id, __id){
			console.log(__id);
			$http.put('/api/v1/user/returnbook/' + id + '/' + __id).success(function(data){
				$route.reload();
			})
		}
		})
.controller('notificationController',
		function($scope, $http, $window, $rootScope, userService, $filter, $route) {
			$scope.askedBooks = [];
			userService.getUserBooks().then(function(data, err){
					$scope.books = data.data.books;	
					
					angular.forEach($scope.books, function(book,i) {
						if(book.requestors.length>0)
							$scope.askedBooks.push(book);
							var requests=[]
							angular.forEach(book.requestors, function(request, j) {
								userService.getUserById(request).then(function(data,err){
									data.data.user.id = request;
									requests.push(data.data.user);
								})
							});
							$scope.askedBooks[i].req = requests;
					});
			})
			console.log($scope.askedBooks);
			$scope.acceptTrade = function(tid, bid){
				console.log(tid);
				console.log(bid);
				$http.put('/api/v1/user/acceptTrade/' + tid + '/' + bid).success(function(data){
					$route.reload();
				})
			}
			//console.log($scope.askedBooks)
		})
.controller('bookPreviewController',
		function($scope, $rootScope, userService, $http, dialogFactory, $mdDialog) {
			$scope.book = userService.getBookById($rootScope.id)[0];
			
			//console.log($rootScope.__id);
			$scope.deleteBook=function(){
		//		console.log($rootScope.__id);
				$http.delete('/api/v1/user/book/' + $scope.book._id + '/' + $rootScope.__id).success(function(data){
					userService.getUserBooks().then(function(data, err){
						$rootScope.books = data.data.books;
					})
					$scope.cancel();
				}).error(function(err){
					dialogFactory.showToast(err.error);
				});
			}
		})
.controller('userProfileController',
		function($scope, $rootScope, userService, $http, dialogFactory, $mdDialog, $routeParams) {
			userService.getUserById_($routeParams.userId).then(function(data, err){
				$scope.user = data.data.user;
				//console.log($scope.user)
			});
		})
.controller('bookController',
		function($scope, $window, $rootScope, $filter, $mdDialog, $http, dialogFactory, userService) {
			userService.getUserBooks().then(function(data, err){
					$rootScope.books = data.data.books;
			})
		$scope.reset = function(){
				$scope.selectedType='';
				$scope.selectedCategory=''
			}
		$scope.getSubCat = function() {
			if($scope.bookInfo.info.genre.bookType == null || $scope.bookInfo.info.genre.bookType == undefined)
				return null;
			var filteredCategory = $filter('filter')($scope.types,$scope.bookInfo.info.genre.bookType);
			var value = filteredCategory[0].categories;
			return value;
		};
		$scope.getSubCat2 = function() {
			var filteredCategory2 = $filter('filter')($scope.types,$scope.selectedType);
			var value = filteredCategory2[0].categories;
			return value;
		};
		$scope.setType = function(val){
			$scope.bookInfo.info.genre.bookType = val;
		}
		$scope.setCat = function(val){
			$scope.bookInfo.info.genre.category = val;
		}
		$scope.bookInfo = {
				__id:{},
				info:{
					date:new Date(),
					title : null,
					description : null,
					picture:null,
					ISBN:null,
					available:true,
					genre:{
						bookType:null,
						category:'',
					}
				}
		}
		
		$scope.submitBook = function(){
			$scope.bookInfo.__id = $rootScope.__id;
			console.log($scope.bookInfo);
			$http.post('/api/v1/book/newbook',
					$scope.bookInfo).success(
					function(data) {
						dialogFactory.showToast(data.success);
						userService.getUserBooks().then(function(data, err){
							$rootScope.books = data.data.books;
						})
						$scope.bookInfo = {
								__id:{},
								info:{
									date:new Date(),
									title : null,
									description : null,
									picture:null,
									ISBN:null,
									available:true
								}
						}
						$scope.hide();		
					}).error(function(data) {
			
			});
		}
		$scope.openBookPreview=function(_id){
			$rootScope.id = _id;
			$mdDialog.show({
				templateUrl : './views/dialogs/bookPreview.html',
				parent : angular.element(document.body),
				controller: 'bookPreviewController',
				scope : $scope.$new(),
				clickOutsideToClose : true,
			});
		}
//

//
		$scope.types = [ {
				name : "Literature",
				categories : [ {
					name : "Action & Adventure"
				}, {
					name : "Literary Collections"
				}, {
					name : "Fantacy"
				}, {
					name : "Comics"
				} ]
			}, {
				name : "Non Fiction",
				categories : [ {
					name : "Biograhies and Autobiographies"
				}, {
					name : "Business & Investing"
				}, {
					name : "Health & Fitness"
				}, {
					name : "History & Politics"
				}, {
					name : "Self Help"
				} ]
			}, {
				name : "Academic",
				categories : [ {
					name : "Entrance Exams"
				}, {
					name : "School Books"
				}, {
					name : "Engineering"
				}, {
					name : "Medicine"
				}, {
					name : "Commerce"
				} ]
			}, {
				name : "Children & Teens",
				categories : [ {
					name : "Fantacy"
				}, {
					name : "Romance"
				}, {
					name : "Knowledge & Learning"
				}, {
					name : "Early Skill Building"
				}, {
					name : "Students"
				} ]
			} ];
			$scope.addBook=function(){
				$mdDialog.show({
					templateUrl : './views/dialogs/newbook.html',
					parent : angular.element(document.body),
					controller: 'bookController',
					scope : $scope.$new(),
					clickOutsideToClose : true,
				});
			}
			$scope.cancel = function() {
				$mdDialog.cancel();
			};

			$scope.hide = function() {
				$mdDialog.cancel();
			};

			
})
.controller('profileController',
		function($scope, $window, $rootScope, userService, $filter, $http) {
		userService.getUser().then(function(data,err){
			if(data!=null){
				$rootScope.user=data.data;
				$scope.selectedState = $rootScope.user.profile.address.state;
				$scope.selectedCity = $rootScope.user.profile.address.city;
				//console.log($rootScope.user.address);
				userService.getUserId().then(function(data,err){
				$rootScope.__id=data.data.id;
			})
				
		}}) 
		/* - - - For Editing basic info | When edit is clicked ---*/ 
		$scope.edit = false;
		$scope.editBasicInformation = function(){
			$scope.edit = true;
			$scope.prev = $rootScope.user.profile.address;
		}
		$scope.cancelBasic = function(){
			userService.getUser().then(function(data,err){
				if(data!=null){
					$rootScope.user=data.data;
					userService.getUserId().then(function(data,err){
					$rootScope.__id=data.data.id;
				})
			}})
			$scope.edit = false;
		}
		$scope.submitBasic = function(){
			$scope.prev = {};
			$scope.address={city:$scope.selectedCity, state:$scope.selectedState, about : $rootScope.user.profile.address.about};
			//console.log($scope.address);
			$http.put('/api/v1/user/me/updateInfo',$scope.address)
			.success(function(data){
				//console.log(data);
				userService.getUser().then(function(data,err){
					if(data!=null){
						$rootScope.user=data.data;
						userService.getUserId().then(function(data,err){
						$rootScope.__id=data.data.id;
					})
				}})
				$scope.edit = false;
			})
			.error(function(data){
				console.log(data);
			})
			
		}
		/* - - - -  Loading of States and Cities - - - - - */
		
		$scope.states = [{ id: 1, name: 'Maharashtra' },
		                { id: 2, name: 'Odisha' },
		                { id: 3, name: 'Jharkhand' },
		                { id: 4, name: 'Karnataka' },
		                { id: 5, name: 'Bihar' },
		                { id: 6, name: 'Uttar Pradesh' },
		                ];
		$scope.getCity = function(){
			return $filter('filter')($scope.cities, $scope.selectedState );
		}
		$scope.isSelected = function(){
			if($scope.selectedState == null)
				return true;
			else return false;
		}
		$scope.change = function(val){$scope.selectedState = val;}
		$scope.changeCity = function(val){$scope.selectedCity = val;}
		$scope.cities =  userService.getAllCities();		
})
.directive('barterHeader', function(){
	return {
		templateUrl: './views/components/header.html',
		controller: 'profileController'
	}
})
.directive('barterAbout', function(){
	return {
		templateUrl: './views/components/profile_about.html',
		controller: 'profileController'
	}
})
.directive('barterBar', function() {
  return {
    templateUrl: './views/components/toolbar.html',
    controller: 'loginController'
  };
})
.directive('barterBookarea', function() {
  return {
    templateUrl: './views/components/bookarea.html',
    controller: 'bookController'
  };
})
.directive('barterToolbar', function() {
  return {
    templateUrl: './views/components/miniToolbar.html',
    controller: 'bookController'
  };
});