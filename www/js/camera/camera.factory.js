core.factory('CameraFactory', function($http){
  var CameraFactory = {};
  
  //At point of saving image, creates the new square in the story and then calls the "save image function"
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
  
  return CameraFactory;
})


  // CameraFactory.urlToCanvas = function(url, canvasId){
  //       var newImage = new Image();
  //       newImage.src = url;
  //       var canvas = document.getElementById(canvasId)
  //       var context = canvas.getContext('2d');
  //       newImage.onload = function(){
  //           context.drawImage(newImage, 0, 0);
  //       }
  //   }


