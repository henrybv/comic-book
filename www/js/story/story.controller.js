core.controller('StoryCtrl', function($scope, story, $state, $localStorage, CameraFactory) {
	$scope.story = story;
    // $scope.urlbaby;
	// console.log('story in storyCTRL', $scope.story)

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
        canvas.id = canvasId;
        canvas.width = canvas.height = 115;
        var context = canvas.getContext('2d');
        var newImage = new Image();
        var elem = document.getElementById('here')
        elem.appendChild(canvas);
        newImage.src = url;
        newImage.onload = function(){
            context.drawImage(newImage, 0, 0, newImage.width, newImage.height, 0, 0, canvas.width, canvas.height);
        }
    }

	
// GETTING IMAGES FROM FIREBASE EVERY TIME ONE IS ADDED
    var ref = new Firebase('https://torrid-inferno-1552.firebaseio.com/' + $scope.story._id);
    ref.on('value', function(snapshot){
        var here = document.getElementById('here');
            console.log('Firebase Div:', here)
        while (here.firstChild){
            // console.log('HERE FIRST CHILD', here.firstChild)
            here.removeChild(here.firstChild);
        }
        var obj = snapshot.val();
        for (var squareId in obj){
        	urlToNewCanvas(obj[squareId].url, squareId);
        }
    })

    // // var ref2 = new Firebase('https://torrid-inferno-1552.firebaseio.com/573a15210df53e1e9b2b357d/573a15210df53e1e9b2b357d/573a1b3d0df53e1e9b2b358e');
    // var ref2 = new Firebase('https://torrid-inferno-1552.firebaseio.com/573a15210df53e1e9b2b357d');
    // ref2.once('child_added', function(snapshot){
    //     var obj = snapshot.val();
    //     $scope.urlbaby = obj.url;
    //     urlToNewCanvas(obj.url, 'bananas')
    // })
});