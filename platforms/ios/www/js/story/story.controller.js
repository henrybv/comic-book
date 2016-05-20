core.controller('StoryCtrl', function($scope, story, $state, $localStorage, CameraFactory, loggedInUser, allUsers, StoryFactory, $rootScope) {
    $scope.allUsers = allUsers;
    $scope.currentUser = loggedInUser;
    $scope.allUsers = allUsers;
    $scope.clicked = false;
    $scope.collaborators = [];
    $scope.collabAdded = false;
	$scope.story = story;
    // $scope.urlbaby;
	// console.log('story in storyCTRL', $scope.story)

    // $scope.allUsers.forEach(function(user) {
    //     for (var i = 0; i < $scope.story.friends.length; i++) {
    //         if ($scope.story.friends[i]._id === user._id) {
    //             $scope.allUsers.splice(i, 1);
    //         }
    //     }
    // });

    $scope.goToCamera = function(){
        $state.go('camera', {storyId: $scope.story._id})
    }

    $scope.changeState = function() {
        $state.go('home')
    }


    var urlToNewCanvas = function(url, canvasId){
    	var canvas = document.createElement('canvas');
        canvas.id = canvasId;
        canvas.width = canvas.height = 300;
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

    });


    // ADD FRIENDS FUNCTIONALITY

    $scope.showAllUsers = function() {
        $scope.clicked = true;
    };

    $scope.addFriend = function(user) {
        $scope.collabAdded = true;
        $scope.collaborators.push(user);
        user.collabr = true;
        // $scope.searchedEmail = '';
    };

    $scope.removeCollabr = function(user) {
        var userId = user._id;
        var collabArr = [];
        $scope.collaborators.forEach(function(collbr) {
            collabArr.push(collbr._id);
        });
        var index = collabArr.indexOf(userId);
        $scope.collaborators.splice(index, 1);
        user.collabr = false;
    };


    $scope.addCollaborators = function() {
        var collabsIds = $scope.collaborators.map(function(collabr) {
            return collabr._id;
        });

        $scope.clicked = false;
        $scope.collaborators = [];
        $scope.collabAdded = false;

        StoryFactory.addCollaborators($scope.story._id, collabsIds)
        .then(function(updatedStory) {
            console.log('Updated Story', updatedStory);
        });
    };



});

