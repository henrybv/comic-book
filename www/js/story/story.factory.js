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

	StoryFactory.getSquareById = function(squareId) {
		return $http.get(base + '/api/squares/' + squareId)
		.then(function(square) {
			return square.data;
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

	StoryFactory.addCollaborators = function(storyId, collabsArray) {
		return $http.put(base + '/api/stories/' + storyId +'/collaborators', {collaborators: collabsArray})
		.then(function(story) {
			return story.data;
		})
	};

	StoryFactory.deleteStory = function (storyId) {
		return $http.delete(base + '/api/stories/' + storyId)
		.then(function(story) {
			return story.data;
		});
	};

	StoryFactory.leaveCollab = function(storyId, userId){
		return $http.put(base + '/api/stories/' + storyId + '/leaveCollab/' + userId)
		.then(function(){
		})
	}

	StoryFactory.deleteSquare = function (storyId, squareId) {
		return $http.put(base + '/api/stories/' + storyId + '/squares/' + squareId)
		.then(function(story) {
			return story.data;
		});
	};


	return StoryFactory;

});