core.controller('CameraCtrl', function($q, $state, story, getAddons, $scope, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, Grafi, $localStorage, CameraFactory, FilterFactory, $ionicLoading) {
	$scope.story = story;
    $scope.currentUser = $localStorage.user._id;
    // $scope.currentSquare;
    $scope.stickersArray = [];
    $scope.pictureTaken = false;

    //REMOVE LINK WHEN USING URL FROM PHOTO / ALBUM LIBRARY
    // $scope.url = '../../img/ben.png';
    $scope.url;


    var urlToCanvas = function(url, canvasId, x, y){
        // console.log('parameters', url, canvasId, x, y)
        var x = x || 0;
        var y = y || 0;
        var canvas = document.getElementById('imageCanvas');
        var context = canvas.getContext('2d');
        var newImage = new Image();
        newImage.src = url;
        // newImage.crossOrigin = '';
        newImage.onload = function(){
            context.drawImage(newImage, x, y, canvas.width, canvas.height);
            var dataURL = canvas.toDataURL('image/png');
            // console.log(dataURL);
            $scope.test = dataURL;
            $scope.$digest();
        }
    }
    //REMOVE WHEN USING URL FROM PHOTO / ALBUM LIBRARY
    urlToCanvas($scope.url, 'imageCanvas');

    
    $scope.pictureTakenTrue = function(){
        $scope.pictureTaken = true;
        console.log("Should have run", $scope.pictureTaken)
    }

    $scope.applyfilter = function(filter, canvasId){
        // console.log('in apply filter in camera ctrl')
        applyfilter(filter, canvasId);
    }

    var applyfilter = function(filter, canvasId){
        // console.log('in applyfilter other function')
        var img = new Image();
        img.src = $scope.url;
        if (canvasId === 'imageCanvas') FilterFactory.clearFilter(canvasId, img)
        if (filter === 'grey') FilterFactory.greyPosterFilter(canvasId, img);
        if (filter === 'poster') FilterFactory.colorPosterFilter(canvasId, img);
        if (filter === 'brown') FilterFactory.brownPosterFilter(canvasId, img);
        if (filter === 'black') FilterFactory.blackFilter(canvasId, img);
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
            $scope.url = "data:image/jpeg;base64,"+ imageURL;
            urlToCanvas($scope.url, 'imageCanvas');
        });

        $scope.pictureTaken = true;
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
            $scope.url = imageURL;
            urlToCanvas($scope.url, 'imageCanvas');
        });

        $scope.pictureTakenTrue()
    }


   var addStickersToCanvas = function(){

        var onloadsRunning = [];
        
        if ($scope.stickersArray){        
            var canvas = document.getElementById('imageCanvas');
            var context = canvas.getContext('2d');

            //Grab height on devices top nav bars
            var heightDiff = $('#imageCanvas').offset().top;

            $scope.stickersArray.forEach(function(sticker){
                var currentStickerPos = $( "#sticker" + sticker.id ).offset();
                console.log('currentStickerPos', currentStickerPos)
                // var x = Number(sticker.x.slice(0,-2)) || 0;
                // var y = Number(sticker.y.slice(0,-2)) || 0
                var stickerImage = new Image();
                stickerImage.src = sticker.source;
                var onloadPromise = $q(function(resolve, reject){
                    stickerImage.onload = function(){
                        context.drawImage(stickerImage, currentStickerPos.left, currentStickerPos.top - heightDiff);
                        resolve();
                    }
                    stickerImage.onerror = reject;
                })
                onloadsRunning.push(onloadPromise);
            })
        }

        return $q.all(onloadsRunning);

    }     


    var addBorderToCanvas = function(){

        var onloadsRunning = [];

        if ($scope.chosenBorder) {        
            var canvas = document.getElementById('imageCanvas');
            var context = canvas.getContext('2d');
            var newImage = new Image();
            newImage.src = $scope.chosenBorder ? $scope.chosenBorder.source  : 'assets/borders/transparent.png'
            // console.log("newImage.srcy", newImage.src, $scope.chosenBorder)
            var onloadPromise = $q(function(resolve, reject){
                newImage.onload = function(){
                    context.drawImage(newImage, 0, 0);
                    resolve();
                }
                newImage.onerror = reject;
            })
            onloadsRunning.push(onloadPromise);
            // })
        }

        return $q.all(onloadsRunning);

    }   


    var addBubblesToCanvas = function(){

        var onloadsRunning = [];

        if($scope.bubblesArray){
            // console.log(!!$scope.bubblesArray)
            var canvas = document.getElementById('imageCanvas');
            var context = canvas.getContext('2d');
            $scope.bubblesArray.forEach(function(bubble){

                //Bubble Coords
                var currBubble = $( "#bubble" + bubble.id );
                var currBubblepos = currBubble.offset();

                //Pointer Coords
                var currentPointer = $( "#pointer" + bubble.id );
                var pointerpos = currentPointer.offset();                

                //PointerBorder Coords
                var currentPointerBorder = $( "#pointerBorder" + bubble.id );
                var pointerBorderpos = currentPointerBorder.offset();

                //Image For Bubble
                var bubbleImage = new Image();
                bubbleImage.src = bubble.source;

                //Image for Pointer
                var pointerImage = new Image();
                pointerImage.src = bubble.pointer;

                //Image for PointerBorder
                var borderImage = new Image();
                borderImage.src = bubble.pointerBorder;                


                //Grab distance from top of screen for subtracting in .drawImage()
                var heightDiff = $('#imageCanvas').offset().top;

                var onloadPromise = $q(function(resolve, reject){
                    var bubbletype = bubble.type.split('_')
                    bubbleImage.onload = function(){
                        //Draw bubble, pointer, and pointerBorder images to the canvas seperately
                        context.drawImage(bubbleImage, currBubblepos.left, currBubblepos.top - heightDiff);
                        context.drawImage(borderImage, pointerBorderpos.left, pointerBorderpos.top - heightDiff);
                        context.drawImage(pointerImage, pointerpos.left, pointerpos.top - heightDiff);
                        resolve();
                    }
                    bubbleImage.onerror = reject;
                }) 
                onloadsRunning.push(onloadPromise);
                // console.log("onloadsRunning", onloadsRunning)
            })
        }

        return $q.all(onloadsRunning);

    }

    var addNarrationToCanvas = function(){

        var onloadsRunning = [];

        if($scope.narrationArray){
            // console.log(!!$scope.bubblesArray)
            var canvas = document.getElementById('imageCanvas');
            var context = canvas.getContext('2d');

            $scope.narrationArray.forEach(function(currNarr){

                //Narration Coords
                var currnarration = $( "#narration" + currNarr.id );
                var currnarrationpos = currnarration.offset();             

                //Image For narration
                var narrationImage = new Image();
                narrationImage.src = currNarr.source;
                console.log(currNarr.source)

                //Grab distance from top of screen for subtracting in .drawImage()
                var heightDiff = $('#imageCanvas').offset().top;

                var onloadPromise = $q(function(resolve, reject){
                    var narrationtype = currNarr.type.split('_')
                    narrationImage.onload = function(){
                        //Draw narration, pointer, and pointerBorder images to the canvas seperately
                        context.drawImage(narrationImage, currnarrationpos.left, currnarrationpos.top - heightDiff);
                        resolve();
                    }
                    narrationImage.onerror = reject;
                }) 
                onloadsRunning.push(onloadPromise);
                // console.log("onloadsRunning", onloadsRunning)
            })
        }

        return $q.all(onloadsRunning);

    }



    var bubblestoImageData = function() {

        var onloadsRunning = []
        if ($scope.bubblesArray) {
            $scope.bubblesArray.forEach(function(currentBubble) {
                var currBubble = $('#bubble' + currentBubble.id)
                var currPointer = $('#pointer' + currentBubble.id)
                var currPointerBorder = $('#pointerBorder' + currentBubble.id)
                // var currText = $( "#bubble" + currentBubble.id ).children("#textarea")

                var onloadPromise = $q(function(resolve, reject) {
                    html2canvas(currBubble[0], {
                        onrendered: function(canvas) {
                            canvas.class = 'newID';
                            var dataURL = canvas.toDataURL();
                            currentBubble.source = dataURL;
                        },
                        letterRendering: true
                    })                    
                    html2canvas(currPointer[0], {
                        onrendered: function(canvas) {
                            canvas.class = 'newID';
                            var dataURL2 = canvas.toDataURL();
                            currentBubble.pointer = dataURL2;
                        },
                        letterRendering: true
                    })                    
                    html2canvas(currPointerBorder[0], {
                        onrendered: function(canvas) {
                            canvas.class = 'newID';
                            var dataURL3 = canvas.toDataURL();
                            currentBubble.pointerBorder = dataURL3;
                            resolve();
                        },
                        letterRendering: true
                    })                    
                })
                onloadsRunning.push(onloadPromise);
            })

        }
        if ($scope.narrationArray) {
            $scope.narrationArray.forEach(function(currentNarration) {
                
                var currNarration = $('#narration' + currentNarration.id)

                var onloadPromise = $q(function(resolve, reject) {
                    html2canvas(currNarration[0], {
                        onrendered: function(canvas) {
                            canvas.class = 'newID';
                            var dataURL4 = canvas.toDataURL();
                            currentNarration.source = dataURL4;
                            resolve();
                        },
                        letterRendering: true
                    })                                      
                })
                onloadsRunning.push(onloadPromise);
            })
        }
        console.log($scope.narrationArray)
        return $q.all(onloadsRunning);
    };  



    //Defines the saveImage function which Saves Image to DB and adds to story
    $scope.saveImage = function(){
        console.log('in save image ctrl')

        return bubblestoImageData()
        .then(function(){
            console.log("Got into 2nd promise chain")
            return addBorderToCanvas()
        })
        .then(function(){
            console.log("Got into 4nd promise chain")
            return addBubblesToCanvas()
        })
        .then(function(){
            console.log("Got into 5nd promise chain")
            return addNarrationToCanvas()
        })
        .then(function(){
            console.log("Got into 6nd promise chain")
            return addStickersToCanvas()
        })
        .then(function(){
            var canvas = document.getElementById('imageCanvas');
            var finalDataURL = canvas.toDataURL('image/png')
            return CameraFactory.createSquare(finalDataURL, $scope.story._id, $scope.currentUser)
        })        
        .then(function(square){
            console.log('square from camera factory in ctrl', square)
            $state.go('story', {storyId: $scope.story._id}, {reload: true});
        })
        .catch(function(err){
            console.error(err);
        })

    }

    //Listens for the event being emmited from navbar.main.controller that will run our saveImage() function
    $scope.$on('saveImage', function() {
        $scope.saveImage()
    })



  //--------DIRECTIVE--------//


    //-----ADDON FUNCTIONS-----//

    //Filters from Database Resolve
    $scope.allAddons = getAddons
    $scope.currentNav = 'navbarAddon'
    console.log($scope.allAddons)


    //Stickers
    var stickercounter = 0;
    var stickerIdCounter = 1;
    $scope.sticker = function (img){
        console.log('in sticker function in ctrl!!')
        console.log('STICKER', img)

        if(!$scope.stickersArray) $scope.stickersArray = []
        //Create image element with unique ID
        if(stickercounter < 4){
            //Push element data into the stickersArray;
            $scope.stickersArray.push({source: img, id: stickercounter, x: '0px', y: '0px'})
            console.log($scope.stickersArray)
            //Grab that element and set it to a variable;
            // w.appendChild(sticker)
            stickercounter++
            stickerIdCounter++;
      
        } else {
            onErrorFunc()
            console.log("Too Many Stickers!")
        }

    console.log($scope.stickersArray)
    }


    //Bubbles
    var bubblecounter = 0;  
    var bubbleIdcounter = 1;  
    $scope.bubble = function (bubbleName){
        currentBubbleType = bubbleName.split('_')
        console.log("BBBB", currentBubbleType[2])


        if(!$scope.bubblesArray && currentBubbleType[2] !== 'narration') $scope.bubblesArray = [];
        if(!$scope.narrationArray && currentBubbleType[2] === 'narration') $scope.narrationArray = [];


        // Creates an array of Pointer and PointerBorder Styling based on bubble name
        // CreateBubbleStyle function is in the bubbles.js file
        var currentBubbleStyle = createBubbleStyle(bubbleName)

        //While there are less then 4 bubbles, allow addition of bubbles
        if(bubblecounter < 4){
            //Push bubbles into correct arrays, which are ng-repeated in HTML
            if (currentBubbleType[2] === 'narration'){
                $scope.narrationArray.push({id: bubbleIdcounter, type: bubbleName, pointerStyle: currentBubbleStyle[0], pointerBorderStyle: currentBubbleStyle[1], x: '0px', y: '0px' })
            } else {
                $scope.bubblesArray.push({id: bubbleIdcounter, type: bubbleName, pointerStyle: currentBubbleStyle[0], pointerBorderStyle: currentBubbleStyle[1], x: '0px', y: '0px' })
            }
            bubblecounter++;
            bubbleIdcounter++;
            console.log($scope.bubblesArray, $scope.narrationArray)
        } else {
            onErrorFunc()
        }
    }  

    //Border  
    $scope.chosenBorder;
    $scope.border = function (img){
        console.log('BORDER', img)
        $scope.chosenBorder = {source: img}
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

        if (eventId[0] === 'n') {
            --bubblecounter
            console.log("bubblecounter", bubblecounter) 
            for (var i = 0; i < $scope.narrationArray.length; i++) {
                console.log("bubble ids", $scope.narrationArray[i].id, Number(eventId.slice(-1)))
                if($scope.narrationArray[i].id === Number(eventId.slice(-1))) {
                    $scope.narrationArray.splice(i, 1)
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
            // console.log("This Ran", currentElem.className)
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

        if(y > 60 && y < 600) {
            currentElem.style.top = y - diffY + 'px';
        }          
        if((x + 25) > 0 && x < 375) {   
            currentElem.style.left = x - diffX + 'px';
        }

    };


    $scope.onPress = function onPress (event) {

        var currentElem = document.getElementById(event.element[0].id);
        var currentx = event.center.x - 80,
            currenty = event.center.y - 130;

        // currentElem.style.left = currentx + 'px';
        // currentElem.style.top = currenty + 'px';

        //Find the sticker and make its background Active (red), and 'draggable'(doesnt do anything expcept allow the garbage can to be 'droppable later')
        $("#addonWrapper").find('#' + event.element[0].id).addClass('addonActive')

        //Add the delete Button onto the DOM
        $scope.currentNav = 'navbarDelete'

    };

    //This Function Runs once an addon is stopped dragging and/or a pressed addon is released
    $scope.onHammerEnd = function onHammerEnd (event) {

        // Grab Current Element
        var currentElem = document.getElementById(event.element[0].id)

        // Reshow the Addon Navbar
        $scope.currentNav = 'navbarAddon'



        // // var currentx = event.center.x - 80,
        // //     currenty = event.center.y - 130;
        // var currentx = currentElem.style.left,
        //     currenty = currentElem.style.top;

        //  if(event.element[0].id[0] === 's') {        
        //     var index;
        //     $scope.stickersArray.forEach(function(sticker, idx){
        //         if ('sticker'+sticker.id === event.element[0].id) {
        //             index = idx;
        //         }
        //     })
        //     // console.log("StickersArray HERE", $scope.stickersArray )
        //     $scope.stickersArray[index].x = currentx
        //     $scope.stickersArray[index].y = currenty
        // }
        // if(event.element[0].id[0] === 'b') {        
        //     var index;
        //     $scope.bubblesArray.forEach(function(bubble, idx){
        //         if ('bubble'+bubble.id === event.element[0].id) {
        //             index = idx;
        //         }
        //     })
        //     // console.log("StickersArray HERE", $scope.stickersArray )
        //     $scope.bubblesArray[index].x = currentx
        //     $scope.bubblesArray[index].y = currenty
        // }

        // //Update final resting coordinates of the current Element
        // updateCoordinates(event)




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


    // Update the final resting place coordinates for each Sticker/Bubble Div for drawing to canvas
    var updateCoordinates = function(event) {
        
        //find the current element
        var currentElem = document.getElementById(event.element[0].id)
        var currentx = currentElem.style.left,
            currenty = currentElem.style.top;        


        //If its a StickerArray Event:
        if(event.element[0].id[0] === 's') {        
            var index;
            $scope.stickersArray.forEach(function(sticker, idx){
                if ('sticker'+sticker.id === event.element[0].id) {
                    index = idx;
                }
            })
            console.log("StickersArray HERE", $scope.stickersArray )
            $scope.stickersArray[index].x = currentx
            $scope.stickersArray[index].y = currenty
        }

        //If its a BubbleArray Event:
        if(event.element[0].id[0] === 'b') { 

            var index;
            $scope.bubblesArray.forEach(function(bubble, idx){
                if ('bubble'+bubble.id === event.element[0].id) {
                    index = idx;
                    // console.log(idx)
                    // var currentPointer = document.getElementById('pointer' + (idx+1))
                    // console.log("currentPoint", currentPointer)
                    // var currentPointerx = currentPointer;
                    // var currentPointery = currentPointer.style.top;
                    // console.log(currentPointerx, currentPointery)
                    // var currentPointerBorder = document.getElementById('pointerBorder' + (idx+1))
                    // var currentPointerBorderx = currentPointerBorder.style.left;
                    // var currentPointerBordery = currentPointerBorder.style.top;
                    $scope.bubblesArray[index].x = currentx
                    $scope.bubblesArray[index].y = currenty
                    // $scope.bubblesArray[index].pointer.x = currentPointerx
                    // $scope.bubblesArray[index].pointer.y = currentPointery
                    // $scope.bubblesArray[index].pointerBorder.x = currentPointerBorderx
                    // $scope.bubblesArray[index].pointerBorder.y = currentPointerBordery
                }
            })
            // console.log("BubblesArray HERE", $scope.bubblesArray )


            console.log("UpdatedCoordinates ", $scope.bubblesArray)

        }

    }   

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

