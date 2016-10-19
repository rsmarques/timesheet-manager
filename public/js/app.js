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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC91c2Vycy91c2VyQ3RybC5qcyIsImFwcC91c2Vycy91c2VyU3J2LmpzIiwiYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Q3RybC5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldFNydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL2RpYWxvZ1Nydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL21lbnVTcnYuanMiLCJzZXJ2aWNlcy9tYXRlcmlhbC90b2FzdFNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUEsYUFBQTtJQUNBLFFBQUEsT0FBQSxtQkFBQSxDQUFBLGFBQUEsY0FBQSxjQUFBLGNBQUE7SUFDQSxRQUFBLE9BQUEsZ0JBQUE7SUFDQSxRQUFBLE9BQUEsY0FBQTs7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLDJCQUFBLFNBQUEsaUJBQUE7UUFDQSxnQkFBQSxRQUFBLE1BQUE7OztLQUdBLDhCQUFBLFNBQUEsb0JBQUE7UUFDQSxtQkFBQSxNQUFBLGFBQUEsa0JBQUEsUUFBQTtRQUNBLG1CQUFBLE1BQUEsZUFBQSxrQkFBQSxVQUFBO1FBQ0EsbUJBQUEsTUFBQSxlQUFBLGtCQUFBLGVBQUE7UUFDQSxtQkFBQSxNQUFBLGFBQUEsa0JBQUEsUUFBQTs7O0tBR0EsU0FBQSxXQUFBOzs7QUNkQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxRQUFBLE9BQUEsY0FBQSxpRUFBQSxVQUFBLGdCQUFBLG9CQUFBLGVBQUE7O1FBRUE7O2FBRUEsTUFBQSxVQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBO2dCQUNBLFVBQUE7O2FBRUEsTUFBQSxVQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBO2dCQUNBLFVBQUE7O2FBRUEsTUFBQSxTQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzthQUVBLE1BQUEsY0FBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7O1FBR0EsbUJBQUEsVUFBQTs7UUFFQSxjQUFBLGFBQUEsS0FBQSxDQUFBLE1BQUEsYUFBQSxpQkFBQSxVQUFBLElBQUEsV0FBQSxlQUFBO1lBQ0EsT0FBQTtnQkFDQSxXQUFBLFVBQUEsUUFBQTtvQkFDQSxPQUFBLFVBQUEsT0FBQSxXQUFBO29CQUNBLElBQUEsY0FBQSxPQUFBO3dCQUNBLE9BQUEsUUFBQSxnQkFBQSxZQUFBLGNBQUE7O29CQUVBLE9BQUE7O2dCQUVBLGlCQUFBLFVBQUEsVUFBQTtvQkFDQSxJQUFBLFNBQUEsV0FBQSxPQUFBLFNBQUEsV0FBQSxPQUFBLFNBQUEsV0FBQSxLQUFBO3dCQUNBLFVBQUEsS0FBQTs7b0JBRUEsT0FBQSxHQUFBLE9BQUE7Ozs7OztBQzdDQSxDQUFBLFVBQUE7SUFDQTs7Ozs7Ozs7SUFRQSxRQUFBLE9BQUEsbUJBQUEsV0FBQSx3RkFBQSxVQUFBLFlBQUEsUUFBQSxRQUFBLFdBQUEsZUFBQSxTQUFBOztRQUVBLFNBQUEsYUFBQSxLQUFBO1lBQ0EsY0FBQSxRQUFBLElBQUE7WUFDQSxPQUFBLGVBQUE7OztRQUdBLE9BQUEsZUFBQSxZQUFBO1lBQ0EsSUFBQSxPQUFBLFVBQUE7Z0JBQ0EsT0FBQSxPQUFBO21CQUNBO2dCQUNBLE9BQUEsT0FBQTs7OztRQUlBLE9BQUEsU0FBQSxZQUFBO1lBQ0EsSUFBQSxrQkFBQSxPQUFBO1lBQ0EsT0FBQSxlQUFBOztZQUVBLFFBQUEsT0FBQSxVQUFBLGFBQUEsWUFBQTtnQkFDQSxPQUFBLFlBQUE7Ozs7UUFJQSxPQUFBLFNBQUEsWUFBQTtZQUNBLElBQUEsa0JBQUEsT0FBQTtZQUNBLE9BQUEsZUFBQTs7WUFFQSxRQUFBLE9BQUEsVUFBQSxhQUFBLFVBQUEsS0FBQTtnQkFDQSxJQUFBLElBQUEsVUFBQSxJQUFBLE9BQUEsSUFBQTtvQkFDQSxPQUFBLGVBQUEsSUFBQSxPQUFBO3VCQUNBO29CQUNBLE9BQUEsZUFBQTs7Ozs7UUFLQSxPQUFBLFNBQUEsWUFBQTtZQUNBLFFBQUEsT0FBQSxZQUFBO2dCQUNBLE9BQUEsV0FBQTs7OztTQUlBLE9BQUEsSUFBQSx1QkFBQSxZQUFBO1lBQ0EsT0FBQSxlQUFBLE9BQUEsUUFBQTtZQUNBLE9BQUEsZUFBQSxPQUFBLFdBQUEsYUFBQTtZQUNBLE9BQUEsZUFBQTs7O1FBR0EsT0FBQSxnQkFBQSxjQUFBO1FBQ0EsT0FBQSxnQkFBQSxRQUFBO1FBQ0EsT0FBQSxnQkFBQTs7Ozs7QUM1REEsUUFBQSxPQUFBOztLQUVBLFFBQUEsaURBQUEsVUFBQSxPQUFBLFNBQUEsZUFBQTtRQUNBLFNBQUEsZ0JBQUEsS0FBQTtZQUNBLElBQUEsU0FBQSxJQUFBLFFBQUEsS0FBQSxLQUFBLFFBQUEsS0FBQTtZQUNBLFFBQUEsT0FBQSxTQUFBO2dCQUNBLEtBQUE7b0JBQ0E7Z0JBQ0EsS0FBQTtvQkFDQSxVQUFBO29CQUNBO2dCQUNBLEtBQUE7b0JBQ0EsVUFBQTtvQkFDQTtnQkFDQTtvQkFDQSxNQUFBOztZQUVBLE9BQUEsT0FBQSxLQUFBOzs7UUFHQSxTQUFBLHFCQUFBO1lBQ0EsSUFBQSxRQUFBLGNBQUE7WUFDQSxJQUFBLE9BQUE7WUFDQSxJQUFBLE9BQUEsVUFBQSxhQUFBO2dCQUNBLElBQUEsVUFBQSxNQUFBLE1BQUEsS0FBQTtnQkFDQSxPQUFBLEtBQUEsTUFBQSxnQkFBQTs7WUFFQSxPQUFBOzs7UUFHQSxJQUFBLGNBQUE7O1FBRUEsT0FBQTtZQUNBLFFBQUEsVUFBQSxNQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLEtBQUEsVUFBQSxnQkFBQSxNQUFBLFFBQUEsU0FBQSxNQUFBOztZQUVBLFFBQUEsVUFBQSxNQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLEtBQUEsVUFBQSxnQkFBQSxNQUFBLFFBQUEsU0FBQSxNQUFBOztZQUVBLFFBQUEsVUFBQSxTQUFBO2dCQUNBLGNBQUE7Z0JBQ0EsT0FBQSxjQUFBO2dCQUNBOztZQUVBLGdCQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7OztBQzdDQSxDQUFBLFVBQUE7SUFDQTs7Ozs7Ozs7O0lBU0EsUUFBQSxPQUFBLG1CQUFBLFdBQUEsa0NBQUEsVUFBQSxRQUFBLFNBQUE7O1FBRUEsUUFBQSxJQUFBOzs7O0FDWkEsUUFBQSxPQUFBOztLQUVBLFFBQUEsb0NBQUEsVUFBQSxXQUFBLFNBQUE7UUFDQSxPQUFBLFVBQUEsVUFBQSxhQUFBLElBQUE7O1lBRUEsVUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7OztZQUlBLEtBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7WUFJQSxRQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBO29CQUNBLE9BQUE7b0JBQ0EsVUFBQTtvQkFDQSxZQUFBO29CQUNBLFdBQUE7b0JBQ0EsVUFBQTtvQkFDQSxlQUFBO29CQUNBLE1BQUE7b0JBQ0EsZUFBQTs7OztZQUlBLFFBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7b0JBQ0EsT0FBQTtvQkFDQSxVQUFBO29CQUNBLFlBQUE7b0JBQ0EsV0FBQTtvQkFDQSxVQUFBO29CQUNBLGVBQUE7b0JBQ0EsTUFBQTtvQkFDQSxlQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7Ozs7O0FDcERBLENBQUEsVUFBQTtJQUNBOzs7Ozs7Ozs7SUFTQSxRQUFBLE9BQUEsbUJBQUEsV0FBQSxpR0FBQSxVQUFBLFFBQUEsV0FBQSxhQUFBLFlBQUEsY0FBQSxTQUFBOztRQUVBLE9BQUEsV0FBQSxVQUFBLGFBQUE7UUFDQTtZQUNBLFVBQUEsU0FBQSxhQUFBOzs7UUFHQSxPQUFBLCtCQUFBLFVBQUEsT0FBQTtRQUNBO1lBQ0EsSUFBQSxVQUFBO2dCQUNBLGtCQUFBO2dCQUNBLGtCQUFBO2dCQUNBLGtCQUFBO2dCQUNBLGtCQUFBO2dCQUNBLGtCQUFBOzs7WUFHQSxZQUFBLFFBQUEsT0FBQSxRQUFBLFVBQUEsU0FBQTtnQkFDQSxPQUFBLGdCQUFBOztlQUVBLFVBQUEsS0FBQTs7Ozs7UUFLQSxPQUFBLHVCQUFBLFVBQUE7UUFDQTtZQUNBLFlBQUEsYUFBQSxzQ0FBQSxPQUFBOzs7UUFHQSxPQUFBLDJCQUFBLFVBQUEsT0FBQTtRQUNBO1lBQ0EsT0FBQSx1QkFBQTs7WUFFQSxJQUFBLFVBQUEsTUFBQTtnQkFDQSxPQUFBLGlCQUFBLFVBQUEsSUFBQSxLQUFBLFVBQUE7OztZQUdBLFlBQUEsYUFBQSwyQ0FBQSxPQUFBOzs7OztRQUtBLE9BQUEsa0JBQUE7UUFDQTtZQUNBLE9BQUEsVUFBQSxXQUFBO2dCQUNBLE9BQUEsQ0FBQSxDQUFBLE9BQUEsUUFBQSxjQUFBLElBQUEsS0FBQSxVQUFBLFNBQUEsT0FBQSxRQUFBO3FCQUNBLENBQUEsT0FBQSxRQUFBLFlBQUEsSUFBQSxLQUFBLFVBQUEsU0FBQSxPQUFBLFFBQUE7Ozs7UUFJQSxPQUFBLGVBQUEsVUFBQTtRQUNBO1lBQ0EsT0FBQSxtQkFBQTtZQUNBLE9BQUEsbUJBQUE7O1lBRUEsYUFBQSxlQUFBLENBQUEsV0FBQSxLQUFBLEtBQUEsVUFBQSxRQUFBO2dCQUNBLE9BQUEsZUFBQSxPQUFBOztlQUVBLFVBQUEsS0FBQTs7Ozs7UUFLQSxPQUFBLGVBQUEsVUFBQSxNQUFBO1FBQ0E7WUFDQSxPQUFBLG1CQUFBO1lBQ0EsT0FBQSxtQkFBQTs7O1FBR0EsT0FBQSxtQkFBQSxVQUFBO1FBQ0E7WUFDQSxJQUFBLENBQUEsVUFBQSxJQUFBOztnQkFFQSxPQUFBOzs7WUFHQSxhQUFBLE9BQUEsQ0FBQSxLQUFBLFVBQUEsS0FBQSxVQUFBLFNBQUE7O2dCQUVBLElBQUEsa0JBQUEsT0FBQSxXQUFBLFFBQUE7O2dCQUVBLElBQUEsbUJBQUEsQ0FBQSxHQUFBO29CQUNBLE9BQUEsV0FBQSxPQUFBLGdCQUFBOzs7Z0JBR0EsV0FBQSxLQUFBLENBQUEsWUFBQSxzQkFBQSxhQUFBLGFBQUEsVUFBQTs7ZUFFQSxVQUFBLEtBQUE7Ozs7O1FBS0EsT0FBQSxtQkFBQTtRQUNBO1lBQ0EsWUFBQTs7O1FBR0EsT0FBQSxtQkFBQSxVQUFBO1FBQ0E7WUFDQSxPQUFBLFNBQUE7WUFDQSxZQUFBOzs7UUFHQSxPQUFBLFdBQUEsVUFBQTtRQUNBO1lBQ0EsSUFBQSxVQUFBLEtBQUEsS0FBQSxXQUFBOztZQUVBLFFBQUEsUUFBQSxNQUFBLFVBQUEsUUFBQTs7O2VBR0EsVUFBQSxLQUFBOzs7OztRQUtBLE9BQUEsdUJBQUE7UUFDQTtZQUNBLFlBQUE7OztRQUdBLE9BQUEsdUJBQUE7UUFDQTtZQUNBLE9BQUE7WUFDQSxZQUFBOzs7UUFHQSxPQUFBLG1CQUFBO1FBQ0E7WUFDQSxJQUFBLDhCQUFBLE9BQUEsaUJBQUEsS0FBQSxXQUFBOztZQUVBLE9BQUEsaUJBQUEsVUFBQSxPQUFBLGlCQUFBLFVBQUEsT0FBQSxpQkFBQSxVQUFBLE9BQUEsWUFBQTtZQUNBLE9BQUEsaUJBQUEsVUFBQSxPQUFBLGlCQUFBLFNBQUEsT0FBQSxpQkFBQSxPQUFBLGNBQUEsVUFBQSxHQUFBLE1BQUEsT0FBQSxpQkFBQTs7WUFFQSxJQUFBLE9BQUEsaUJBQUEsVUFBQTtnQkFDQSxPQUFBOzs7WUFHQSxhQUFBLFFBQUEsT0FBQSxrQkFBQSxVQUFBLFFBQUE7O2dCQUVBLElBQUEsY0FBQSxPQUFBOztnQkFFQSxJQUFBLGNBQUEsT0FBQSxXQUFBLElBQUEsVUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsUUFBQSxVQUFBOztnQkFFQSxJQUFBLFVBQUEsQ0FBQSxHQUFBOztvQkFFQSxJQUFBLFdBQUEsS0FBQSxNQUFBLEtBQUEsVUFBQTtvQkFDQSxPQUFBLFdBQUEsUUFBQTtvQkFDQSxXQUFBLEtBQUEsQ0FBQSxZQUFBLG1DQUFBLGFBQUEsYUFBQSxVQUFBOzs7ZUFHQSxVQUFBLEtBQUE7Z0JBQ0EsV0FBQSxJQUFBLENBQUEsWUFBQSw0QkFBQSxhQUFBLGFBQUEsVUFBQTs7OztRQUlBLE9BQUEsZUFBQSxVQUFBO1FBQ0E7WUFDQSxPQUFBLGlCQUFBLE1BQUEsT0FBQSxPQUFBOztZQUVBLE9BQUE7OztRQUdBLE9BQUEsZUFBQTtRQUNBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsaUJBQUEsVUFBQSxPQUFBOztZQUVBLElBQUEsQ0FBQSxPQUFBLGlCQUFBLE9BQUE7Z0JBQ0EsT0FBQSxpQkFBQSxVQUFBOzs7WUFHQSxPQUFBLGlCQUFBLE1BQUEsS0FBQSxPQUFBLGlCQUFBO1lBQ0EsT0FBQSxpQkFBQSxjQUFBOztZQUVBLE9BQUE7Ozs7O1FBS0EsUUFBQSxTQUFBLElBQUEsVUFBQSxRQUFBO1lBQ0EsT0FBQSxXQUFBLE9BQUE7O1dBRUEsVUFBQSxLQUFBOzs7O1FBSUEsT0FBQSxXQUFBOzs7O0FDbk1BLFFBQUEsT0FBQTs7S0FFQSxRQUFBLHlDQUFBLFVBQUEsV0FBQSxTQUFBO1FBQ0EsT0FBQSxVQUFBLFVBQUEsa0JBQUEsSUFBQTs7WUFFQSxnQkFBQTtnQkFDQSxLQUFBLFVBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7WUFJQSxLQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxNQUFBO29CQUNBLE9BQUE7b0JBQ0EsU0FBQTtvQkFDQSxPQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxNQUFBO29CQUNBLE9BQUE7b0JBQ0EsU0FBQTtvQkFDQSxPQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7Ozs7OztBQzdDQSxRQUFBLE9BQUE7O0tBRUEsUUFBQSw2QkFBQSxVQUFBLFdBQUE7O1FBRUEsT0FBQTtZQUNBLGNBQUEsVUFBQSxVQUFBLE9BQUEsUUFBQTs7Z0JBRUEsSUFBQSxVQUFBO29CQUNBLGFBQUE7b0JBQ0EsYUFBQTtvQkFDQSxxQkFBQTs7O2dCQUdBLElBQUEsUUFBQTtvQkFDQSxRQUFBLFFBQUEsT0FBQTs7O2dCQUdBLE9BQUEsVUFBQSxLQUFBOzs7WUFHQSxNQUFBLFlBQUE7Z0JBQ0EsT0FBQSxVQUFBOzs7WUFHQSxRQUFBLFlBQUE7Z0JBQ0EsT0FBQSxVQUFBOzs7WUFHQSxPQUFBLFVBQUEsT0FBQSxRQUFBO2dCQUNBLFVBQUE7b0JBQ0EsVUFBQTt5QkFDQSxNQUFBO3lCQUNBLFFBQUE7eUJBQ0EsR0FBQTs7OztZQUlBLFNBQUEsVUFBQSxPQUFBLFFBQUEsU0FBQSxLQUFBO2dCQUNBLElBQUEsY0FBQSxVQUFBO3FCQUNBLE1BQUEsT0FBQTtxQkFDQSxZQUFBLE9BQUE7cUJBQ0EsVUFBQSxPQUFBO3FCQUNBLFlBQUE7cUJBQ0EsR0FBQSxPQUFBO3FCQUNBLE9BQUEsT0FBQTs7Z0JBRUEsVUFBQSxLQUFBLFNBQUEsS0FBQSxTQUFBOzs7OztBQzlDQSxRQUFBLE9BQUE7O0tBRUEsUUFBQSxhQUFBLFlBQUE7UUFDQSxPQUFBOztZQUVBLFdBQUEsVUFBQSxhQUFBLE9BQUE7Z0JBQ0EsZUFBQTtnQkFDQSxZQUFBOzs7O0FDUEEsUUFBQSxPQUFBOztLQUVBLFFBQUEsMkJBQUEsVUFBQSxVQUFBOztRQUVBLE9BQUE7O1lBRUEsTUFBQSxVQUFBLFFBQUE7O2dCQUVBLE9BQUEsU0FBQTtvQkFDQSxTQUFBO3lCQUNBLFFBQUEsT0FBQTt5QkFDQSxTQUFBLE9BQUE7eUJBQ0EsVUFBQSxPQUFBOzs7WUFHQSxPQUFBLFVBQUEsUUFBQTs7Z0JBRUEsT0FBQSxTQUFBO29CQUNBLFNBQUE7eUJBQ0EsUUFBQSxPQUFBO3lCQUNBLFNBQUEsT0FBQTt5QkFDQSxNQUFBO3lCQUNBLFVBQUEsT0FBQTs7Ozs7QUFLQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuICAgICAgICAnYXBwLmNvbnRyb2xsZXJzJyxcbiAgICAgICAgJ2FwcC5zZXJ2aWNlcycsXG4gICAgICAgICdhcHAucm91dGVzJyxcbiAgICAgICAgJ2FwcC5jb25maWcnXG4gICAgXSk7XG5cblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAucm91dGVzJywgWyd1aS5yb3V0ZXInLCAnbmdTdG9yYWdlJ10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnLCBbJ3VpLnJvdXRlcicsICduZ01hdGVyaWFsJywgJ25nUmVzb3VyY2UnLCAnbmdNZXNzYWdlcycsICduZ1N0b3JhZ2UnXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycsIFtdKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbmZpZycsIFtdKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb25maWcnKS5jb25maWcoZnVuY3Rpb24oJG1kSWNvblByb3ZpZGVyKSB7XG4gICAgICAgICRtZEljb25Qcm92aWRlci5mb250U2V0KCdtZCcsICdtYXRlcmlhbC1pY29ucycpO1xuICAgIH0pXG5cbiAgICAuY29uZmlnKGZ1bmN0aW9uKCRtZFRoZW1pbmdQcm92aWRlcikge1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RhcmstZ3JleScpLmJhY2tncm91bmRQYWxldHRlKCdncmV5JykuZGFyaygpO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2Rhcmstb3JhbmdlJykuYmFja2dyb3VuZFBhbGV0dGUoJ29yYW5nZScpLmRhcmsoKTtcbiAgICAgICAgJG1kVGhlbWluZ1Byb3ZpZGVyLnRoZW1lKCdkYXJrLXB1cnBsZScpLmJhY2tncm91bmRQYWxldHRlKCdkZWVwLXB1cnBsZScpLmRhcmsoKTtcbiAgICAgICAgJG1kVGhlbWluZ1Byb3ZpZGVyLnRoZW1lKCdkYXJrLWJsdWUnKS5iYWNrZ3JvdW5kUGFsZXR0ZSgnYmx1ZScpLmRhcmsoKTtcbiAgICB9KVxuXG4gICAgLmNvbnN0YW50KCdBUElfVVJMJywgJ2FwaS8nKTtcblxufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAucm91dGVzJykuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkaHR0cFByb3ZpZGVyKSB7XG5cbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcblxuICAgICAgICAgICAgLnN0YXRlKCdzaWdudXAnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3NpZ251cCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC9hdXRoL2F1dGguaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsJyxcbiAgICAgICAgICAgICAgICByZWdpc3RlcjogMSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ3NpZ25pbicsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2lnbmluJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL2F1dGgvYXV0aC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwnLFxuICAgICAgICAgICAgICAgIHJlZ2lzdGVyOiAwLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgndXNlcnMnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3VzZXJzJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL3VzZXJzL3VzZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1VzZXJDdHJsJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NoZWV0cycsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdXb3Jrc2hlZXRDdHJsJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goWyckcScsICckbG9jYXRpb24nLCAnJGxvY2FsU3RvcmFnZScsIGZ1bmN0aW9uICgkcSwgJGxvY2F0aW9uLCAkbG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdyZXF1ZXN0JzogZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoJGxvY2FsU3RvcmFnZS50b2tlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCZWFyZXIgJyArICRsb2NhbFN0b3JhZ2UudG9rZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdyZXNwb25zZUVycm9yJzogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMCB8fCByZXNwb25zZS5zdGF0dXMgPT09IDQwMSB8fCByZXNwb25zZS5zdGF0dXMgPT09IDQwMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9zaWduaW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSk7XG4gICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6QXV0aEN0cmxcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiAjIEF1dGhDdHJsXG4gICAgICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAgICAgKi9cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJykuY29udHJvbGxlcignQXV0aEN0cmwnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkc3RhdGUsICRsb2NhdGlvbiwgJGxvY2FsU3RvcmFnZSwgQXV0aFNydikge1xuXG4gICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NBdXRoIChyZXMpIHtcbiAgICAgICAgICAgICRsb2NhbFN0b3JhZ2UudG9rZW4gPSByZXMudG9rZW47XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gICAgID0gXCIjL1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnBlcmZvcm1Mb2dpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUucmVnaXN0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnNpZ251cCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnNpZ25pbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zaWduaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZm9ybURhdGEgICAgICAgID0gJHNjb3BlLmNyZWRlbnRpYWxzO1xuICAgICAgICAgICAgJHNjb3BlLmF1dGhFcnJvciAgICA9IG51bGw7XG5cbiAgICAgICAgICAgIEF1dGhTcnYuc2lnbmluKGZvcm1EYXRhLCBzdWNjZXNzQXV0aCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgPSAnSW52YWxpZCBlbWFpbC9wYXNzd29yZC4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmb3JtRGF0YSAgICAgICAgPSAkc2NvcGUuY3JlZGVudGlhbHM7XG4gICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gbnVsbDtcblxuICAgICAgICAgICAgQXV0aFNydi5zaWdudXAoZm9ybURhdGEsIHN1Y2Nlc3NBdXRoLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcnMgJiYgZXJyLmVycm9yc1swXSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gZXJyLmVycm9yc1swXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gJ0ZhaWxlZCB0byBzaWdudXAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBBdXRoU3J2LmxvZ291dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gXCIvXCI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAgJHNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5yZWdpc3RlciAgICAgPSAkc3RhdGUuY3VycmVudC5yZWdpc3RlcjtcbiAgICAgICAgICAgICRzY29wZS5sb2dpblRleHQgICAgPSAkc2NvcGUucmVnaXN0ZXIgPyAnUmVnaXN0ZXInIDogJ0xvZ2luJztcbiAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgICAgPSBudWxsO1xuICAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLnRva2VuICAgICAgICAgPSAkbG9jYWxTdG9yYWdlLnRva2VuO1xuICAgICAgICAkc2NvcGUudG9rZW5DbGFpbXMgICA9IEF1dGhTcnYuZ2V0VG9rZW5DbGFpbXMoKTtcbiAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzICAgPSB7fTtcblxuICAgIH0pO1xufSkoKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ0F1dGhTcnYnLCBmdW5jdGlvbiAoJGh0dHAsIEFQSV9VUkwsICRsb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgZnVuY3Rpb24gdXJsQmFzZTY0RGVjb2RlKHN0cikge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IHN0ci5yZXBsYWNlKCctJywgJysnKS5yZXBsYWNlKCdfJywgJy8nKTtcbiAgICAgICAgICAgIHN3aXRjaCAob3V0cHV0Lmxlbmd0aCAlIDQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICc9PSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICc9JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYmFzZTY0dXJsIHN0cmluZyEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5hdG9iKG91dHB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRDbGFpbXNGcm9tVG9rZW4oKSB7XG4gICAgICAgICAgICB2YXIgdG9rZW4gPSAkbG9jYWxTdG9yYWdlLnRva2VuO1xuICAgICAgICAgICAgdmFyIHVzZXIgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVuY29kZWQgPSB0b2tlbi5zcGxpdCgnLicpWzFdO1xuICAgICAgICAgICAgICAgIHVzZXIgPSBKU09OLnBhcnNlKHVybEJhc2U2NERlY29kZShlbmNvZGVkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0b2tlbkNsYWltcyA9IGdldENsYWltc0Zyb21Ub2tlbigpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzaWdudXA6IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICAgICAgICAgICRodHRwLnBvc3QoQVBJX1VSTCArICd1c2Vycy9zaWdudXAnLCBkYXRhKS5zdWNjZXNzKHN1Y2Nlc3MpLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaWduaW46IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICAgICAgICAgICRodHRwLnBvc3QoQVBJX1VSTCArICd1c2Vycy9zaWduaW4nLCBkYXRhKS5zdWNjZXNzKHN1Y2Nlc3MpLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2dvdXQ6IGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5DbGFpbXMgPSB7fTtcbiAgICAgICAgICAgICAgICBkZWxldGUgJGxvY2FsU3RvcmFnZS50b2tlbjtcbiAgICAgICAgICAgICAgICBzdWNjZXNzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0VG9rZW5DbGFpbXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW5DbGFpbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOlVzZXJDdHJsXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogIyBVc2VyQ3RybFxuICAgICAqIENvbnRyb2xsZXIgb2YgdGhlIHRpbWVNYW5hZ2VyXG4gICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlclNydikge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2VyQ3RybCcpO1xuICAgIH0pO1xufSkoKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ1VzZXJTcnYnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCArICd1c2Vycy86aWQnLCB7fSwge1xuXG4gICAgICAgICAgICBnZXRVc2Vyczoge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY3JlYXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6ICdAZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogJ0BwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0X25hbWU6ICdAZmlyc3RfbmFtZScsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RfbmFtZTogJ0BsYXN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogJ0B1c2VybmFtZScsXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1hZ2U6ICdAcHJvZmlsZV9pbWFnZScsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdAcm9sZScsXG4gICAgICAgICAgICAgICAgICAgIHdvcmtpbmdfaG91cnM6ICdAd29ya2luZ19ob3VycycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgICAgICBlbWFpbDogJ0BlbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiAnQHBhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RfbmFtZTogJ0BmaXJzdF9uYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgbGFzdF9uYW1lOiAnQGxhc3RfbmFtZScsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiAnQHVzZXJuYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZV9pbWFnZTogJ0Bwcm9maWxlX2ltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ0Byb2xlJyxcbiAgICAgICAgICAgICAgICAgICAgd29ya2luZ19ob3VyczogJ0B3b3JraW5nX2hvdXJzJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZWxldGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6V29ya3NoZWV0Q3RybFxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqICMgV29ya3NoZWV0Q3RybFxuICAgICAqIENvbnRyb2xsZXIgb2YgdGhlIHRpbWVNYW5hZ2VyXG4gICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpLmNvbnRyb2xsZXIoJ1dvcmtzaGVldEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBtZE1lbnVTcnYsIG1kRGlhbG9nU3J2LCBtZFRvYXN0U3J2LCBXb3Jrc2hlZXRTcnYsIFVzZXJTcnYpIHtcblxuICAgICAgICAkc2NvcGUub3Blbk1lbnUgPSBmdW5jdGlvbiAoJG1kT3Blbk1lbnUsIGV2KVxuICAgICAgICB7XG4gICAgICAgICAgICBtZE1lbnVTcnYub3Blbk1lbnUoJG1kT3Blbk1lbnUsIGV2KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlbkRlbGV0ZVdvcmtzaGVldERpYWxvZyAgICA9IGZ1bmN0aW9uIChldmVudCwgd29ya3NoZWV0KVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgcGFyYW1zICA9IHtcbiAgICAgICAgICAgICAgICAndGl0bGUnICAgICAgICAgOiAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIHdvcmtzaGVldD8nLFxuICAgICAgICAgICAgICAgICd0ZXh0Q29udGVudCcgICA6ICdUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lJyxcbiAgICAgICAgICAgICAgICAnYXJpYUxhYmVsJyAgICAgOiAnZGVsZXRlV29ya3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnb2snICAgICAgICAgICAgOiAnWWVzJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyAgICAgICAgOiAnQ2FuY2VsJyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNvbmZpcm0oZXZlbnQsIHBhcmFtcywgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGVsZXRlV29ya3NoZWV0KHdvcmtzaGVldCk7XG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5FZGl0VXNlckRpYWxvZyAgID0gZnVuY3Rpb24gKGV2ZW50KVxuICAgICAgICB7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5mcm9tVGVtcGxhdGUoJy4vdmlld3MvYXBwL2RpYWxvZ3MvZWRpdF91c2VyLmh0bWwnLCBldmVudCwgJHNjb3BlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlbkVkaXRXb3Jrc2hlZXREaWFsb2cgID0gZnVuY3Rpb24gKGV2ZW50LCB3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0ICAgICA9IHdvcmtzaGVldDtcbiAgICAgICAgICAgIC8vIGNyZWF0aW5nIGEgamF2YXNjcmlwdCBkYXRlIGZyb20gc3RyaW5nXG4gICAgICAgICAgICBpZiAod29ya3NoZWV0LmRhdGUpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMgID0gbmV3IERhdGUod29ya3NoZWV0LmRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5mcm9tVGVtcGxhdGUoJy4vdmlld3MvYXBwL2RpYWxvZ3MvZWRpdF93b3Jrc2hlZXQuaHRtbCcsIGV2ZW50LCAkc2NvcGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIC0tLS1cblxuICAgICAgICAkc2NvcGUud29ya3NoZWV0RmlsdGVyID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh3b3Jrc2hlZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCEkc2NvcGUuZmlsdGVycy5zdGFydF9kYXRlIHx8IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKSA+PSAkc2NvcGUuZmlsdGVycy5zdGFydF9kYXRlKSAmJlxuICAgICAgICAgICAgICAgICAgICAoISRzY29wZS5maWx0ZXJzLmVuZF9kYXRlIHx8IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKSA8PSAkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zZWxlY3RVc2VyICAgPSBmdW5jdGlvbiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMgICAgICAgPSBbXTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciAgICAgID0gdXNlcjtcblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2LnVzZXJXb3Jrc2hlZXRzKHsndXNlcklkJyA6IHVzZXIuaWR9LCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMgICA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zb3J0VXNlcnMgICAgPSBmdW5jdGlvbiAoc29ydCwgcmV2ZXJzZSlcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJTb3J0ICAgICAgICAgPSBzb3J0O1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJTb3J0UmV2ZXJzZSAgPSByZXZlcnNlO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5kZWxldGVXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCF3b3Jrc2hlZXQuaWQpIHtcbiAgICAgICAgICAgICAgICAvLyBubyB3b3Jrc2hlZXQgdG8gZGVsZXRlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBXb3Jrc2hlZXRTcnYuZGVsZXRlKHtpZCA6IHdvcmtzaGVldC5pZH0sIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgd29ya3NoZWV0SW5kZXggID0gJHNjb3BlLndvcmtzaGVldHMuaW5kZXhPZih3b3Jrc2hlZXQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzaGVldEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUud29ya3NoZWV0cy5zcGxpY2Uod29ya3NoZWV0SW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuc2hvdyh7J2NvbnRlbnQnIDogJ1dvcmtzaGVldCBEZWxldGVkIScsICdwb3NpdGlvbicgOiAndG9wIHJpZ2h0JywgJ2RlbGF5JyA6IDMwMDB9KTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2FuY2VsRWRpdFVzZXIgICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNhbmNlbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5maW5pc2hFZGl0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5zYXZlVXNlcih1c2VyKTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmhpZGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2F2ZVVzZXIgPSBmdW5jdGlvbiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIG1ldGhvZCAgPSB1c2VyLmlkID8gJ3VwZGF0ZScgOiAnY3JlYXRlJztcblxuICAgICAgICAgICAgVXNlclNydlttZXRob2RdKHVzZXIsIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGluc2VydCBpbiBET00gKyB0b2FzdFxuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyB0b2FzdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbEVkaXRXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgbWREaWFsb2dTcnYuY2FuY2VsKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmZpbmlzaEVkaXRXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLnNhdmVXb3Jrc2hlZXQoKTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmhpZGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2F2ZVdvcmtzaGVldCAgICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBtZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5pZCA/ICd1cGRhdGUnIDogJ2NyZWF0ZSc7XG4gICAgICAgICAgICAvLyBwYXJzaW5nIGRhdGUgYW5kIHVzZXJfaWRcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0LnVzZXJfaWQgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC51c2VyX2lkID8gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQudXNlcl9pZCA6ICRzY29wZS5jdXJyZW50VXNlci5pZDtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0LmRhdGUgICAgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMgPyAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApIDogJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZTtcblxuICAgICAgICAgICAgaWYgKCRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZU5vdGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2W21ldGhvZF0oJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQsIGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc2hlZXQgICA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgIC8vIGluc2VydGluZyB3b3Jrc2hlZXQgaW4gRE9NXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ICAgICAgID0gJHNjb3BlLndvcmtzaGVldHMubWFwKGZ1bmN0aW9uICh3KSB7IHJldHVybiB3LmlkOyB9KS5pbmRleE9mKHdvcmtzaGVldC5pZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdvcmtzaGVldCBub3Qgb24gbGlzdCwgY3JlYXRpbmcgZW50cnlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgICAgPSAoSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3b3Jrc2hlZXQpKSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzLnVuc2hpZnQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuc2hvdyh7J2NvbnRlbnQnIDogJ1N1Y2Nlc3NmdWxseSBDcmVhdGVkIFdvcmtzaGVldCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgbWRUb2FzdFNydi5lcnIoeydjb250ZW50JyA6ICdFcnJvciBFZGl0aW5nIFdvcmtzaGVldCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGVsZXRlTm90ZSAgID0gZnVuY3Rpb24gKGluZGV4KVxuICAgICAgICB7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY3JlYXRlTm90ZSAgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCEkc2NvcGUuY3VycmVudFdvcmtzaGVldC5uZXdfbm90ZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoISRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5vdGVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubm90ZXMgICA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3Rlcy5wdXNoKCRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlKTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlICAgID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gLS0tLS0tLS0tLS1cblxuICAgICAgICBVc2VyU3J2LmdldFVzZXJzKHt9LCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcnMgICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGVycm9yIHRyZWF0bWVudFxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuZmlsdGVycyAgPSB7fTtcbiAgICB9KTtcbn0pKCk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdXb3Jrc2hlZXRTcnYnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCArICd3b3Jrc2hlZXRzLzppZCcsIHt9LCB7XG5cbiAgICAgICAgICAgIHVzZXJXb3Jrc2hlZXRzOiB7XG4gICAgICAgICAgICAgICAgdXJsOiBBUElfVVJMICsgJ3VzZXIvOnVzZXJJZC93b3Jrc2hlZXRzJyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6ICdAZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzOiAnQGhvdXJzJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogJ0B1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgbm90ZXM6ICdAbm90ZXMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogJ0BkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgaG91cnM6ICdAaG91cnMnLFxuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnQHVzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICBub3RlczogJ0Bub3RlcycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdtZERpYWxvZ1NydicsIGZ1bmN0aW9uICgkbWREaWFsb2cpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnJvbVRlbXBsYXRlOiBmdW5jdGlvbiAodGVtcGxhdGUsIGV2ZW50LCAkc2NvcGUpIHtcblxuICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogdGVtcGxhdGUsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2NvcGUgPSAkc2NvcGUuJG5ldygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiAkbWREaWFsb2cuc2hvdyhvcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLmhpZGUoKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNhbmNlbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkbWREaWFsb2cuY2FuY2VsKCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhbGVydDogZnVuY3Rpb24gKHRpdGxlLCBjb250ZW50KXtcbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgICAgICAgICAgICAgJG1kRGlhbG9nLmFsZXJ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aXRsZSh0aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAub2soJ09rJylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY29uZmlybTogZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMsIHN1Y2Nlc3MsIGVycikge1xuICAgICAgICAgICAgICAgIHZhciBjb25maXJtICAgICA9ICRtZERpYWxvZy5jb25maXJtKClcbiAgICAgICAgICAgICAgICAgICAgLnRpdGxlKHBhcmFtcy50aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgLnRleHRDb250ZW50KHBhcmFtcy50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICAgICAgLmFyaWFMYWJlbChwYXJhbXMuYXJpYUxhYmVsKVxuICAgICAgICAgICAgICAgICAgICAudGFyZ2V0RXZlbnQoZXZlbnQpXG4gICAgICAgICAgICAgICAgICAgIC5vayhwYXJhbXMub2spXG4gICAgICAgICAgICAgICAgICAgIC5jYW5jZWwocGFyYW1zLmNhbmNlbCk7XG5cbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKHN1Y2Nlc3MsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5zZXJ2aWNlKCdtZE1lbnVTcnYnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIG9wZW5NZW51IDogZnVuY3Rpb24gKCRtZE9wZW5NZW51LCBldmVudCkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmF0b3JFdiA9IGV2ZW50O1xuICAgICAgICAgICAgICAgICRtZE9wZW5NZW51KGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdtZFRvYXN0U3J2JywgZnVuY3Rpb24gKCRtZFRvYXN0KSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24gKHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZFRvYXN0LnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZFRvYXN0LnNpbXBsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChwYXJhbXMuY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3NpdGlvbihwYXJhbXMucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGlkZURlbGF5KHBhcmFtcy5kZWxheSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAocGFyYW1zKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kVG9hc3Quc2hvdyhcbiAgICAgICAgICAgICAgICAgICAgJG1kVG9hc3Quc2ltcGxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250ZW50KHBhcmFtcy5jb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvc2l0aW9uKHBhcmFtcy5wb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVtZSgnd2FybicpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGlkZURlbGF5KHBhcmFtcy5kZWxheSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuIl19
