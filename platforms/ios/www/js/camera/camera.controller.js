<<<<<<< HEAD
core.controller('CameraCtrl', function(story, $scope, $cordovaCamera) {
	
	 $scope.takePicture = function() {
=======
core.controller('CameraCtrl', function(story, $scope, $cordovaCamera, $cordovaFileTransfer, Grafi, $localStorage, CameraFactory) {
	$scope.story = story;
    console.log('current story: ', $scope.story)


    $scope.takePicture = function() {
>>>>>>> master
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
 
        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            // An error occured. Show a message to the user
            console.log(err);
        });
    }
<<<<<<< HEAD
});
=======

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

        $cordovaCamera.getPicture(options).then(function(imageData) {
            var image = new Image();
            image.src = imageData;
            var canvas = document.getElementById('myCanvas');
            var context = canvas.getContext('2d');

            image.onload = function (){
                context.drawImage(image, 0, 0);  
                var imageData = context.getImageData(0,0, canvas.width, canvas.height);
                var a = Grafi.edge(imageData, {level: 20});
                var b = Grafi.invert(a)
                        // for (var i=0; i < data.length; i+=4){
                        //   data[i]     = 255 - data[i];     // red
                        //   data[i + 1] = 255 - data[i + 1]; // green
                        //   data[i + 2] = 255 - data[i + 2]; // blue
                        // }
                var c = Grafi.contrast(b)
                context.putImageData(c, 0, 0);
                var dataURL = canvas.toDataURL('image/png');
                
                CameraFactory.createSquareAndUpdateStory(dataURL, $scope.story._id)
            }

        }, function(err) {
                // error
                console.log(err);
        });
    }

    $scope.getImageURI = function(){
        console.log('image id', $scope.story.squares[0])
        CameraFactory.getImageURI($scope.story.squares[0])
        .then(function(dataURI){
            console.log(dataURI);
        })
    }

});


    // var context = document.getElementById('one').getContext('2d');
    // var img = new Image();
    // img.onload = function(){
    //     context.drawImage(img, 0, 0);
    // }
    // img.src = '/Users/Debanshi/comic-book/server/app/assets/5733a34ec85339ef0b76ea56'


                // function dataURLToBlob(dataURL) {
                //     var BASE64_MARKER = ';base64,';
                //     if (dataURL.indexOf(BASE64_MARKER) == -1) {
                //       var parts = dataURL.split(',');
                //       var contentType = parts[0].split(':')[1];
                //       var raw = decodeURIComponent(parts[1]);

                //       return new Blob([raw], {type: contentType});
                //     }

                //     var parts = dataURL.split(BASE64_MARKER);
                //     var contentType = parts[0].split(':')[1];
                //     var raw = window.atob(parts[1]);
                //     var rawLength = raw.length;

                //     var uInt8Array = new Uint8Array(rawLength);

                //     for (var i = 0; i < rawLength; ++i) {
                //       uInt8Array[i] = raw.charCodeAt(i);
                //     }

                //     return new Blob([uInt8Array], {type: contentType});
                // }

                // var x = dataURLToBlob(dataURL);
                // console.log('dataURL to blob', x)
                // var url = URL.createObjectURL(x);
                // console.log('url from create object url', url)
>>>>>>> master
