app.controller('PasswordResetCtrl', function($scope, userToResetPassword, $state, UserFactory) {

  $scope.user = userToResetPassword;

  $scope.update = {passwordReset: false};

  $scope.updatePassword = function(){
    return UserFactory.updateUser($scope.user._id, $scope.update)
    .then(function(){
      $state.go('home')
    })
  }

});
