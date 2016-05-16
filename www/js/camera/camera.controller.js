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


    // $( "#addonWrapper" ).on( "mousedown", function( event ) {
    //     console.log("Jquery... it works!")
    //     event.preventDefault();
    //     $('addonWrapper').removeClass('addonDivs');
    //     $('addonWrapper').addClass('addonDelete');

    //     console.log( $( this ).text() );
    // });
    // $( "#addonWrapper" ).on( "mouseup", function( event ) {
    //     console.log("Jquery... it works AGAIN!!!!")
    //     event.preventDefault();

    //     console.log( $( this ).text() );
    // });
    // $('li a').click(function(e) {
    //     e.preventDefault();
    //     $('a').removeClass('active');
    //     $(this).addClass('active');
    // });

    //-----ADDON FUNCTIONS-----//

    //Filters from Database Resolve
    $scope.allAddons = getAddons
    $scope.currentNav = 'navbarAddon'
    console.log($scope.allAddons)


    //Stickers
    var stickercounter = 0;
    var stickerIdCounter = 1;
    $scope.sticker = function (img){
        console.log('STICKER', img)

        if(!$scope.stickersArray) $scope.stickersArray = []
        //Create image element with unique ID
        if(stickercounter < 4){

            //Push element data into the stickersArray;
            $scope.stickersArray.push({source: img, id: stickerIdCounter})
            stickercounter++;
            stickerIdCounter++;
        } else {
            onErrorFunc()
            console.log("Too Many Stickers!")
        }

    }

    //Bubbles
    var bubblecounter = 0;  
    var bubbleIdcounter = 1;  
    $scope.bubble = function (){
        if(!$scope.bubblesArray) $scope.bubblesArray = []
        if(bubblecounter < 4){
            $scope.bubblesArray.push({id: bubbleIdcounter, text:' '})
            bubblecounter++;
            bubbleIdcounter++;
        } else {
            onErrorFunc()
        }

    }  

    //Border  
    $scope.border = function (img){
        console.log('BORDER')
    } 

    //Filter   
    $scope.filter = function (img){
        console.log('FILTER')
    }


    //REMOVE ADDONs
    $scope.removeAddon = function(eventId) {
        console.log("removeAddon!", eventId)
        document.getElementById(eventId).remove()

        if (eventId[0] === 's') {
          --stickercounter
          console.log("stickercounter", stickercounter) 
          for (var i = 0; i < $scope.stickersArray.length; i++) {
                if($scope.stickersArray[i].id === Number(eventId.slice(-1))) {
                    $scope.stickersArray.splice(i, 1)
                    //Adds success notification to users screen
                    onSuccessfulDelete()
                }
           } 
        } 

        if (eventId[0] === 'b') {
            --bubblecounter
            console.log("bubblecounter", bubblecounter) 
            for (var i = 0; i < $scope.bubblesArray.length; i++) {
                console.log("bubble ids", $scope.bubblesArray[i].id, Number(eventId.slice(-1)))
                if($scope.bubblesArray[i].id === Number(eventId.slice(-1))) {
                    $scope.bubblesArray.splice(i, 1)
                    //Adds success notification to users screen
                    onSuccessfulDelete()
                }
            } 
        }

        console.log($scope.bubblesArray, $scope.stickersArray)
    }

    // Hammer Counter Variables:
    // x and y are used to grab current coordinates of the element for use in drawing
    // diffX and diffY are used to allow for draggin of stickers based on click and not center
    // offset is NOT being used, but might be helpful with drawing to canvas 
    var x,
        y,
        diffX,
        diffY,
        offset;
    var hammerCounter = 0

    $scope.onHammer = function onHammer (event) {

        // Grabs current Element
        var currentElem = document.getElementById(event.element[0].id);
        // y Coordinate
        var currentTop = Number(currentElem.style.top.substring(0, currentElem.style.top.length-2))
        // x Coordinate
        var currentLeft = Number(currentElem.style.left.substring(0, currentElem.style.left.length-2))

        // var currentCenter = [(currentLeft + (currentWidth/2)), (currentTop + (currentHeight/2))]

        if(!hammerCounter){ 
            console.log("This Ran", currentElem.className)
            diffX = event.center.x - currentLeft;
            diffY = event.center.y - currentTop;
            // Grab the current elements offset from the screen.
            // This is important because otherwise we only have its position relative
            // to its Div (ie, (0,0) refers to the top left of the DIV, not the screen (might effect canvas drawing)
            offset = $('#' + event.element[0].id).offset();
            // // Then refer to 
            // var x = evt.pageX - offset.left;
            ++hammerCounter

        }

        x = event.center.x
        y = event.center.y


        // if((y > 60 && y < 550) && currentElem.className === 'addonDivs activated') {
        //     currentElem.style.top = y - diffY + 'px';
        // }        
        // if((y > 60 && y < 700) && currentElem.className === 'addonDivs activated addonActive') {
        //     currentElem.style.top = y - diffY + 'px';
        // }
        // if((x + 25) > 0 && x < 375) {   
        //     currentElem.style.left = x - diffX + 'px';
        // }        
        if(y > 60 && y < 600) {
            currentElem.style.top = y - diffY + 'px';
        }          
        if((x + 25) > 0 && x < 375) {   
            currentElem.style.left = x - diffX + 'px';
        }

        console.log("Coords", x, y);

    };


    $scope.onPress = function onPress (event) {

        var currentElem = document.getElementById(event.element[0].id);

        //Find the sticker and make its background Active (red), and 'draggable'(doesnt do anything expcept allow the garbage can to be 'droppable later')
        $("#addonWrapper").find('#' + event.element[0].id).addClass('addonActive')

        //Add the delete Button onto the DOM
        $scope.currentNav = 'navbarDelete'

        // document.getElementById('deleteDiv').addEventListener('mouseup', function(){
        //     console.log('The Best Event Listener Listened!')
        //     $scope.removeAddon(event.element[0].id)
        // })    

    };

    //This Function Runs once an addon is stopped dragging and/or a pressed addon is released
    $scope.onHammerEnd = function onHammerEnd (event) {


        //find the current element
        var currentElem = document.getElementById(event.element[0].id)

        //Reshow the Addon Navbar
        $scope.currentNav = 'navbarAddon'


        console.log("onHammerEnd", event.center.y, currentElem.className)
        //Run delete Function if sticker/bubble is active AND event occurred below certain point on screen
        if(event.center.y > 490 && currentElem.className.indexOf('addonActive') > -1){

            //Poof Animation Runs
            $('#puff').css({
                left: event.center.x - 20 + 'px',
                top: event.center.y - 80 + 'px'
            }).show();
            animatePoof();

            //Remove Addon Function Runs
            $scope.removeAddon(event.element[0].id)

        }

        //Remove Active Class from selected sticker/bubble
        $("#addonWrapper").find('#' + event.element[0].id).removeClass('addonActive')


        //Decrement hammerCounter
        --hammerCounter

    };     

    var onErrorFunc = function () {
        console.log('onErrorFunc')
        $('#addonError').appendTo('#addonWrapper').slideDown("slow")

        setTimeout(function(){
            $('#addonError').fadeOut();
        }, 3000)

    }     

    var onSuccessfulDelete = function () {
        console.log('onSuccessfulDelete')
        $('#addonSuccessfulDelete').appendTo('#addonWrapper').slideDown("slow")

        setTimeout(function(){
            $('#addonSuccessfulDelete').fadeOut();
        }, 3000)

    } 

    function animatePoof() {
        console.log("animate Poof Ran")
        var bgTop = 0,
            frame = 0,
            frames = 6,
            frameSize = 32,
            frameRate = 80,
            puff = $('#puff');
        var animate = function(){
            if(frame < frames){
                puff.css({
                    backgroundPosition: "0 " + bgTop + "px"
                });
                bgTop = bgTop - frameSize;
                frame++;
                setTimeout(animate, frameRate);
            }
        };
        
        animate();
        setTimeout("$('#puff').hide()", frames * frameRate);
    }

});


 