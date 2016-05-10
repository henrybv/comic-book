core.controller('CameraCtrl', function(story, $scope, $cordovaCamera, $cordovaFileTransfer) {
	
	$scope.takePicture = function() {
        var options = { 
            quality : 75, 
            destinationType : Camera.DestinationType.DATA_URL, 
            sourceType : Camera.PictureSourceType.CAMERA, 
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
 
        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            // An error occured. Show a message to the user
        });
    }


    $scope.openPhotoLibrary = function() { 
        console.log('in open photo library')
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
    // }

        $cordovaCamera.getPicture(options).then(function(imageData) {
            console.log('in get pictures')
            //console.log(imageData);
            //console.log(options);   
            var image = document.getElementById('tempImage');
            image.src = imageData;  
            console.log('image', image)

            var server = "http://192.168.1.133:1337/www/img",
                filePath = imageData;

            var date = new Date();

            var options = {
                fileKey: "file",
                fileName: imageData.substr(imageData.lastIndexOf('/') + 1),
                chunkedMode: false,
                mimeType: "image/jpg",
                targetWidth: 300,
                targetHeight: 300
            };

            // $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
            //     console.log("SUCCESS: " + JSON.stringify(result.response));
            //     console.log('Result_' + result.response[0] + '_ending');
            //     alert("success");
            //     alert(JSON.stringify(result.response));

            // }, function(err) {
            //     console.log("ERROR: " + JSON.stringify(err));
            //     //alert(JSON.stringify(err));
            // }, function (progress) {
            //     // constant progress updates
            // });


            }, function(err) {
                // error
                console.log(err);
            });
        }




});