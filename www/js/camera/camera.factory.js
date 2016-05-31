core.factory('CameraFactory', function($http){
  var CameraFactory = {};
  
  //At point of saving image, creates the new square in the story and then calls the "save image function"
  CameraFactory.createSquare = function(dataUrl, storyId, userId){
    return $http.put(base + '/api/stories/' + storyId + '/squares', {creator: userId})
    .then(function(newSquare){
      var firebaseImagesOfStory = new Firebase("https://torrid-inferno-1552.firebaseio.com/" + storyId);
      firebaseImagesOfStory.child(String(newSquare.data._id)).set({'url': dataUrl, 'creator': newSquare.data.creator})
      return $http.put(base + '/api/squares/' + newSquare.data._id, {finalImage: dataUrl})
    })
    .then(function(updatedSquare){
      return updatedSquare.data
    })
  }


  //--------DIRECTIVE FUNCTIONS------//
  CameraFactory.getFilters = function(){
    return $http.get(base + '/api/addons')
    .then(function(res) {
      return res.data;
    })
  };

  return CameraFactory;
})



