core.factory('StoryFactory', function($http) {

	var StoryFactory = {};

	StoryFactory.createNewStory = function(storyObj){
		console.log(storyObj);
		return $http.post(base + '/api/stories', storyObj)
		.then((res) => {
			console.log("story created front end!", res);
			return res.data;
		})
	};

	StoryFactory.getStoryById = function(storyId) {
		return $http.get(base + '/api/stories/' + storyId)
		.then(function(story) {
			return story.data;
		});
	};



	return StoryFactory;

});