(function(){
    "use strict";

    var app = angular.module('app', [
        'app.controllers',
        'app.services',
        'app.routes',
        'app.config'
    ]);


    angular.module('app.routes', ['ui.router', 'ngStorage']);
    angular.module('app.controllers', ['ui.router', 'ngMaterial', 'ngResource', 'ngMessages', 'ngStorage']);
    angular.module('app.services', []);
    angular.module('app.config', []);

})();

(function(){
    "use strict";

    angular.module('app.config').config(["$mdIconProvider", function($mdIconProvider) {
        $mdIconProvider.fontSet('md', 'material-icons');
    }])

    .config(["$mdThemingProvider", function($mdThemingProvider) {
        $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
        $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
        $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    }])

    .constant('API_URL', 'api/');

})();
(function(){
    "use strict";

    angular.module('app.routes').config(["$stateProvider", "$urlRouterProvider", "$httpProvider", function ($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider

            .state('signup', {
                url: '/signup',
                templateUrl: './views/app/auth/auth.html',
                controller: 'AuthCtrl',
                register: 1,
            })
            .state('signin', {
                url: '/signin',
                templateUrl: './views/app/auth/auth.html',
                controller: 'AuthCtrl',
                register: 0,
            })
            .state('logout', {
                url: '/logout',
                templateUrl: './views/app/auth/auth.html',
                controller: 'AuthCtrl',
                logout: 1,
            })
            .state('users', {
                url: '/users',
                templateUrl: './views/app/users/user.html',
                controller: 'UserCtrl'
            })
            .state('worksheets', {
                url: '/',
                templateUrl: './views/app/worksheets/worksheet.html',
                controller: 'WorksheetCtrl'
            });

        $urlRouterProvider.otherwise('/');

        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    }
                    return config;
                },
                'responseError': function (response) {
                    if (response.status === 400 || response.status === 401 || response.status === 403) {
                        $location.path('/signin');
                    }
                    return $q.reject(response);
                }
            };
        }]);
    }]);
})();
(function(){
    "use strict";
    /**
     * @ngdoc function
     * @name timeManager.controller:AuthCtrl
     * @description
     * # AuthCtrl
     * Controller of the timeManager
     */
    angular.module('app.controllers').controller('AuthCtrl', ["$rootScope", "$scope", "$state", "$location", "$localStorage", "AuthSrv", function ($rootScope, $scope, $state, $location, $localStorage, AuthSrv) {

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

        $scope.performLogout = function () {
            AuthSrv.logout(function () {
                window.location = "#/signin";
            });
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

        // Redefining page status for login/logout/register
        $scope.$on('$stateChangeSuccess', function () {
            $scope.logout       = $state.current.logout;
            if ($scope.logout) {
                $scope.performLogout();
            }

            $scope.register     = $state.current.register;
            $scope.loginText    = $scope.register ? 'Register' : 'Login';
            $scope.authError    = null;
        });

        $scope.token            = $localStorage.token;
        $scope.tokenClaims      = AuthSrv.getTokenClaims();
        $scope.credentials      = {};

    }]);
})();

angular.module('app.services')

    .factory('AuthSrv', ["$http", "API_URL", "$localStorage", function ($http, API_URL, $localStorage) {
        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getClaimsFromToken() {
            var token = $localStorage.token;
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var tokenClaims = getClaimsFromToken();

        return {
            signup: function (data, success, error) {
                $http.post(API_URL + 'users/signup', data).success(success).error(error);
            },
            signin: function (data, success, error) {
                $http.post(API_URL + 'users/signin', data).success(success).error(error);
            },
            logout: function (success) {
                tokenClaims = {};
                delete $localStorage.token;
                success();
            },
            getTokenClaims: function () {
                return tokenClaims;
            }
        };
    }]);
(function(){
    "use strict";

    /**
     * @ngdoc function
     * @name timeManager.controller:UserCtrl
     * @description
     * # UserCtrl
     * Controller of the timeManager
     */
    angular.module('app.controllers').controller('UserCtrl', ["$scope", "UserSrv", function ($scope, UserSrv) {

        console.log('UserCtrl');
    }]);
})();

angular.module('app.services')

    .factory('UserSrv', ["$resource", "API_URL", function ($resource, API_URL) {
        return $resource(API_URL + 'users/:id', {}, {

            getUsers: {
                method: 'GET',
                params: {
                    id: '@id',
                }
            },

            get: {
                method: 'GET',
                params: {
                    id: '@id',
                }
            },

            create: {
                method: 'POST',
                params: {
                    id: '@id',
                    email: '@email',
                    password: '@password',
                    first_name: '@first_name',
                    last_name: '@last_name',
                    username: '@username',
                    profile_image: '@profile_image',
                    role: '@role',
                    working_hours: '@working_hours',
                }
            },

            update: {
                method: 'PUT',
                params: {
                    id: '@id',
                    email: '@email',
                    password: '@password',
                    first_name: '@first_name',
                    last_name: '@last_name',
                    username: '@username',
                    profile_image: '@profile_image',
                    role: '@role',
                    working_hours: '@working_hours',
                }
            },

            delete: {
                method: 'DELETE',
                params: {
                    id: '@id',
                }
            },
        });
    }]);

(function(){
    "use strict";

    /**
     * @ngdoc function
     * @name timeManager.controller:WorksheetCtrl
     * @description
     * # WorksheetCtrl
     * Controller of the timeManager
     */
    angular.module('app.controllers').controller('WorksheetCtrl', ["$scope", "mdMenuSrv", "mdDialogSrv", "mdToastSrv", "WorksheetSrv", "UserSrv", function ($scope, mdMenuSrv, mdDialogSrv, mdToastSrv, WorksheetSrv, UserSrv) {

        $scope.openMenu = function ($mdOpenMenu, ev)
        {
            mdMenuSrv.openMenu($mdOpenMenu, ev);
        };

        $scope.openDeleteWorksheetDialog    = function (event, worksheet)
        {
            var params  = {
                'title'         : 'Are you sure you want to delete this worksheet?',
                'textContent'   : 'This action cannot be undone',
                'ariaLabel'     : 'deleteWorksheet',
                'ok'            : 'Yes',
                'cancel'        : 'Cancel',
            };

            mdDialogSrv.confirm(event, params, function (success) {
                $scope.deleteWorksheet(worksheet);

            }, function (err) {

            });
        };

        $scope.openEditUserDialog   = function (event)
        {
            mdDialogSrv.fromTemplate('./views/app/dialogs/edit_user.html', event, $scope);
        };

        $scope.openEditWorksheetDialog  = function (event, worksheet)
        {
            $scope.currentWorksheet     = worksheet;
            // creating a javascript date from string
            if (worksheet.date) {
                $scope.currentWorksheet.dateJS  = new Date(worksheet.date);
            }

            mdDialogSrv.fromTemplate('./views/app/dialogs/edit_worksheet.html', event, $scope);
        };

        // ----

        $scope.worksheetFilter = function ()
        {
            return function (worksheet) {
                return (!$scope.filters.start_date || new Date(worksheet.date) >= $scope.filters.start_date) &&
                    (!$scope.filters.end_date || new Date(worksheet.date) <= $scope.filters.end_date);
            };
        };

        $scope.selectUser   = function (user)
        {
            $scope.worksheets       = [];
            $scope.currentUser      = user;

            WorksheetSrv.userWorksheets({'userId' : user.id}, function (result) {
                $scope.worksheets   = result.data;

            }, function (err) {

            });
        };

        $scope.sortUsers    = function (sort, reverse)
        {
            $scope.userSort         = sort;
            $scope.userSortReverse  = reverse;
        };

        $scope.deleteWorksheet  = function (worksheet)
        {
            if (!worksheet.id) {
                // no worksheet to delete
                return false;
            }

            WorksheetSrv.delete({id : worksheet.id}, function (success) {

                var worksheetIndex  = $scope.worksheets.indexOf(worksheet);

                if (worksheetIndex !== -1) {
                    $scope.worksheets.splice(worksheetIndex, 1);
                }

                mdToastSrv.show({'content' : 'Worksheet Deleted!', 'position' : 'top right', 'delay' : 3000});

            }, function (err) {

            });
        };

        $scope.cancelEditUser   = function ()
        {
            mdDialogSrv.cancel();
        };

        $scope.finishEditUser   = function (user)
        {
            $scope.saveUser(user);
            mdDialogSrv.hide();
        };

        $scope.saveUser = function (user)
        {
            var method  = user.id ? 'update' : 'create';

            UserSrv[method](user, function (result) {
                // TODO insert in DOM + toast

            }, function (err) {
                // TODO toast
            });
        };

        $scope.cancelEditWorksheet  = function ()
        {
            mdDialogSrv.cancel();
        };

        $scope.finishEditWorksheet  = function ()
        {
            $scope.saveWorksheet();
            mdDialogSrv.hide();
        };

        $scope.saveWorksheet    = function ()
        {
            var method                      = $scope.currentWorksheet.id ? 'update' : 'create';
            // parsing date and user_id
            $scope.currentWorksheet.user_id = $scope.currentWorksheet.user_id ? $scope.currentWorksheet.user_id : $scope.currentUser.id;
            $scope.currentWorksheet.date    = $scope.currentWorksheet.dateJS ? $scope.currentWorksheet.dateJS.toISOString().substring(0, 10) : $scope.currentWorksheet.date;

            if ($scope.currentWorksheet.new_note) {
                $scope.createNote();
            }

            WorksheetSrv[method]($scope.currentWorksheet, function (result) {

                var worksheet   = result.data;
                // inserting worksheet in DOM
                var index       = $scope.worksheets.map(function (w) { return w.id; }).indexOf(worksheet.id);

                if (index === -1) {
                    // worksheet not on list, creating entry
                    var data    = (JSON.parse(JSON.stringify(worksheet)));
                    $scope.worksheets.unshift(data);
                    mdToastSrv.show({'content' : 'Successfully Created Worksheet!', 'position' : 'top right', 'delay' : 3000});
                }

            }, function (err) {
                mdToastSrv.err({'content' : 'Error Editing Worksheet!', 'position' : 'top right', 'delay' : 3000});
            });
        };

        $scope.deleteNote   = function (index)
        {
            $scope.currentWorksheet.notes.splice(index, 1);

            return true;
        };

        $scope.createNote   = function ()
        {
            if (!$scope.currentWorksheet.new_note) return false;

            if (!$scope.currentWorksheet.notes) {
                $scope.currentWorksheet.notes   = [];
            }

            $scope.currentWorksheet.notes.push($scope.currentWorksheet.new_note);
            $scope.currentWorksheet.new_note    = null;

            return true;
        };

        // -----------

        UserSrv.getUsers({}, function (result) {
            $scope.users    = result.data;

        }, function (err) {
            // TODO error treatment
        });

        $scope.filters  = {};
    }]);
})();

angular.module('app.services')

    .factory('WorksheetSrv', ["$resource", "API_URL", function ($resource, API_URL) {
        return $resource(API_URL + 'worksheets/:id', {}, {

            userWorksheets: {
                url: API_URL + 'user/:userId/worksheets',
                method: 'GET',
                params: {
                    id: '@id',
                }
            },

            get: {
                method: 'GET',
                params: {
                    id: '@id',
                }
            },

            create: {
                method: 'POST',
                params: {
                    id: '@id',
                    date: '@date',
                    hours: '@hours',
                    user_id: '@user_id',
                    notes: '@notes',
                }
            },

            update: {
                method: 'PUT',
                params: {
                    id: '@id',
                    date: '@date',
                    hours: '@hours',
                    user_id: '@user_id',
                    notes: '@notes',
                }
            },

            delete: {
                method: 'DELETE',
                params: {
                    id: '@id',
                }
            },

        });
    }]);

angular.module('app.services')

    .factory('mdDialogSrv', ["$mdDialog", function ($mdDialog) {

        return {
            fromTemplate: function (template, event, $scope) {

                var options = {
                    templateUrl: template,
                    targetEvent: event,
                    clickOutsideToClose: true
                };

                if ($scope) {
                    options.scope = $scope.$new();
                }

                return $mdDialog.show(options);
            },

            hide: function () {
                return $mdDialog.hide();
            },

            cancel: function () {
                return $mdDialog.cancel();
            },

            alert: function (title, content){
                $mdDialog.show(
                    $mdDialog.alert()
                        .title(title)
                        .content(content)
                        .ok('Ok')
                );
            },

            confirm: function (event, params, success, err) {
                var confirm     = $mdDialog.confirm()
                    .title(params.title)
                    .textContent(params.textContent)
                    .ariaLabel(params.ariaLabel)
                    .targetEvent(event)
                    .ok(params.ok)
                    .cancel(params.cancel);

                $mdDialog.show(confirm).then(success, err);
            }
        };
    }]);

angular.module('app.services')

    .service('mdMenuSrv', function () {
        return {

            openMenu : function ($mdOpenMenu, event) {
                originatorEv = event;
                $mdOpenMenu(event);
            }
        };
    });
angular.module('app.services')

    .factory('mdToastSrv', ["$mdToast", function ($mdToast) {

        return {

            show: function (params) {

                return $mdToast.show(
                    $mdToast.simple()
                        .content(params.content)
                        .position(params.position)
                        .hideDelay(params.delay)
                );
            },
            error: function (params) {

                return $mdToast.show(
                    $mdToast.simple()
                        .content(params.content)
                        .position(params.position)
                        .theme('warn')
                        .hideDelay(params.delay)
                );
            }
        };
    }]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC91c2Vycy91c2VyQ3RybC5qcyIsImFwcC91c2Vycy91c2VyU3J2LmpzIiwiYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Q3RybC5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldFNydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL2RpYWxvZ1Nydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL21lbnVTcnYuanMiLCJzZXJ2aWNlcy9tYXRlcmlhbC90b2FzdFNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUEsYUFBQTtJQUNBLFFBQUEsT0FBQSxtQkFBQSxDQUFBLGFBQUEsY0FBQSxjQUFBLGNBQUE7SUFDQSxRQUFBLE9BQUEsZ0JBQUE7SUFDQSxRQUFBLE9BQUEsY0FBQTs7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLDJCQUFBLFNBQUEsaUJBQUE7UUFDQSxnQkFBQSxRQUFBLE1BQUE7OztLQUdBLDhCQUFBLFNBQUEsb0JBQUE7UUFDQSxtQkFBQSxNQUFBLGFBQUEsa0JBQUEsUUFBQTtRQUNBLG1CQUFBLE1BQUEsZUFBQSxrQkFBQSxVQUFBO1FBQ0EsbUJBQUEsTUFBQSxlQUFBLGtCQUFBLGVBQUE7UUFDQSxtQkFBQSxNQUFBLGFBQUEsa0JBQUEsUUFBQTs7O0tBR0EsU0FBQSxXQUFBOzs7QUNkQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxRQUFBLE9BQUEsY0FBQSxpRUFBQSxVQUFBLGdCQUFBLG9CQUFBLGVBQUE7O1FBRUE7O2FBRUEsTUFBQSxVQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBO2dCQUNBLFVBQUE7O2FBRUEsTUFBQSxVQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBO2dCQUNBLFVBQUE7O2FBRUEsTUFBQSxVQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBO2dCQUNBLFFBQUE7O2FBRUEsTUFBQSxTQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzthQUVBLE1BQUEsY0FBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7O1FBR0EsbUJBQUEsVUFBQTs7UUFFQSxjQUFBLGFBQUEsS0FBQSxDQUFBLE1BQUEsYUFBQSxpQkFBQSxVQUFBLElBQUEsV0FBQSxlQUFBO1lBQ0EsT0FBQTtnQkFDQSxXQUFBLFVBQUEsUUFBQTtvQkFDQSxPQUFBLFVBQUEsT0FBQSxXQUFBO29CQUNBLElBQUEsY0FBQSxPQUFBO3dCQUNBLE9BQUEsUUFBQSxnQkFBQSxZQUFBLGNBQUE7O29CQUVBLE9BQUE7O2dCQUVBLGlCQUFBLFVBQUEsVUFBQTtvQkFDQSxJQUFBLFNBQUEsV0FBQSxPQUFBLFNBQUEsV0FBQSxPQUFBLFNBQUEsV0FBQSxLQUFBO3dCQUNBLFVBQUEsS0FBQTs7b0JBRUEsT0FBQSxHQUFBLE9BQUE7Ozs7OztBQ25EQSxDQUFBLFVBQUE7SUFDQTs7Ozs7Ozs7SUFRQSxRQUFBLE9BQUEsbUJBQUEsV0FBQSx3RkFBQSxVQUFBLFlBQUEsUUFBQSxRQUFBLFdBQUEsZUFBQSxTQUFBOztRQUVBLFNBQUEsYUFBQSxLQUFBO1lBQ0EsY0FBQSxRQUFBLElBQUE7WUFDQSxPQUFBLGVBQUE7OztRQUdBLE9BQUEsZUFBQSxZQUFBO1lBQ0EsSUFBQSxPQUFBLFVBQUE7Z0JBQ0EsT0FBQSxPQUFBO21CQUNBO2dCQUNBLE9BQUEsT0FBQTs7OztRQUlBLE9BQUEsZ0JBQUEsWUFBQTtZQUNBLFFBQUEsT0FBQSxZQUFBO2dCQUNBLE9BQUEsV0FBQTs7OztRQUlBLE9BQUEsU0FBQSxZQUFBO1lBQ0EsSUFBQSxrQkFBQSxPQUFBO1lBQ0EsT0FBQSxlQUFBOztZQUVBLFFBQUEsT0FBQSxVQUFBLGFBQUEsWUFBQTtnQkFDQSxPQUFBLFlBQUE7Ozs7UUFJQSxPQUFBLFNBQUEsWUFBQTtZQUNBLElBQUEsa0JBQUEsT0FBQTtZQUNBLE9BQUEsZUFBQTs7WUFFQSxRQUFBLE9BQUEsVUFBQSxhQUFBLFVBQUEsS0FBQTtnQkFDQSxJQUFBLElBQUEsVUFBQSxJQUFBLE9BQUEsSUFBQTtvQkFDQSxPQUFBLGVBQUEsSUFBQSxPQUFBO3VCQUNBO29CQUNBLE9BQUEsZUFBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLHVCQUFBLFlBQUE7WUFDQSxPQUFBLGVBQUEsT0FBQSxRQUFBO1lBQ0EsSUFBQSxPQUFBLFFBQUE7Z0JBQ0EsT0FBQTs7O1lBR0EsT0FBQSxlQUFBLE9BQUEsUUFBQTtZQUNBLE9BQUEsZUFBQSxPQUFBLFdBQUEsYUFBQTtZQUNBLE9BQUEsZUFBQTs7O1FBR0EsT0FBQSxtQkFBQSxjQUFBO1FBQ0EsT0FBQSxtQkFBQSxRQUFBO1FBQ0EsT0FBQSxtQkFBQTs7Ozs7QUNsRUEsUUFBQSxPQUFBOztLQUVBLFFBQUEsaURBQUEsVUFBQSxPQUFBLFNBQUEsZUFBQTtRQUNBLFNBQUEsZ0JBQUEsS0FBQTtZQUNBLElBQUEsU0FBQSxJQUFBLFFBQUEsS0FBQSxLQUFBLFFBQUEsS0FBQTtZQUNBLFFBQUEsT0FBQSxTQUFBO2dCQUNBLEtBQUE7b0JBQ0E7Z0JBQ0EsS0FBQTtvQkFDQSxVQUFBO29CQUNBO2dCQUNBLEtBQUE7b0JBQ0EsVUFBQTtvQkFDQTtnQkFDQTtvQkFDQSxNQUFBOztZQUVBLE9BQUEsT0FBQSxLQUFBOzs7UUFHQSxTQUFBLHFCQUFBO1lBQ0EsSUFBQSxRQUFBLGNBQUE7WUFDQSxJQUFBLE9BQUE7WUFDQSxJQUFBLE9BQUEsVUFBQSxhQUFBO2dCQUNBLElBQUEsVUFBQSxNQUFBLE1BQUEsS0FBQTtnQkFDQSxPQUFBLEtBQUEsTUFBQSxnQkFBQTs7WUFFQSxPQUFBOzs7UUFHQSxJQUFBLGNBQUE7O1FBRUEsT0FBQTtZQUNBLFFBQUEsVUFBQSxNQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLEtBQUEsVUFBQSxnQkFBQSxNQUFBLFFBQUEsU0FBQSxNQUFBOztZQUVBLFFBQUEsVUFBQSxNQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLEtBQUEsVUFBQSxnQkFBQSxNQUFBLFFBQUEsU0FBQSxNQUFBOztZQUVBLFFBQUEsVUFBQSxTQUFBO2dCQUNBLGNBQUE7Z0JBQ0EsT0FBQSxjQUFBO2dCQUNBOztZQUVBLGdCQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7OztBQzdDQSxDQUFBLFVBQUE7SUFDQTs7Ozs7Ozs7O0lBU0EsUUFBQSxPQUFBLG1CQUFBLFdBQUEsa0NBQUEsVUFBQSxRQUFBLFNBQUE7O1FBRUEsUUFBQSxJQUFBOzs7O0FDWkEsUUFBQSxPQUFBOztLQUVBLFFBQUEsb0NBQUEsVUFBQSxXQUFBLFNBQUE7UUFDQSxPQUFBLFVBQUEsVUFBQSxhQUFBLElBQUE7O1lBRUEsVUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7OztZQUlBLEtBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7WUFJQSxRQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBO29CQUNBLE9BQUE7b0JBQ0EsVUFBQTtvQkFDQSxZQUFBO29CQUNBLFdBQUE7b0JBQ0EsVUFBQTtvQkFDQSxlQUFBO29CQUNBLE1BQUE7b0JBQ0EsZUFBQTs7OztZQUlBLFFBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7b0JBQ0EsT0FBQTtvQkFDQSxVQUFBO29CQUNBLFlBQUE7b0JBQ0EsV0FBQTtvQkFDQSxVQUFBO29CQUNBLGVBQUE7b0JBQ0EsTUFBQTtvQkFDQSxlQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7Ozs7O0FDcERBLENBQUEsVUFBQTtJQUNBOzs7Ozs7Ozs7SUFTQSxRQUFBLE9BQUEsbUJBQUEsV0FBQSxpR0FBQSxVQUFBLFFBQUEsV0FBQSxhQUFBLFlBQUEsY0FBQSxTQUFBOztRQUVBLE9BQUEsV0FBQSxVQUFBLGFBQUE7UUFDQTtZQUNBLFVBQUEsU0FBQSxhQUFBOzs7UUFHQSxPQUFBLCtCQUFBLFVBQUEsT0FBQTtRQUNBO1lBQ0EsSUFBQSxVQUFBO2dCQUNBLGtCQUFBO2dCQUNBLGtCQUFBO2dCQUNBLGtCQUFBO2dCQUNBLGtCQUFBO2dCQUNBLGtCQUFBOzs7WUFHQSxZQUFBLFFBQUEsT0FBQSxRQUFBLFVBQUEsU0FBQTtnQkFDQSxPQUFBLGdCQUFBOztlQUVBLFVBQUEsS0FBQTs7Ozs7UUFLQSxPQUFBLHVCQUFBLFVBQUE7UUFDQTtZQUNBLFlBQUEsYUFBQSxzQ0FBQSxPQUFBOzs7UUFHQSxPQUFBLDJCQUFBLFVBQUEsT0FBQTtRQUNBO1lBQ0EsT0FBQSx1QkFBQTs7WUFFQSxJQUFBLFVBQUEsTUFBQTtnQkFDQSxPQUFBLGlCQUFBLFVBQUEsSUFBQSxLQUFBLFVBQUE7OztZQUdBLFlBQUEsYUFBQSwyQ0FBQSxPQUFBOzs7OztRQUtBLE9BQUEsa0JBQUE7UUFDQTtZQUNBLE9BQUEsVUFBQSxXQUFBO2dCQUNBLE9BQUEsQ0FBQSxDQUFBLE9BQUEsUUFBQSxjQUFBLElBQUEsS0FBQSxVQUFBLFNBQUEsT0FBQSxRQUFBO3FCQUNBLENBQUEsT0FBQSxRQUFBLFlBQUEsSUFBQSxLQUFBLFVBQUEsU0FBQSxPQUFBLFFBQUE7Ozs7UUFJQSxPQUFBLGVBQUEsVUFBQTtRQUNBO1lBQ0EsT0FBQSxtQkFBQTtZQUNBLE9BQUEsbUJBQUE7O1lBRUEsYUFBQSxlQUFBLENBQUEsV0FBQSxLQUFBLEtBQUEsVUFBQSxRQUFBO2dCQUNBLE9BQUEsZUFBQSxPQUFBOztlQUVBLFVBQUEsS0FBQTs7Ozs7UUFLQSxPQUFBLGVBQUEsVUFBQSxNQUFBO1FBQ0E7WUFDQSxPQUFBLG1CQUFBO1lBQ0EsT0FBQSxtQkFBQTs7O1FBR0EsT0FBQSxtQkFBQSxVQUFBO1FBQ0E7WUFDQSxJQUFBLENBQUEsVUFBQSxJQUFBOztnQkFFQSxPQUFBOzs7WUFHQSxhQUFBLE9BQUEsQ0FBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLFNBQUE7O2dCQUVBLElBQUEsa0JBQUEsT0FBQSxXQUFBLFFBQUE7O2dCQUVBLElBQUEsbUJBQUEsQ0FBQSxHQUFBO29CQUNBLE9BQUEsV0FBQSxPQUFBLGdCQUFBOzs7Z0JBR0EsV0FBQSxLQUFBLENBQUEsWUFBQSxzQkFBQSxhQUFBLGFBQUEsVUFBQTs7ZUFFQSxVQUFBLEtBQUE7Ozs7O1FBS0EsT0FBQSxtQkFBQTtRQUNBO1lBQ0EsWUFBQTs7O1FBR0EsT0FBQSxtQkFBQSxVQUFBO1FBQ0E7WUFDQSxPQUFBLFNBQUE7WUFDQSxZQUFBOzs7UUFHQSxPQUFBLFdBQUEsVUFBQTtRQUNBO1lBQ0EsSUFBQSxVQUFBLEtBQUEsS0FBQSxXQUFBOztZQUVBLFFBQUEsUUFBQSxNQUFBLFVBQUEsUUFBQTs7O2VBR0EsVUFBQSxLQUFBOzs7OztRQUtBLE9BQUEsdUJBQUE7UUFDQTtZQUNBLFlBQUE7OztRQUdBLE9BQUEsdUJBQUE7UUFDQTtZQUNBLE9BQUE7WUFDQSxZQUFBOzs7UUFHQSxPQUFBLG1CQUFBO1FBQ0E7WUFDQSxJQUFBLDhCQUFBLE9BQUEsaUJBQUEsS0FBQSxXQUFBOztZQUVBLE9BQUEsaUJBQUEsVUFBQSxPQUFBLGlCQUFBLFVBQUEsT0FBQSxpQkFBQSxVQUFBLE9BQUEsWUFBQTtZQUNBLE9BQUEsaUJBQUEsVUFBQSxPQUFBLGlCQUFBLFNBQUEsT0FBQSxpQkFBQSxPQUFBLGNBQUEsVUFBQSxHQUFBLE1BQUEsT0FBQSxpQkFBQTs7WUFFQSxJQUFBLE9BQUEsaUJBQUEsVUFBQTtnQkFDQSxPQUFBOzs7WUFHQSxhQUFBLFFBQUEsT0FBQSxrQkFBQSxVQUFBLFFBQUE7O2dCQUVBLElBQUEsY0FBQSxPQUFBOztnQkFFQSxJQUFBLGNBQUEsT0FBQSxXQUFBLElBQUEsVUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsUUFBQSxVQUFBOztnQkFFQSxJQUFBLFVBQUEsQ0FBQSxHQUFBOztvQkFFQSxJQUFBLFdBQUEsS0FBQSxNQUFBLEtBQUEsVUFBQTtvQkFDQSxPQUFBLFdBQUEsUUFBQTtvQkFDQSxXQUFBLEtBQUEsQ0FBQSxZQUFBLG1DQUFBLGFBQUEsYUFBQSxVQUFBOzs7ZUFHQSxVQUFBLEtBQUE7Z0JBQ0EsV0FBQSxJQUFBLENBQUEsWUFBQSw0QkFBQSxhQUFBLGFBQUEsVUFBQTs7OztRQUlBLE9BQUEsZUFBQSxVQUFBO1FBQ0E7WUFDQSxPQUFBLGlCQUFBLE1BQUEsT0FBQSxPQUFBOztZQUVBLE9BQUE7OztRQUdBLE9BQUEsZUFBQTtRQUNBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsaUJBQUEsVUFBQSxPQUFBOztZQUVBLElBQUEsQ0FBQSxPQUFBLGlCQUFBLE9BQUE7Z0JBQ0EsT0FBQSxpQkFBQSxVQUFBOzs7WUFHQSxPQUFBLGlCQUFBLE1BQUEsS0FBQSxPQUFBLGlCQUFBO1lBQ0EsT0FBQSxpQkFBQSxjQUFBOztZQUVBLE9BQUE7Ozs7O1FBS0EsUUFBQSxTQUFBLElBQUEsVUFBQSxRQUFBO1lBQ0EsT0FBQSxXQUFBLE9BQUE7O1dBRUEsVUFBQSxLQUFBOzs7O1FBSUEsT0FBQSxXQUFBOzs7O0FDbk1BLFFBQUEsT0FBQTs7S0FFQSxRQUFBLHlDQUFBLFVBQUEsV0FBQSxTQUFBO1FBQ0EsT0FBQSxVQUFBLFVBQUEsa0JBQUEsSUFBQTs7WUFFQSxnQkFBQTtnQkFDQSxLQUFBLFVBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7WUFJQSxLQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxNQUFBO29CQUNBLE9BQUE7b0JBQ0EsU0FBQTtvQkFDQSxPQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxNQUFBO29CQUNBLE9BQUE7b0JBQ0EsU0FBQTtvQkFDQSxPQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7Ozs7OztBQzdDQSxRQUFBLE9BQUE7O0tBRUEsUUFBQSw2QkFBQSxVQUFBLFdBQUE7O1FBRUEsT0FBQTtZQUNBLGNBQUEsVUFBQSxVQUFBLE9BQUEsUUFBQTs7Z0JBRUEsSUFBQSxVQUFBO29CQUNBLGFBQUE7b0JBQ0EsYUFBQTtvQkFDQSxxQkFBQTs7O2dCQUdBLElBQUEsUUFBQTtvQkFDQSxRQUFBLFFBQUEsT0FBQTs7O2dCQUdBLE9BQUEsVUFBQSxLQUFBOzs7WUFHQSxNQUFBLFlBQUE7Z0JBQ0EsT0FBQSxVQUFBOzs7WUFHQSxRQUFBLFlBQUE7Z0JBQ0EsT0FBQSxVQUFBOzs7WUFHQSxPQUFBLFVBQUEsT0FBQSxRQUFBO2dCQUNBLFVBQUE7b0JBQ0EsVUFBQTt5QkFDQSxNQUFBO3lCQUNBLFFBQUE7eUJBQ0EsR0FBQTs7OztZQUlBLFNBQUEsVUFBQSxPQUFBLFFBQUEsU0FBQSxLQUFBO2dCQUNBLElBQUEsY0FBQSxVQUFBO3FCQUNBLE1BQUEsT0FBQTtxQkFDQSxZQUFBLE9BQUE7cUJBQ0EsVUFBQSxPQUFBO3FCQUNBLFlBQUE7cUJBQ0EsR0FBQSxPQUFBO3FCQUNBLE9BQUEsT0FBQTs7Z0JBRUEsVUFBQSxLQUFBLFNBQUEsS0FBQSxTQUFBOzs7OztBQzlDQSxRQUFBLE9BQUE7O0tBRUEsUUFBQSxhQUFBLFlBQUE7UUFDQSxPQUFBOztZQUVBLFdBQUEsVUFBQSxhQUFBLE9BQUE7Z0JBQ0EsZUFBQTtnQkFDQSxZQUFBOzs7O0FDUEEsUUFBQSxPQUFBOztLQUVBLFFBQUEsMkJBQUEsVUFBQSxVQUFBOztRQUVBLE9BQUE7O1lBRUEsTUFBQSxVQUFBLFFBQUE7O2dCQUVBLE9BQUEsU0FBQTtvQkFDQSxTQUFBO3lCQUNBLFFBQUEsT0FBQTt5QkFDQSxTQUFBLE9BQUE7eUJBQ0EsVUFBQSxPQUFBOzs7WUFHQSxPQUFBLFVBQUEsUUFBQTs7Z0JBRUEsT0FBQSxTQUFBO29CQUNBLFNBQUE7eUJBQ0EsUUFBQSxPQUFBO3lCQUNBLFNBQUEsT0FBQTt5QkFDQSxNQUFBO3lCQUNBLFVBQUEsT0FBQTs7Ozs7QUFLQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuICAgICAgICAnYXBwLmNvbnRyb2xsZXJzJyxcbiAgICAgICAgJ2FwcC5zZXJ2aWNlcycsXG4gICAgICAgICdhcHAucm91dGVzJyxcbiAgICAgICAgJ2FwcC5jb25maWcnXG4gICAgXSk7XG5cblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAucm91dGVzJywgWyd1aS5yb3V0ZXInLCAnbmdTdG9yYWdlJ10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnLCBbJ3VpLnJvdXRlcicsICduZ01hdGVyaWFsJywgJ25nUmVzb3VyY2UnLCAnbmdNZXNzYWdlcycsICduZ1N0b3JhZ2UnXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycsIFtdKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbmZpZycsIFtdKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb25maWcnKS5jb25maWcoZnVuY3Rpb24oJG1kSWNvblByb3ZpZGVyKSB7XG4gICAgICAgICRtZEljb25Qcm92aWRlci5mb250U2V0KCdtZCcsICdtYXRlcmlhbC1pY29ucycpO1xuICAgIH0pXG5cbiAgICAuY29uZmlnKGZ1bmN0aW9uKCRtZFRoZW1pbmdQcm92aWRlcikge1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RhcmstZ3JleScpLmJhY2tncm91bmRQYWxldHRlKCdncmV5JykuZGFyaygpO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2Rhcmstb3JhbmdlJykuYmFja2dyb3VuZFBhbGV0dGUoJ29yYW5nZScpLmRhcmsoKTtcbiAgICAgICAgJG1kVGhlbWluZ1Byb3ZpZGVyLnRoZW1lKCdkYXJrLXB1cnBsZScpLmJhY2tncm91bmRQYWxldHRlKCdkZWVwLXB1cnBsZScpLmRhcmsoKTtcbiAgICAgICAgJG1kVGhlbWluZ1Byb3ZpZGVyLnRoZW1lKCdkYXJrLWJsdWUnKS5iYWNrZ3JvdW5kUGFsZXR0ZSgnYmx1ZScpLmRhcmsoKTtcbiAgICB9KVxuXG4gICAgLmNvbnN0YW50KCdBUElfVVJMJywgJ2FwaS8nKTtcblxufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAucm91dGVzJykuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkaHR0cFByb3ZpZGVyKSB7XG5cbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcblxuICAgICAgICAgICAgLnN0YXRlKCdzaWdudXAnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3NpZ251cCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC9hdXRoL2F1dGguaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsJyxcbiAgICAgICAgICAgICAgICByZWdpc3RlcjogMSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ3NpZ25pbicsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2lnbmluJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL2F1dGgvYXV0aC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwnLFxuICAgICAgICAgICAgICAgIHJlZ2lzdGVyOiAwLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnbG9nb3V0Jywge1xuICAgICAgICAgICAgICAgIHVybDogJy9sb2dvdXQnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvYXV0aC9hdXRoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXG4gICAgICAgICAgICAgICAgbG9nb3V0OiAxLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgndXNlcnMnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3VzZXJzJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL3VzZXJzL3VzZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1VzZXJDdHJsJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NoZWV0cycsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdXb3Jrc2hlZXRDdHJsJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goWyckcScsICckbG9jYXRpb24nLCAnJGxvY2FsU3RvcmFnZScsIGZ1bmN0aW9uICgkcSwgJGxvY2F0aW9uLCAkbG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdyZXF1ZXN0JzogZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoJGxvY2FsU3RvcmFnZS50b2tlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCZWFyZXIgJyArICRsb2NhbFN0b3JhZ2UudG9rZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdyZXNwb25zZUVycm9yJzogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMCB8fCByZXNwb25zZS5zdGF0dXMgPT09IDQwMSB8fCByZXNwb25zZS5zdGF0dXMgPT09IDQwMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSk7XG4gICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6QXV0aEN0cmxcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiAjIEF1dGhDdHJsXG4gICAgICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAgICAgKi9cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJykuY29udHJvbGxlcignQXV0aEN0cmwnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkc3RhdGUsICRsb2NhdGlvbiwgJGxvY2FsU3RvcmFnZSwgQXV0aFNydikge1xuXG4gICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NBdXRoIChyZXMpIHtcbiAgICAgICAgICAgICRsb2NhbFN0b3JhZ2UudG9rZW4gPSByZXMudG9rZW47XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gICAgID0gXCIjL1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnBlcmZvcm1Mb2dpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUucmVnaXN0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnNpZ251cCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnNpZ25pbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5wZXJmb3JtTG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgQXV0aFNydi5sb2dvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IFwiIy9zaWduaW5cIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zaWduaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZm9ybURhdGEgICAgICAgID0gJHNjb3BlLmNyZWRlbnRpYWxzO1xuICAgICAgICAgICAgJHNjb3BlLmF1dGhFcnJvciAgICA9IG51bGw7XG5cbiAgICAgICAgICAgIEF1dGhTcnYuc2lnbmluKGZvcm1EYXRhLCBzdWNjZXNzQXV0aCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgPSAnSW52YWxpZCBlbWFpbC9wYXNzd29yZC4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmb3JtRGF0YSAgICAgICAgPSAkc2NvcGUuY3JlZGVudGlhbHM7XG4gICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gbnVsbDtcblxuICAgICAgICAgICAgQXV0aFNydi5zaWdudXAoZm9ybURhdGEsIHN1Y2Nlc3NBdXRoLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcnMgJiYgZXJyLmVycm9yc1swXSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gZXJyLmVycm9yc1swXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gJ0ZhaWxlZCB0byBzaWdudXAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlZGVmaW5pbmcgcGFnZSBzdGF0dXMgZm9yIGxvZ2luL2xvZ291dC9yZWdpc3RlclxuICAgICAgICAkc2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmxvZ291dCAgICAgICA9ICRzdGF0ZS5jdXJyZW50LmxvZ291dDtcbiAgICAgICAgICAgIGlmICgkc2NvcGUubG9nb3V0KSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBlcmZvcm1Mb2dvdXQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJHNjb3BlLnJlZ2lzdGVyICAgICA9ICRzdGF0ZS5jdXJyZW50LnJlZ2lzdGVyO1xuICAgICAgICAgICAgJHNjb3BlLmxvZ2luVGV4dCAgICA9ICRzY29wZS5yZWdpc3RlciA/ICdSZWdpc3RlcicgOiAnTG9naW4nO1xuICAgICAgICAgICAgJHNjb3BlLmF1dGhFcnJvciAgICA9IG51bGw7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS50b2tlbiAgICAgICAgICAgID0gJGxvY2FsU3RvcmFnZS50b2tlbjtcbiAgICAgICAgJHNjb3BlLnRva2VuQ2xhaW1zICAgICAgPSBBdXRoU3J2LmdldFRva2VuQ2xhaW1zKCk7XG4gICAgICAgICRzY29wZS5jcmVkZW50aWFscyAgICAgID0ge307XG5cbiAgICB9KTtcbn0pKCk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdBdXRoU3J2JywgZnVuY3Rpb24gKCRodHRwLCBBUElfVVJMLCAkbG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIGZ1bmN0aW9uIHVybEJhc2U2NERlY29kZShzdHIpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBzdHIucmVwbGFjZSgnLScsICcrJykucmVwbGFjZSgnXycsICcvJyk7XG4gICAgICAgICAgICBzd2l0Y2ggKG91dHB1dC5sZW5ndGggJSA0KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSAnPT0nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSAnPSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGJhc2U2NHVybCBzdHJpbmchJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cuYXRvYihvdXRwdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0Q2xhaW1zRnJvbVRva2VuKCkge1xuICAgICAgICAgICAgdmFyIHRva2VuID0gJGxvY2FsU3RvcmFnZS50b2tlbjtcbiAgICAgICAgICAgIHZhciB1c2VyID0ge307XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciBlbmNvZGVkID0gdG9rZW4uc3BsaXQoJy4nKVsxXTtcbiAgICAgICAgICAgICAgICB1c2VyID0gSlNPTi5wYXJzZSh1cmxCYXNlNjREZWNvZGUoZW5jb2RlZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdG9rZW5DbGFpbXMgPSBnZXRDbGFpbXNGcm9tVG9rZW4oKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2lnbnVwOiBmdW5jdGlvbiAoZGF0YSwgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KEFQSV9VUkwgKyAndXNlcnMvc2lnbnVwJywgZGF0YSkuc3VjY2VzcyhzdWNjZXNzKS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2lnbmluOiBmdW5jdGlvbiAoZGF0YSwgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAkaHR0cC5wb3N0KEFQSV9VUkwgKyAndXNlcnMvc2lnbmluJywgZGF0YSkuc3VjY2VzcyhzdWNjZXNzKS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9nb3V0OiBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRva2VuQ2xhaW1zID0ge307XG4gICAgICAgICAgICAgICAgZGVsZXRlICRsb2NhbFN0b3JhZ2UudG9rZW47XG4gICAgICAgICAgICAgICAgc3VjY2VzcygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFRva2VuQ2xhaW1zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuQ2xhaW1zO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdGltZU1hbmFnZXIuY29udHJvbGxlcjpVc2VyQ3RybFxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqICMgVXNlckN0cmxcbiAgICAgKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnKS5jb250cm9sbGVyKCdVc2VyQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFVzZXJTcnYpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnVXNlckN0cmwnKTtcbiAgICB9KTtcbn0pKCk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdVc2VyU3J2JywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgQVBJX1VSTCkge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKEFQSV9VUkwgKyAndXNlcnMvOmlkJywge30sIHtcblxuICAgICAgICAgICAgZ2V0VXNlcnM6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiAnQGVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6ICdAcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBmaXJzdF9uYW1lOiAnQGZpcnN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICBsYXN0X25hbWU6ICdAbGFzdF9uYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6ICdAdXNlcm5hbWUnLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlX2ltYWdlOiAnQHByb2ZpbGVfaW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICByb2xlOiAnQHJvbGUnLFxuICAgICAgICAgICAgICAgICAgICB3b3JraW5nX2hvdXJzOiAnQHdvcmtpbmdfaG91cnMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6ICdAZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogJ0BwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0X25hbWU6ICdAZmlyc3RfbmFtZScsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RfbmFtZTogJ0BsYXN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogJ0B1c2VybmFtZScsXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1hZ2U6ICdAcHJvZmlsZV9pbWFnZScsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdAcm9sZScsXG4gICAgICAgICAgICAgICAgICAgIHdvcmtpbmdfaG91cnM6ICdAd29ya2luZ19ob3VycycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOldvcmtzaGVldEN0cmxcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiAjIFdvcmtzaGVldEN0cmxcbiAgICAgKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnKS5jb250cm9sbGVyKCdXb3Jrc2hlZXRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgbWRNZW51U3J2LCBtZERpYWxvZ1NydiwgbWRUb2FzdFNydiwgV29ya3NoZWV0U3J2LCBVc2VyU3J2KSB7XG5cbiAgICAgICAgJHNjb3BlLm9wZW5NZW51ID0gZnVuY3Rpb24gKCRtZE9wZW5NZW51LCBldilcbiAgICAgICAge1xuICAgICAgICAgICAgbWRNZW51U3J2Lm9wZW5NZW51KCRtZE9wZW5NZW51LCBldik7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5EZWxldGVXb3Jrc2hlZXREaWFsb2cgICAgPSBmdW5jdGlvbiAoZXZlbnQsIHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyAgPSB7XG4gICAgICAgICAgICAgICAgJ3RpdGxlJyAgICAgICAgIDogJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyB3b3Jrc2hlZXQ/JyxcbiAgICAgICAgICAgICAgICAndGV4dENvbnRlbnQnICAgOiAnVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZScsXG4gICAgICAgICAgICAgICAgJ2FyaWFMYWJlbCcgICAgIDogJ2RlbGV0ZVdvcmtzaGVldCcsXG4gICAgICAgICAgICAgICAgJ29rJyAgICAgICAgICAgIDogJ1llcycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcgICAgICAgIDogJ0NhbmNlbCcsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5jb25maXJtKGV2ZW50LCBwYXJhbXMsIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZVdvcmtzaGVldCh3b3Jrc2hlZXQpO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vcGVuRWRpdFVzZXJEaWFsb2cgICA9IGZ1bmN0aW9uIChldmVudClcbiAgICAgICAge1xuICAgICAgICAgICAgbWREaWFsb2dTcnYuZnJvbVRlbXBsYXRlKCcuL3ZpZXdzL2FwcC9kaWFsb2dzL2VkaXRfdXNlci5odG1sJywgZXZlbnQsICRzY29wZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5FZGl0V29ya3NoZWV0RGlhbG9nICA9IGZ1bmN0aW9uIChldmVudCwgd29ya3NoZWV0KVxuICAgICAgICB7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldCAgICAgPSB3b3Jrc2hlZXQ7XG4gICAgICAgICAgICAvLyBjcmVhdGluZyBhIGphdmFzY3JpcHQgZGF0ZSBmcm9tIHN0cmluZ1xuICAgICAgICAgICAgaWYgKHdvcmtzaGVldC5kYXRlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZUpTICA9IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWREaWFsb2dTcnYuZnJvbVRlbXBsYXRlKCcuL3ZpZXdzL2FwcC9kaWFsb2dzL2VkaXRfd29ya3NoZWV0Lmh0bWwnLCBldmVudCwgJHNjb3BlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyAtLS0tXG5cbiAgICAgICAgJHNjb3BlLndvcmtzaGVldEZpbHRlciA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAod29ya3NoZWV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPj0gJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgKCEkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPD0gJHNjb3BlLmZpbHRlcnMuZW5kX2RhdGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2VsZWN0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgICAgID0gW107XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgICAgICA9IHVzZXI7XG5cbiAgICAgICAgICAgIFdvcmtzaGVldFNydi51c2VyV29ya3NoZWV0cyh7J3VzZXJJZCcgOiB1c2VyLmlkfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc29ydFVzZXJzICAgID0gZnVuY3Rpb24gKHNvcnQsIHJldmVyc2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS51c2VyU29ydCAgICAgICAgID0gc29ydDtcbiAgICAgICAgICAgICRzY29wZS51c2VyU29ydFJldmVyc2UgID0gcmV2ZXJzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGVsZXRlV29ya3NoZWV0ICA9IGZ1bmN0aW9uICh3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICghd29ya3NoZWV0LmlkKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gd29ya3NoZWV0IHRvIGRlbGV0ZVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2LmRlbGV0ZSh7aWQgOiB3b3Jrc2hlZXQuaWR9LCBmdW5jdGlvbiAoc3VjY2Vzcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzaGVldEluZGV4ICA9ICRzY29wZS53b3Jrc2hlZXRzLmluZGV4T2Yod29ya3NoZWV0KTtcblxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc2hlZXRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMuc3BsaWNlKHdvcmtzaGVldEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtZFRvYXN0U3J2LnNob3coeydjb250ZW50JyA6ICdXb3Jrc2hlZXQgRGVsZXRlZCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbEVkaXRVc2VyICAgPSBmdW5jdGlvbiAoKVxuICAgICAgICB7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5jYW5jZWwoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZmluaXNoRWRpdFVzZXIgICA9IGZ1bmN0aW9uICh1c2VyKVxuICAgICAgICB7XG4gICAgICAgICAgICAkc2NvcGUuc2F2ZVVzZXIodXNlcik7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5oaWRlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNhdmVVc2VyID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBtZXRob2QgID0gdXNlci5pZCA/ICd1cGRhdGUnIDogJ2NyZWF0ZSc7XG5cbiAgICAgICAgICAgIFVzZXJTcnZbbWV0aG9kXSh1c2VyLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBpbnNlcnQgaW4gRE9NICsgdG9hc3RcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gdG9hc3RcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWxFZGl0V29ya3NoZWV0ICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNhbmNlbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5maW5pc2hFZGl0V29ya3NoZWV0ICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5zYXZlV29ya3NoZWV0KCk7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5oaWRlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNhdmVXb3Jrc2hlZXQgICAgPSBmdW5jdGlvbiAoKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgbWV0aG9kICAgICAgICAgICAgICAgICAgICAgID0gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuaWQgPyAndXBkYXRlJyA6ICdjcmVhdGUnO1xuICAgICAgICAgICAgLy8gcGFyc2luZyBkYXRlIGFuZCB1c2VyX2lkXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC51c2VyX2lkID0gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQudXNlcl9pZCA/ICRzY29wZS5jdXJyZW50V29ya3NoZWV0LnVzZXJfaWQgOiAkc2NvcGUuY3VycmVudFVzZXIuaWQ7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlICAgID0gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZUpTID8gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZUpTLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKSA6ICRzY29wZS5jdXJyZW50V29ya3NoZWV0LmRhdGU7XG5cbiAgICAgICAgICAgIGlmICgkc2NvcGUuY3VycmVudFdvcmtzaGVldC5uZXdfbm90ZSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVOb3RlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFdvcmtzaGVldFNydlttZXRob2RdKCRzY29wZS5jdXJyZW50V29ya3NoZWV0LCBmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgd29ya3NoZWV0ICAgPSByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICAvLyBpbnNlcnRpbmcgd29ya3NoZWV0IGluIERPTVxuICAgICAgICAgICAgICAgIHZhciBpbmRleCAgICAgICA9ICRzY29wZS53b3Jrc2hlZXRzLm1hcChmdW5jdGlvbiAodykgeyByZXR1cm4gdy5pZDsgfSkuaW5kZXhPZih3b3Jrc2hlZXQuaWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3b3Jrc2hlZXQgbm90IG9uIGxpc3QsIGNyZWF0aW5nIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhICAgID0gKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod29ya3NoZWV0KSkpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUud29ya3NoZWV0cy51bnNoaWZ0KGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBtZFRvYXN0U3J2LnNob3coeydjb250ZW50JyA6ICdTdWNjZXNzZnVsbHkgQ3JlYXRlZCBXb3Jrc2hlZXQhJywgJ3Bvc2l0aW9uJyA6ICd0b3AgcmlnaHQnLCAnZGVsYXknIDogMzAwMH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuZXJyKHsnY29udGVudCcgOiAnRXJyb3IgRWRpdGluZyBXb3Jrc2hlZXQhJywgJ3Bvc2l0aW9uJyA6ICd0b3AgcmlnaHQnLCAnZGVsYXknIDogMzAwMH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRlbGV0ZU5vdGUgICA9IGZ1bmN0aW9uIChpbmRleClcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubm90ZXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNyZWF0ZU5vdGUgICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICghJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubmV3X25vdGUpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCEkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3Rlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5vdGVzICAgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubm90ZXMucHVzaCgkc2NvcGUuY3VycmVudFdvcmtzaGVldC5uZXdfbm90ZSk7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5uZXdfbm90ZSAgICA9IG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tXG5cbiAgICAgICAgVXNlclNydi5nZXRVc2Vycyh7fSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJzICAgID0gcmVzdWx0LmRhdGE7XG5cbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgLy8gVE9ETyBlcnJvciB0cmVhdG1lbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmZpbHRlcnMgID0ge307XG4gICAgfSk7XG59KSgpO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnV29ya3NoZWV0U3J2JywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgQVBJX1VSTCkge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKEFQSV9VUkwgKyAnd29ya3NoZWV0cy86aWQnLCB7fSwge1xuXG4gICAgICAgICAgICB1c2VyV29ya3NoZWV0czoge1xuICAgICAgICAgICAgICAgIHVybDogQVBJX1VSTCArICd1c2VyLzp1c2VySWQvd29ya3NoZWV0cycsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGdldDoge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjcmVhdGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgICAgICBkYXRlOiAnQGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICBob3VyczogJ0Bob3VycycsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6ICdAdXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgICAgIG5vdGVzOiAnQG5vdGVzJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6ICdAZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzOiAnQGhvdXJzJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogJ0B1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgbm90ZXM6ICdAbm90ZXMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGRlbGV0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnbWREaWFsb2dTcnYnLCBmdW5jdGlvbiAoJG1kRGlhbG9nKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZyb21UZW1wbGF0ZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBldmVudCwgJHNjb3BlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHRlbXBsYXRlLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNjb3BlID0gJHNjb3BlLiRuZXcoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLnNob3cob3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZERpYWxvZy5oaWRlKCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjYW5jZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLmNhbmNlbCgpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYWxlcnQ6IGZ1bmN0aW9uICh0aXRsZSwgY29udGVudCl7XG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZERpYWxvZy5hbGVydCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGl0bGUodGl0bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChjb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9rKCdPaycpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNvbmZpcm06IGZ1bmN0aW9uIChldmVudCwgcGFyYW1zLCBzdWNjZXNzLCBlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlybSAgICAgPSAkbWREaWFsb2cuY29uZmlybSgpXG4gICAgICAgICAgICAgICAgICAgIC50aXRsZShwYXJhbXMudGl0bGUpXG4gICAgICAgICAgICAgICAgICAgIC50ZXh0Q29udGVudChwYXJhbXMudGV4dENvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIC5hcmlhTGFiZWwocGFyYW1zLmFyaWFMYWJlbClcbiAgICAgICAgICAgICAgICAgICAgLnRhcmdldEV2ZW50KGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAub2socGFyYW1zLm9rKVxuICAgICAgICAgICAgICAgICAgICAuY2FuY2VsKHBhcmFtcy5jYW5jZWwpO1xuXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihzdWNjZXNzLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuc2VydmljZSgnbWRNZW51U3J2JywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBvcGVuTWVudSA6IGZ1bmN0aW9uICgkbWRPcGVuTWVudSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hdG9yRXYgPSBldmVudDtcbiAgICAgICAgICAgICAgICAkbWRPcGVuTWVudShldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnbWRUb2FzdFNydicsIGZ1bmN0aW9uICgkbWRUb2FzdCkge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uIChwYXJhbXMpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiAkbWRUb2FzdC5zaG93KFxuICAgICAgICAgICAgICAgICAgICAkbWRUb2FzdC5zaW1wbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRlbnQocGFyYW1zLmNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucG9zaXRpb24ocGFyYW1zLnBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheShwYXJhbXMuZGVsYXkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZFRvYXN0LnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZFRvYXN0LnNpbXBsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChwYXJhbXMuY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3NpdGlvbihwYXJhbXMucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbWUoJ3dhcm4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheShwYXJhbXMuZGVsYXkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcbiJdfQ==
