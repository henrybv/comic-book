core.factory('CameraFactory', function($http){
  var CameraFactory = {};
  
  //At point of saving image, creates the new square in the story and then calls the "save image function"
  CameraFactory.createSquareAndUpdateStory = function(dataUrl, storyId){
    console.log('factory hit')
    $http.put(base + '/api/stories/' + storyId + '/squares')
    .then(function(newSquare){
      console.log('square in factory after creating new square', newSquare.data)
      return saveImage(dataUrl, newSquare.data._id)
    // })
    // .then(function(square){
    //   console.log('square at the end', square)
    //   return square
    // })
  })
  }

  var firebaseImages = new Firebase("https://torrid-inferno-1552.firebaseio.com/");
  
  //save image function updates the square with link to image data
  //NEED TO PASS IN OWNER IN REQ BODY
  var saveImage = function(dataUrl, squareId){
    console.log('saveImage called')
    firebaseImages.child(String(squareId)).set({'url': dataUrl})
    $http.put(base + '/api/squares/' + squareId, {finalImage: firebaseImages + squareId})
    .then(function(updatedSquare){
      console.log('updatedSquare in factory after save', updatedSquare.data)
      return updatedSquare.data
    })
  }

//NEED TO DEBUG THIS
//get specific image
  CameraFactory.getImageURI = function(squareId){
    firebaseImages.on('child_added', function(snapshot){
      var dataURI = (snapshot.val());
      return dataURI;
    }, function(errorObject){
      console.log('error: ', errorObject.code)
    })
  }

  //NEED TO DEBUG THIS
  //get all images for a story
  CameraFactory.getImages = function(storyId){
    $http.get(base + '/api/stories/' + storyId + '/squares')
    .then(function(storyWithSquares){
      var squares = storyWithSquares.data;
      var squareURIs = squares.map(function(square){
        firebaseImages.on('child_added', function(snapshot){
          return snapshot.val()
        }, function(errorObject){
          console.log('error: ', errorObject.code)
        })
      })
      return squareURIs;
    })
  }



  return CameraFactory;
})


