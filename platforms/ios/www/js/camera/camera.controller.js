core.controller('CameraCtrl', function(story, $scope, $cordovaCamera, $cordovaFileTransfer, Grafi, $localStorage, CameraFactory) {
	$scope.story = story;
    $scope.currentSquare;
    $scope.currentDataURL;
    $scope.currentUser = $localStorage.user._id;
    $scope.canvas = document.getElementById('myCanvas');

    var urlToCanvas = function(url, canvas){
        var newImage = new Image();
        newImage.src = url;
        var context = $scope.canvas.getContext('2d');
        newImage.onload = function(){
            context.drawImage(newImage, 0, 0);
        }
        var dataURL = $scope.canvas.toDataURL('image/png');
    }

    var updateCanvas = function(canvas, changeFunct){
        var context = canvas.getContext('2d');
        var imageData = context.getImageData(0,0, canvas.width, canvas.height);
        var newImageData = changeFunct(imageData);
        context.putImageData(finalImageData, 0, 0);
        var dataURL = canvas.toDataURL('image/png');
    }

    $scope.takePicture = function() {
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
            // $scope.imgURI = "data:image/jpeg;base64," + imageData;
            urlToCanvas(imageURL, $scope.canvas);
        });
    }

    $scope.openPhotoLibrary = function() { 
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 375,
            targetHeight: 375,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function(imageURL) {
            urlToCanvas(imageURL, $scope.canvas);
        });
    }

    $scope.filterImage = function(filterType, canvas){
        var canvas = $scope.canvas;
        var filterType = filterType || 'sketch';
        var context = canvas.getContext('2d');
        var imageData = context.getImageData(0,0, canvas.width, canvas.height);
        var finalImageData;
        if (filterType === 'sketch'){
            var a = Grafi.edge(imageData, {level: 20});
            var b = Grafi.invert(a)
                // for (var i=0; i < a.length; i+=4){
                //   a[i]     = 255 - a[i];     // red
                //   a[i + 1] = 255 - a[i + 1]; // green
                //   a[i + 2] = 255 - a[i + 2]; // blue
                // }
            var c = Grafi.contrast(a)
            // var c = Grafi.brightness(a);
            finalImageData = c;
        }
        context.putImageData(finalImageData, 0, 0);
        $scope.currentDataURL = canvas.toDataURL('image/png');
    }

    
    $scope.saveImage = function(){
        CameraFactory.createSquare($scope.currentDataURL, $scope.story._id, $scope.currentUser)
        .then(function(square){
            $scope.currentSquare = square;
        })
    }


    // $scope.getImageURI = function(squareId, storyId){
    //     // console.log('image id', $scope.story.squares[0])
    //     console.log('in get image uri in controller. parameters: ', $scope.currentSquare._id, $scope.story._id)
    //     CameraFactory.getImageURI($scope.currentSquare._id, $scope.story._id)
    //     .then(function(dataURI){
    //         console.log('returned datauri to controller from factory')
    //         console.log(dataURI);
    //     })
    // }


// // GETTING IMAGES FROM FIREBASE EVERY TIME ONE IS ADDED
//     var ref = new Firebase('https://torrid-inferno-1552.firebaseio.com/' + $scope.story._id);
//     console.log('ref', ref);

//     ref.on('child_added', function(snapshot){
//     // ref.once('value', function(snapshot){
//         var obj = snapshot.val();
//         var square = obj['5734b1335011831c5111e937'];
//         $scope.urlarray.push(square.url);
//         $scope.dataURL = square.url;
//         urlToCanvas($scope.dataURL, 'newCanvas');
//     })



});