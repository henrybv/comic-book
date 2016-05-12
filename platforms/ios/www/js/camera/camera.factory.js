core.factory('CameraFactory', function($http){
  var CameraFactory = {};
  
  //At point of saving image, creates the new square in the story and then calls the "save image function"
  CameraFactory.urlToCanvas = function(url, canvasId){
        var newImage = new Image();
        newImage.src = url;
        var canvas = document.getElementById(canvasId)
        var context = canvas.getContext('2d');
        newImage.onload = function(){
            context.drawImage(newImage, 0, 0);
        }
    }


  CameraFactory.createSquare = function(dataUrl, storyId, userId){
    return $http.put(base + '/api/stories/' + storyId + '/squares', {creator: userId})
    .then(function(newSquare){
      var firebaseImagesOfStory = new Firebase("https://torrid-inferno-1552.firebaseio.com/" + storyId);
      firebaseImagesOfStory.child(String(newSquare.data._id)).set({'url': dataUrl})
      return $http.put(base + '/api/squares/' + newSquare.data._id, {finalImage: firebaseImagesOfStory + '/' + storyId + '/' + newSquare.data._id})
    })
    .then(function(updatedSquare){
      return updatedSquare.data
    })
  }


//NEED TO DEBUG THIS
//get specific image
  CameraFactory.getImageURI = function(squareId, storyId){
    $http.get(base + '/api/squares/' + squareId)
    .then(function(square){
        console.log('got square in camera factory from route:', square)
        var firebaseImagesOfStory = new Firebase("https://torrid-inferno-1552.firebaseio.com/" + storyId);
        firebaseImagesOfStory.on('value', function(snapshot){
          console.log('snapshot', snapshot);
          console.log('snapshot.val', snapshot.val());
          var dataURI = (snapshot.val());
          return dataURI;
        }, function(errorObject){
          console.log('error: ', errorObject.code)
        })
      
    })
  }

  // //NEED TO DEBUG THIS
  // //get all images for a story
  // CameraFactory.getImages = function(storyId){
  //   var firebaseImagesOfStory = new Firebase("https://torrid-inferno-1552.firebaseio.com/" + storyId);
  //   $http.get(base + '/api/stories/' + storyId + '/squares')
  //   .then(function(storyWithSquares){
  //     console.log('story with squares in factory', storyWithSquares.data)
  //     var squares = storyWithSquares.data;
  //     var squareURIs = squares.map(function(square){
  //       var firebaseImagesOfStory = new Firebase("https://torrid-inferno-1552.firebaseio.com/" + storyId);
  //       firebaseImagesOfStory.on('value', function(snapshot){
  //         console.log('snapshot', snapshot)
  //         console.log('snapshot.val', snapshot.val())
  //         return snapshot.val()
  //       }, function(errorObject){
  //         console.log('error: ', errorObject.code)
  //       })
  //     })
  //     return squareURIs;
  //   })
  // }



  return CameraFactory;
})


