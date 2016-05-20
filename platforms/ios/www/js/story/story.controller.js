core.controller('StoryCtrl', function($scope, story, $state, $localStorage, CameraFactory, loggedInUser, allUsers, StoryFactory, $rootScope) {
    $scope.allUsers = allUsers;
    $scope.currentUser = loggedInUser;
    $scope.allUsers = allUsers;
    $scope.clicked = false;
    $scope.collaborators = [];
    $scope.collabAdded = false;
	$scope.story = story;
<<<<<<< HEAD
    $scope.dataURLArray = [];
=======
    // $scope.urlbaby;
>>>>>>> master
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
<<<<<<< HEAD
        canvas.width = canvas.height = 115;
        canvas.style.padding = '1px 3px 1px 3px';
=======
        canvas.width = canvas.height = 300;
>>>>>>> master
        var context = canvas.getContext('2d');
        var newImage = new Image();
        var elem = document.getElementById('here');
        console.log('elem', elem)
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
<<<<<<< HEAD
        while (here && here.firstChild){
=======
        while (here.firstChild){
>>>>>>> master
            // console.log('HERE FIRST CHILD', here.firstChild)
            here.removeChild(here.firstChild);
        }
        var obj = snapshot.val();
        for (var squareId in obj){
            var dataURL = obj[squareId].url
            $scope.dataURLArray.push(dataURL);
            urlToNewCanvas(dataURL, squareId);
        }

    });

    // function slideTo(el, left) {
    //     var steps = 25;
    //     var timer = 25;
    //     var elLeft = parseInt(el.style.left) || 0;
    //     var diff = left - elLeft;
    //     var stepSize = diff / steps;
    //     console.log(stepSize, ", ", steps);

    //     function step() {
    //         elLeft += stepSize;
    //         el.style.left = elLeft + "px";
    //         if (--steps) {
    //             setTimeout(step, timer);
    //         }
    //     }
    //     step();
    // }
    // var elem = document.getElementById('img')
    // $scope.animate = function(){
    //     slideTo()
    // }


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

    // $scope.shareEmail = function(){
        
    //     window.plugins.socialsharing.shareViaEmail(
    //       'Message', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
    //       'Subject',
    //       ['to@person1.com', 'to@person2.com'], // TO: must be null or an array
    //       ['cc@person1.com'], // CC: must be null or an array
    //       null, // BCC: must be null or an array
    //       ['https://www.google.nl/images/srpr/logo4w.png','www/localimage.png'], // FILES: can be null, a string, or an array
    //       onSuccess, // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
    //       onError // called when sh*t hits the fan
    //     );
    // }



});

