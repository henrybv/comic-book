core.controller('StoryCtrl', function($scope, story, $state, $localStorage, CameraFactory) {
	$scope.story = story;
	console.log('story in storyCTRL', $scope.story)

    if ($scope.story.squares.length === 0){
        console.log('story in if statement', $scope.story)
        $state.go('camera', {storyId: $scope.story._id})
    }

	$scope.goToCamera = function(){
		$state.go('camera', {storyId: $scope.story._id})
	}

	$scope.changeState = function() {
		$state.go('home')
	}

    var urlToNewCanvas = function(url, canvasId){
    	var canvas = document.createElement('canvas');
    	canvas.setAttribute = ('id', canvasId);
    	// canvas.setAttribute = ('width', '375');
    	// canvas.setAttribute = ('height', '375');
        var context = canvas.getContext('2d');
        var newImage = new Image();
        newImage.src = url;
        newImage.onload = function(){
            context.drawImage(newImage, 0, 0);
        }
        var elem = document.getElementById('here')
        elem.appendChild(canvas);
    }

	
// GETTING IMAGES FROM FIREBASE EVERY TIME ONE IS ADDED
    var ref = new Firebase('https://torrid-inferno-1552.firebaseio.com/' + $scope.story._id);
    ref.on('value', function(snapshot){
        var obj = snapshot.val();
        for (var squareId in obj){
        	urlToNewCanvas(obj[squareId].url, squareId);
        }
    })
});