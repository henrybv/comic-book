core.factory('CameraFactory', function($http){
  var CameraFactory = {};
  
  //At point of saving image, creates the new square in the story and then calls the "save image function"
  CameraFactory.createSquare = function(dataUrl, storyId, userId){
    console.log('in camera factory')
    return $http.put(base + '/api/stories/' + storyId + '/squares', {creator: userId})
    .then(function(newSquare){
      console.log('created a new square', newSquare)
      var firebaseImagesOfStory = new Firebase("https://torrid-inferno-1552.firebaseio.com/" + storyId);
      firebaseImagesOfStory.child(String(newSquare.data._id)).set({'url': dataUrl})
      return $http.put(base + '/api/squares/' + newSquare.data._id, {finalImage: firebaseImagesOfStory + '/' + storyId + '/' + newSquare.data._id})
    })
    .then(function(updatedSquare){
      console.log('updated square with final image url', updatedSquare)
      return updatedSquare.data
    })
  }

  //DONT NEED THIS ANYMORE
  //get all images for a story
  // CameraFactory.getImages = function(storyId){
  //   $http.get(base + '/api/stories/' + storyId + '/squares')
  //   .then(function(storyWithSquares){
  //     var squares = storyWithSquares.data;
  //     var squareURIs = squares.map(function(square){
  //       firebaseImages.on('child_added', function(snapshot){
  //         return snapshot.val()
  //       }, function(errorObject){
  //         console.log('error: ', errorObject.code)
  //       })
  //     })
  //     return squareURIs;
  //   })
  // }

  //--------DIRECTIVE FUNCTIONS------//
  CameraFactory.getFilters = function(){
    console.log("Got into the factory")
    return $http.get(base + '/api/addons')
    .then(function(res) {
      console.log("addons", res.data);
      return res.data;
    })
  };

<<<<<<< Updated upstream
<<<<<<< HEAD


=======
>>>>>>> master
=======
>>>>>>> Stashed changes
  return CameraFactory;
})



