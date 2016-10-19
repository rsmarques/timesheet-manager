(function(){
    "use strict";

    /**
     * @ngdoc function
     * @name timeManager.controller:UserCtrl
     * @description
     * # UserCtrl
     * Controller of the timeManager
     */
    angular.module('app.controllers').controller('UserCtrl', function ($rootScope, $scope, mdDialogSrv, UserSrv) {

        $scope.getProfile   = function ()
        {
            UserSrv.me({}, function (result) {
                // storing in rootScope to share with other controllers
                $rootScope.me   = result.data;
            }, function (err) {

            });
        };

        $scope.openEditProfileDialog  = function (event)
        {
            $scope.currentUser   = $rootScope.me;
            mdDialogSrv.fromTemplate('./views/app/dialogs/edit_user.html', event, $scope);
        };

        $scope.openNewProfileDialog  = function (event)
        {
            $scope.currentUser   = {};
            mdDialogSrv.fromTemplate('./views/app/dialogs/edit_user.html', event, $scope);
        };

        $scope.getProfile();
    });
})();
