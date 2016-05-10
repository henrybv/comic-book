core.factory('StoryFactory', function($http, $localStorage) {

	var StoryFactoryObj = {};

	StoryFactoryObj.createNewStory = function(storyObj){
		return $http.post(base + '/api/stories', storyObj)
		.then(function(res) {
			console.log("story created front end!", res);
			return res.data;
		})
	};

	StoryFactoryObj.getAllStories = function(id){
		return $http.get(base + '/api/stories/user/' + id)
		.then(function(res) {
			return res.data;
		})
	};

	StoryFactoryObj.getStory = function(id){
		return $http.get(base + '/api/stories/' + id)
		.then(function(res) {
			return res.data;
		})
	};


	return StoryFactoryObj;

});