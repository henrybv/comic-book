core.factory('StoryFactory', function($http) {

	var StoryFactoryObj = {};

	StoryFactoryObj.createNewStory = function(storyObj){
		console.log(storyObj);
		return $http.post(base + '/api/stories', storyObj)
		.then((res) => {
			console.log("story created front end!", res);
			return res.data;
		})
	};



	return StoryFactoryObj;

});