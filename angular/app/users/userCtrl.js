(function(){
    "use strict";

    /**
     * @ngdoc function
     * @name timeManager.controller:UserCtrl
     * @description
     * # UserCtrl
     * Controller of the timeManager
     */
    angular.module('app.controllers').controller('UserCtrl', function ($scope, mdDialogSrv, UserSrv) {

        $scope.getProfile   = function ()
        {
            UserSrv.me({}, function (result) {
                $scope.currentUser   = result.data;
            }, function (err) {

            });
        };

        $scope.openEditProfileDialog  = function (event)
        {
            mdDialogSrv.fromTemplate('./views/app/dialogs/edit_user.html', event, $scope);
        };

        $scope.getProfile();
    });
})();
