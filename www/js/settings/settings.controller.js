core.controller('SettingsCtrl', function($scope, $localStorage, AuthService, $state, $cordovaCamera, SettingsFactory, $cordovaContacts, $cordovaEmailComposer, FilterFactory, loggedInUser) {
	
    console.log(loggedInUser, "GETLOGGEDINUSER")
    
    $scope.user = loggedInUser;
    console.log($scope.user, "SCOPE USER")

	$scope.logout = function () {
        AuthService.logout();
 		$state.go('login');
    };

    $scope.url;
    // $scope.ran = false;
    // $scope.url = '../img/default_avatar.jpg';


    // var canvas = document.createElement('canvas');
    // var context = canvas.getContext('2d');
    // var newImage = new Image();
    // newImage.src = $scope.user.avatar;
    // // newImage.onload = function(){
    // context.drawImage(newImage, 0, 0);
    // // }


    $scope.takePicture = function() {
    console.log("THE CAMERA RAN ON THE ISOLATE SCOPE")
        var options = { 
            quality : 75, 
            destinationType : Camera.DestinationType.DATA_URL, 
            sourceType : Camera.PictureSourceType.CAMERA, 
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 120,
            targetHeight: 120,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function(imageURL) {
            $scope.url = "data:image/jpeg;base64," + imageURL;
                        // var newImage = new Image();
            // newImage.src = $scope.url;
            // newImage.onload = function(){
            //     context.drawImage(newImage, 0, 0);
            //     FilterFactory.greyPosterFilter('avatarcanvas', newImage);
            // };
            // var canvas = document.getElementById('avatarcanvas');
            // var context = canvas.getContext('2d');
            // var newImage = new Image();
            // // $scope.url = "../img/adam.jpg";
            // newImage.src = $scope.url;
            // newImage.onload = function(){
            //     context.drawImage(newImage, 0, 0, newImage.width, newImage.height, 0, 0, canvas.width, canvas.height);
            

            SettingsFactory.updateAvatar($scope.url, $scope.user._id)
            .then(function(newUser){
                console.log(newUser, "this is new user")
                $scope.user = newUser;
                $scope.url = newUser.avatar;
                $localStorage.user.avatar = newUser.avatar;
                // var canvas = document.getElementById('avatarcanvas');
                // var context = canvas.getContext('2d');
                // var newImage = new Image();
                // newImage.src = $scope.url;
                // newImage.onload = function(){
                //     context.drawImage(newImage, 0, 0);
                //     FilterFactory.greyPosterFilter('avatarcanvas', newImage);
                // };
                // var dataURL = canvas.toDataURL('image/png');

            });
            // $scope.ran = true;
        // });
	   })
    }

	// sync phone contacts to app
	$scope.getContacts = function() {
		$scope.phoneContacts = [];
	      function onSuccess(contacts) {
	        for (var i = 0; i < contacts.length; i++) {
	          var contact = contacts[i];
	          $scope.phoneContacts.push(contact);
	        }
	      };
	      function onError(contactError) {
	        alert(contactError);
	      };
	      var options = {};
	      options.multiple = true;
	      $cordovaContacts.find(options).then(onSuccess, onError);
	};

	// send email to invite friends to try ComicPowWow


    // send an email to invite friends to try app
    $scope.inviteViaEmail = function() {
        if(window.plugins && window.plugins.emailComposer) {
            window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                console.log("Response -> " + result);
            }, 
            "Join my comic strip, or craft your own with ComicPowWow", // Subject
            "ComicPowWow is a mobile application that allows us to create comic strips together in real time. It's addictive and I really love it. You should give it a try!",                      // Body
            ["test@example.com"],    // To
            null,                    // CC
            null,                    // BCC
            false,                   // isHTML
            null,                    // Attachments
            null);                   // Attachment Data
        }
    }



});

// core.controller('SettingsEmail Ctrl', function($cordovaEmailComposer) {
		
// 	$cordovaEmailComposer.isAvailable().then(function() {
//    // is available
//  	}, function () {
//    // not available
//  	});

//   	var email = {
// 	    to: 'test@example.com',
// 	    cc: '',
// 	    bcc: ['hello@comicpowwow.com'],
// 	    attachments: [
// 	      'file://img/logo.png',
// 	      'res://icon.png',
// 	      'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...'
// 	    ],
// 	    subject: 'Join my comic strip, or craft your own with ComicPowWow',
// 	    body: 'ComicPowWow is a mobile application that allows us to create comic strips together in real time. Its addictive and I really love it. You should give it a try!',
// 	    isHtml: true
//   	};

//  	$cordovaEmailComposer.open(email).then(null, function () {
//    	// user cancelled email
//  	})	
// })