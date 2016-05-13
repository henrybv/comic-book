core.controller('CameraCtrl', function(story, getAddons, $scope, $cordovaCamera, $cordovaFileTransfer, Grafi, $localStorage, CameraFactory) {
	
    $scope.story = story;
    console.log('current story: ', $scope.story)





    $scope.takePicture = function() {
        console.log("THE CAMERA RAN ON THE ISOLATE SCOPE")
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

    $scope.openPhotoLibrary = function() { 
        console.log('in open photo library', $cordovaCamera)
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

    //--------DIRECTIVE--------//

    $scope.test = function(){
        console.log("HELLO")
    }
    //Filters from Database Resolve
    $scope.allAddons = getAddons
    console.log($scope.allAddons)

    //Create Sticker Div
 
    // var w = document.getElementById('stickerWrapper');

    // w.style.left = '50px';
    // w.style.top = '100px'

    $scope.stickersArray = []
    stickercounter = 1;
    $scope.sticker = function (img){
        console.log('STICKER', img)

        //Create image element with unique ID
        if(stickercounter < 4){
            // var sticker = new Image()
            // sticker.src = img
            // console.log(sticker)

            // sticker.setAttribute("src", img)
            // sticker.setAttribute("hm-panmove", 'onHammer')
            // sticker.setAttribute("ng-click", "test()")
            $scope.stickersArray.push({source: img, id: stickercounter})

            console.log($scope.stickersArray)
            //Grab that element and set it to a variable;
            // w.appendChild(sticker)
            stickercounter++
        } else {
            //Run an Error that tells them they have too many stickers!
            console.log("Too Many Stickers!")
        }
        // $scope.$compile()
    }    
    $scope.bubble = function (img){
        console.log('BUBBLE')
    }    
    $scope.border = function (img){
        console.log('BORDER')
    }    
    $scope.filter = function (img){
        console.log('FILTER')
    }

    $scope.onHammer = function onHammer (event) {

        var currentElem = document.getElementById(event.element[0].id);

        var x = event.center.x - 80,
            y = event.center.y - 130;

        currentElem.style.left = x + 'px';
        currentElem.style.top = y + 'px';
        console.log("hammer ran", currentElem)

      console.log("Coords", x, y);

    };


});


 