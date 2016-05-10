core.factory('StoryFactory', function($http, $localStorage) {

	var StoryFactory = {};


	StoryFactory.createNewStory = function(storyObj){
		return $http.post(base + '/api/stories', storyObj)
		.then(function(res) {
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


	StoryFactory.getAllStories = function(id){
		console.log('get all stories func')
		return $http.get(base + '/api/stories/user/' + id)
		.then(function(res) {
			console.log('response heard')
			return res.data;
		})
	};

	StoryFactory.getStory = function(id){
		return $http.get(base + '/api/stories/' + id)
		.then(function(res) {
			return res.data;
		})
	};


	return StoryFactory;

});