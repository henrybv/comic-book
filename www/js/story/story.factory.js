core.factory('StoryFactory', function($http, $localStorage) {

	var StoryFactory = {};


	StoryFactory.createNewStory = function(storyObj){
		return $http.post(base + '/api/stories', storyObj)
		.then(function(res) {
			return res.data;
		})
	};


	StoryFactory.getStoryById = function(storyId) {
		return $http.get(base + '/api/stories/' + storyId)
		.then(function(story) {
			return story.data;
		});
	};


	StoryFactory.getMyStories = function(userId){
		return $http.get(base + '/api/stories/user/' + userId)
		.then(function(res) {
			return res.data;
		});
	};

	StoryFactory.getMyCollabs = function(userId){
		return $http.get(base + '/api/stories/collaborator/' + userId)
		.then(function(res) {
			return res.data;
		});
	};

	StoryFactory.getStory = function(storyId){
		return $http.get(base + '/api/stories/' + storyId)
		.then(function(res) {
			return res.data;
		});
	};


	return StoryFactory;

});