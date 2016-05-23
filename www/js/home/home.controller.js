core.controller('homeCtrl', function($localStorage, myStories, myCollabs, $scope, $state, StoryFactory) {

	$scope.name = "Hello";
	$scope.myStories = myStories;
	$scope.myCollabs = myCollabs;
	$scope.showMyStories = false;
	$scope.showMyCollabs = false;
	console.log('collabs: ', $scope.myCollabs)

	$scope.changeState = function(id){
		$state.go('story', {storyId: id})
	};
	$scope.userId = $localStorage.user._id;

	$scope.deleteStory = function(storyId){
		console.log($scope.myStories);
		var idx;
		$scope.myStories.forEach(function(story, index){
			if (story._id === storyId) idx = index;
		})
		console.log('index of story in array', idx)
		$scope.myStories.splice(idx, 1)
		console.log('clicked delelete storY')
        StoryFactory.deleteStory(storyId)
        .then(function(story){
            console.log('deleted story in controller', story)
        })
    }

    $scope.leaveCollab = function(storyId){
    	var idx;
		$scope.myStories.forEach(function(story, index){
			if (story._id === storyId) idx = index;
		})
		$scope.myCollabs.splice(idx, 1);
		StoryFactory.leaveCollab(storyId, $scope.userId)
		.then(function(){
			console.log('left collab');
		})
    }

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