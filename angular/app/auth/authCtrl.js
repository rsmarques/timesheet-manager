(function(){
    "use strict";
    /**
     * @ngdoc function
     * @name timeManager.controller:AuthCtrl
     * @description
     * # AuthCtrl
     * Controller of the timeManager
     */
    angular.module('app.controllers').controller('AuthCtrl', function ($rootScope, $scope, $state, $location, $localStorage, AuthSrv) {

        function successAuth (res) {
            $localStorage.token = res.token;
            window.location     = "#/";
        }

        $scope.performLogin = function () {
            if ($scope.register) {
                return $scope.signup();
            } else {
                return $scope.signin();
            }
        };

        $scope.signin = function () {
            var formData        = $scope.credentials;
            $scope.authError    = null;

            AuthSrv.signin(formData, successAuth, function () {
                $scope.authError = 'Invalid email/password.';
            });
        };

        $scope.signup = function () {
            var formData        = $scope.credentials;
            $scope.authError    = null;

            AuthSrv.signup(formData, successAuth, function (err) {
                if (err.errors && err.errors[0]) {
                    $scope.authError    = err.errors[0];
                } else {
                    $scope.authError    = 'Failed to signup';
                }
            });
        };

        $scope.logout = function () {
            AuthSrv.logout(function () {
                window.location = "/";
            });
        };

         $scope.$on('$stateChangeSuccess', function () {
            $scope.register     = $state.current.register;
            $scope.loginText    = $scope.register ? 'Register' : 'Login';
            $scope.authError    = null;
         });

        $scope.token         = $localStorage.token;
        $scope.tokenClaims   = AuthSrv.getTokenClaims();
        $scope.credentials   = {};

    });
})();
