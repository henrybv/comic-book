core.controller('SettingsCtrl', function($scope, $localStorage, AuthService, $state, $cordovaCamera, SettingsFactory, $cordovaContacts) {
	$scope.user = $localStorage.user;

	$scope.logout = function () {
        AuthService.logout();
 		$state.go('login');
    };

    $scope.url = '../img/default_avatar.jpg';

    $scope.takePicture = function() {
    // console.log("THE CAMERA RAN ON THE ISOLATE SCOPE")
    var options = { 
        quality : 75, 
        destinationType : Camera.DestinationType.DATA_URL, 
        sourceType : Camera.PictureSourceType.CAMERA, 
        allowEdit : true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 375,
        targetHeight: 375,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
    };
    $cordovaCamera.getPicture(options).then(function(imageURL) {
        $scope.url = "data:image/jpeg;base64," + imageURL;
        SettingsFactory.urlToCanvas($scope.url, 'avatar');
    });
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

	// send an email to invite friends to try app
	$scope.inviteViaEmail = function() {
        if(window.plugins && window.plugins.emailComposer) {
            window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                console.log("Response -> " + result);
            }, 
            "Join my comic strip, or craft your own with ComicPowWow", // Subject
            "Comic Pow-Wow is a collaborative mobile application that allows you to create comic strips with friends. I really love it. You should give it a try!",                      // Body
            ["test@example.com"],    // To
            null,                    // CC
            null,                    // BCC
            false,                   // isHTML
            null,                    // Attachments
            null);                   // Attachment Data
        }
    }


});