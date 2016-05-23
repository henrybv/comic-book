core.controller('StoryCtrl', function($scope, story, $state, $localStorage, CameraFactory, loggedInUser, allUsers, StoryFactory, $rootScope, $ionicPopup, $ionicTabsDelegate) {

    $scope.allUsers = allUsers;
    $scope.currentUser = loggedInUser;
    $scope.allUsers = allUsers;
    $scope.clicked = false;
    $scope.collaborators = [];
    $scope.collabAdded = false;
	$scope.story = story;
    $scope.deleteClicked = false;
    $scope.dataURLArray = [];
    $ionicTabsDelegate.select('Squares');
	// console.log('story in storyCTRL', $scope.story)

    // $scope.allUsers.forEach(function(user) {
    //     for (var i = 0; i < $scope.story.friends.length; i++) {
    //         if ($scope.story.friends[i]._id === user._id) {
    //             $scope.allUsers.splice(i, 1);
    //         }
    //     }
    // });



    //Load Story Initially From MongoDB:
    $scope.finalPicsArray = []
    if ($scope.story.squares){
        for (var i = 0; i < $scope.story.squares.length; i++) {
            console.log("GETTING POPULATE SQUARES!", $scope.story.squares)
            
            // var currSquare = new Firebase($scope.story.squares[i].finalImage)
            console.log("THAT ONE", $scope.story.squares[i])
            var picObj = {};
            picObj.id = $scope.story.squares[i]._id;
            picObj.dataURL = $scope.story.squares[i].finalImage;
            picObj.creator = $scope.story.squares[i].creator
            console.log("THE CREATOR", $scope.story.squares[i].creator)
            console.log('finalPicsArray', $scope.finalPicsArray)
            $scope.finalPicsArray.push(picObj)
        }
    }



    console.log("THE STORY", $scope.story)

    $scope.goToCamera = function(){
        // $scope.clicked = false;
        // $scope.collaborators = [];
        // $scope.collabAdded = false;
        $state.go('camera', {storyId: $scope.story._id});
    }

    $scope.changeState = function() {
        $state.go('home')
    }

   

    // var urlToNewCanvas = function(url, canvasId){
    // 	var canvas = document.createElement('canvas');
    //     canvas.id = canvasId;
    //     canvas.width = canvas.height = 115;
    //     canvas.style.padding = '1px 3px 1px 3px';
    //     var context = canvas.getContext('2d');
    //     var newImage = new Image();
    //     var elem = document.getElementById('here');
    //     console.log('elem', elem)
    //     elem.appendChild(canvas);
    //     newImage.src = url;
    //     newImage.onload = function(){
    //         context.drawImage(newImage, 0, 0, newImage.width, newImage.height, 0, 0, canvas.width, canvas.height);
    //     }
    // }

// var initialDataLoaded = false;
// var ref = new Firebase('https://<your-Firebase>.firebaseio.com');

// ref.on('child_added', function(snapshot) {
//   if (initialDataLoaded) {
//     var msg = snapshot.val().msg;
//     // do something here
//   } else {
//     // we are ignoring this child since it is pre-existing data
//   }
// });

// ref.once('value', function(snapshot) {
//   initialDataLoaded = true;
// });


// GETTING IMAGES FROM FIREBASE EVERY TIME ONE IS ADDED
// GIVE EACH BTN AN ID WITH THEIR ID FROM THE PIC OBJ AND DO EVENT DELEGATION WITH THAT ID
    var firebaseIdCounter = 0
    var initialDataLoaded = false;
    var ref = new Firebase('https://torrid-inferno-1552.firebaseio.com/' + $scope.story._id);
    ref.on('child_added', function(snapshot, prevChildKey) {
        if(initialDataLoaded) {
            var picObj = {};
            picObj.id = firebaseIdCounter;
            picObj.dataURL = snapshot.val().url;
            picObj.creator = snapshot.val().creator
            $scope.finalPicsArray.push(picObj)
            $scope.$digest();
            firebaseIdCounter++
        }
      // code to handle new child.
    });    

    ref.once('value', function(snapshot) {
      initialDataLoaded = true;
      console.log('initialDataLoaded', initialDataLoaded)
    });
    // ref.on('value', function(snapshot){
    //     $scope.FBobj = snapshot.val();
    //     console.log('OBJ: ', $scope.FBobj);
    //     var arr = [];
    //     $scope.finalPicsArray = [];

    //     for (var key in $scope.FBobj) {
    //         StoryFactory.getSquareById(key)
    //         .then(function(square){
    //             var picObj = {};
    //             picObj.id = key;
    //             picObj.dataURL = $scope.FBobj[key].url;
    //             picObj.creator = square.creator
    //             console.log("THE CREATOR", square.creator)
    //             $scope.finalPicsArray.push(picObj);
    //             console.log('finalPicsArray', $scope.finalPicsArray)
    //         })
    //     };

    //     for (var i = 0; i < finalPicsArray.length; i++) {
    //         finalPicsArray[i]
    //     }

    //     // DIGEST RUNS BEFORE FINALPICARRY COMPLETE PLUS DIGEST DOESNT RUN FOR PIC ADDED FROM COLLABR CUZ NO USER INTERACTION SO HAVE TO RUN THIS
    //     setTimeout(function(){
    //         $scope.$apply(function(){
    //             $scope.finalPicsArray = $scope.finalPicsArray;
    //         })
    //     }, 20);




    //     // for (var squareId in $scope.FBobj){
    //     //     var dataURL = $scope.FBobj[squareId].url
    //     //     arr.push(dataURL);
    //     // }
    //     // $scope.dataURLArray = arr;
    //     // console.log('SCOPE dataURLArray:', $scope.dataURLArray)


    // });





    
// // GETTING IMAGES FROM FIREBASE EVERY TIME ONE IS ADDED
//     var ref = new Firebase('https://torrid-inferno-1552.firebaseio.com/' + $scope.story._id);
//     ref.on('value', function(snapshot){
//         var here = document.getElementById('here');
//             console.log('Firebase Div:', here)
//         while (here && here.firstChild){
//             // console.log('HERE FIRST CHILD', here.firstChild)
//             here.removeChild(here.firstChild);
//         }
//         var obj = snapshot.val();
//         for (var squareId in obj){
//             var dataURL = obj[squareId].url
//             $scope.dataURLArray.push(dataURL);
//             urlToNewCanvas(dataURL, squareId);
//         }

//     });

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

    $scope.cancelAddFriends = function() {
        $scope.clicked = false;
        $scope.collabAdded = false;
        $scope.collaborators = [];
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


    function deleteSquare () {
        var item = $(this);
        var squareId = item[0].id;

         // Confirm dialog pop-up
         $scope.showConfirm = function() {
           var confirmPopup = $ionicPopup.confirm({
             title: 'Delete',
             template: 'Are you sure you want to delete this square?'
           });

           confirmPopup.then(function(res) {
             if(res) {
               console.log('Yes', squareId);
               StoryFactory.deleteSquare($scope.story._id, squareId)
               .then(function(story) {
                var ref = new Firebase('https://torrid-inferno-1552.firebaseio.com/' + $scope.story._id +'/' + squareId);
                ref.remove();
                console.log('UPDATED STORY: ', story);
                $('#parent').undelegate( "button", "click", deleteSquare);
                $scope.deleteClicked = false;
               });
             } else {
               console.log('Cancel');
               $('#parent').undelegate( "button", "click", deleteSquare);
               $scope.deleteClicked = false;
             }
           });
         };

         $scope.showConfirm();
    }

    $scope.exposeDeletes = function() {
        $scope.deleteClicked = true;
        $('#parent').delegate('button', 'click', deleteSquare);
    };

    $scope.cancelDelete = function() {
        $scope.deleteClicked = false;
        $('#parent').undelegate( "button", "click", deleteSquare);
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

