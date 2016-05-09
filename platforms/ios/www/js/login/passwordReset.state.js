app.config(function ($stateProvider) {
    $stateProvider.state('passwordReset', {
        url: '/user-profile/reset-password/:id',
        templateUrl: 'js/login/password.reset.template.html',
        controller: 'PasswordResetCtrl',
        resolve: {
            userToResetPassword: function($stateParams, UserFactory) {
                return UserFactory.getUser($stateParams.id);
            }
        }
    });
});
