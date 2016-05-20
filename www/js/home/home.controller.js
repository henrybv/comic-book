core.controller('homeCtrl', function(myStories, myCollabs, $scope, $state) {

	$scope.name = "Hello";
	$scope.myStories = myStories;
	$scope.myCollabs = myCollabs;
	$scope.showMyStories = false;
	$scope.showMyCollabs = false;
	console.log('collabs: ', $scope.myCollabs)

	$scope.changeState = function(id){
		$state.go('story', {storyId: id})
	};

	$scope.getMyStories = function() {
		$scope.showMyCollabs = false;
		$scope.showMyStories = true;
	};

	$scope.getMyCollabs = function() {
		$scope.showMyStories = false;
		$scope.showMyCollabs = true;
	};
	// $scope.userId = $localStorage.user._id
	// $scope.myStories;
	// $scope.myCollabs;
	// $scope.getMyStories = function(){
	// 	StoryFactory.getMyStories($scope.userId)
	// 	.then(function(myStories){
	// 		$scope.myStories = myStories;
	// 		$scope.showMyCollabs = false;
	// 		$scope.showMyStories = true;
	// 	})
	// }
	// $scope.getMyCollabs = function(){
	// 	StoryFactory.getMyCollabs($scope.userId)
	// 	.then(function(myCollabs){
	// 		$scope.myCollabs = myCollabs;
	// 		$scope.showMyStories = false;
	// 		$scope.showMyCollabs = true;
	// 	})
	// }


	$scope.clickPic = '/assets/logo1.PNG';

	$scope.changeSource = function() {
		$scope.clickPic = '/assets/stickers/pow.png'
		setTimeout(function() {
			$state.go('login');
		}, 300);
	};

});