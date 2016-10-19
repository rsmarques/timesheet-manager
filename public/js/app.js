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
    angular.module('app.controllers').controller('UserCtrl', ["$rootScope", "$scope", "mdDialogSrv", "UserSrv", function ($rootScope, $scope, mdDialogSrv, UserSrv) {

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

        $scope.getProfile();
    }]);
})();

angular.module('app.services')

    .factory('UserSrv', ["$resource", "API_URL", function ($resource, API_URL) {
        return $resource(API_URL + 'users/:id', {}, {

            me: {
                url: API_URL + 'me',
                method: 'GET',
            },

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
    angular.module('app.controllers').controller('WorksheetCtrl', ["$rootScope", "$scope", "mdMenuSrv", "mdDialogSrv", "mdToastSrv", "WorksheetSrv", "UserSrv", function ($rootScope, $scope, mdMenuSrv, mdDialogSrv, mdToastSrv, WorksheetSrv, UserSrv) {

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

        $scope.openDeleteUserDialog    = function (event, user)
        {
            var params  = {
                'title'         : 'Are you sure you want to delete this user?',
                'textContent'   : 'This action cannot be undone',
                'ariaLabel'     : 'deleteUser',
                'ok'            : 'Yes',
                'cancel'        : 'Cancel',
            };

            mdDialogSrv.confirm(event, params, function (success) {
                $scope.deleteUser(user);

            }, function (err) {

            });
        };

        $scope.openEditUserDialog   = function (event)
        {
            mdDialogSrv.fromTemplate('./views/app/dialogs/edit_user.html', event, $scope);
        };

        $scope.openEditWorksheetDialog  = function (event, worksheet)
        {
            $scope.canEditWorksheet(worksheet);
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

        $scope.deleteUser  = function (user)
        {
            if (!user.id) {
                // no user to delete
                return false;
            }

            UserSrv.delete({id : user.id}, function (success) {

                var userIndex       = $scope.users.indexOf(user);
                // deleting user from DOM
                if (userIndex !== -1) {
                    $scope.users.splice(userIndex, 1);
                }

                if (user.id == $scope.me.id) {
                    // logged user was deleted, logging out
                    window.location = "#/logout";
                    return true;
                }

                $scope.currentUser  = null;

                mdToastSrv.show({'content' : 'User Deleted!', 'position' : 'top right', 'delay' : 3000});

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
                mdToastSrv.error({'content' : 'Error Editing Worksheet!', 'position' : 'top right', 'delay' : 3000});
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

        $scope.canEditWorksheet = function (worksheet)
        {
            // user can edit worksheet if it's an admin or owns the worksheet
            return ($rootScope.me.role === 'Admin' || worksheet.user_id == $rootScope.me.id);
        };

        $scope.hasAdminAccess = function ()
        {
            // user can edit worksheet if it's an admin or owns the worksheet
            return ($rootScope.me.role === 'Admin' || $rootScope.me.role === 'Manager');
        };

        $scope.getUsers   = function ()
        {
            UserSrv.getUsers({}, function (result) {
                $scope.users    = result.data;

            }, function (err) {
                // TODO error treatment
            });
        };

        // -----------

        $scope.getUsers();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC91c2Vycy91c2VyQ3RybC5qcyIsImFwcC91c2Vycy91c2VyU3J2LmpzIiwiYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Q3RybC5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldFNydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL2RpYWxvZ1Nydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL21lbnVTcnYuanMiLCJzZXJ2aWNlcy9tYXRlcmlhbC90b2FzdFNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUEsYUFBQTtJQUNBLFFBQUEsT0FBQSxtQkFBQSxDQUFBLGFBQUEsY0FBQSxjQUFBLGNBQUE7SUFDQSxRQUFBLE9BQUEsZ0JBQUE7SUFDQSxRQUFBLE9BQUEsY0FBQTs7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLDJCQUFBLFNBQUEsaUJBQUE7UUFDQSxnQkFBQSxRQUFBLE1BQUE7OztLQUdBLDhCQUFBLFNBQUEsb0JBQUE7UUFDQSxtQkFBQSxNQUFBLGFBQUEsa0JBQUEsUUFBQTtRQUNBLG1CQUFBLE1BQUEsZUFBQSxrQkFBQSxVQUFBO1FBQ0EsbUJBQUEsTUFBQSxlQUFBLGtCQUFBLGVBQUE7UUFDQSxtQkFBQSxNQUFBLGFBQUEsa0JBQUEsUUFBQTs7O0tBR0EsU0FBQSxXQUFBOzs7QUNkQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxRQUFBLE9BQUEsY0FBQSxpRUFBQSxVQUFBLGdCQUFBLG9CQUFBLGVBQUE7O1FBRUE7O2FBRUEsTUFBQSxVQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZ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LFNBQUEsT0FBQTtnQkFDQSxNQUFBLEtBQUEsVUFBQSxnQkFBQSxNQUFBLFFBQUEsU0FBQSxNQUFBOztZQUVBLFFBQUEsVUFBQSxNQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLEtBQUEsVUFBQSxnQkFBQSxNQUFBLFFBQUEsU0FBQSxNQUFBOztZQUVBLFFBQUEsVUFBQSxTQUFBO2dCQUNBLGNBQUE7Z0JBQ0EsT0FBQSxjQUFBO2dCQUNBOztZQUVBLGdCQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7OztBQzdDQSxDQUFBLFVBQUE7SUFDQTs7Ozs7Ozs7O0lBU0EsUUFBQSxPQUFBLG1CQUFBLFdBQUEsK0RBQUEsVUFBQSxZQUFBLFFBQUEsYUFBQSxTQUFBOztRQUVBLE9BQUEsZUFBQTtRQUNBO1lBQ0EsUUFBQSxHQUFBLElBQUEsVUFBQSxRQUFBOztnQkFFQSxXQUFBLE9BQUEsT0FBQTtlQUNBLFVBQUEsS0FBQTs7Ozs7UUFLQSxPQUFBLHlCQUFBLFVBQUE7UUFDQTtZQUNBLE9BQUEsZ0JBQUEsV0FBQTtZQUNBLFlBQUEsYUFBQSxzQ0FBQSxPQUFBOzs7UUFHQSxPQUFBOzs7O0FDNUJBLFFBQUEsT0FBQTs7S0FFQSxRQUFBLG9DQUFBLFVBQUEsV0FBQSxTQUFBO1FBQ0EsT0FBQSxVQUFBLFVBQUEsYUFBQSxJQUFBOztZQUVBLElBQUE7Z0JBQ0EsS0FBQSxVQUFBO2dCQUNBLFFBQUE7OztZQUdBLFVBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7WUFJQSxLQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxPQUFBO29CQUNBLFVBQUE7b0JBQ0EsWUFBQTtvQkFDQSxXQUFBO29CQUNBLFVBQUE7b0JBQ0EsZUFBQTtvQkFDQSxNQUFBO29CQUNBLGVBQUE7Ozs7WUFJQSxRQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBO29CQUNBLE9BQUE7b0JBQ0EsVUFBQTtvQkFD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IiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXG4gICAgICAgICdhcHAuY29udHJvbGxlcnMnLFxuICAgICAgICAnYXBwLnNlcnZpY2VzJyxcbiAgICAgICAgJ2FwcC5yb3V0ZXMnLFxuICAgICAgICAnYXBwLmNvbmZpZydcbiAgICBdKTtcblxuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnLCBbJ3VpLnJvdXRlcicsICduZ1N0b3JhZ2UnXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycsIFsndWkucm91dGVyJywgJ25nTWF0ZXJpYWwnLCAnbmdSZXNvdXJjZScsICduZ01lc3NhZ2VzJywgJ25nU3RvcmFnZSddKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJywgW10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29uZmlnJywgW10pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbmZpZycpLmNvbmZpZyhmdW5jdGlvbigkbWRJY29uUHJvdmlkZXIpIHtcbiAgICAgICAgJG1kSWNvblByb3ZpZGVyLmZvbnRTZXQoJ21kJywgJ21hdGVyaWFsLWljb25zJyk7XG4gICAgfSlcblxuICAgIC5jb25maWcoZnVuY3Rpb24oJG1kVGhlbWluZ1Byb3ZpZGVyKSB7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGFyay1ncmV5JykuYmFja2dyb3VuZFBhbGV0dGUoJ2dyZXknKS5kYXJrKCk7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGFyay1vcmFuZ2UnKS5iYWNrZ3JvdW5kUGFsZXR0ZSgnb3JhbmdlJykuZGFyaygpO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RhcmstcHVycGxlJykuYmFja2dyb3VuZFBhbGV0dGUoJ2RlZXAtcHVycGxlJykuZGFyaygpO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RhcmstYmx1ZScpLmJhY2tncm91bmRQYWxldHRlKCdibHVlJykuZGFyaygpO1xuICAgIH0pXG5cbiAgICAuY29uc3RhbnQoJ0FQSV9VUkwnLCAnYXBpLycpO1xuXG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnKS5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRodHRwUHJvdmlkZXIpIHtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuXG4gICAgICAgICAgICAuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL2F1dGgvYXV0aC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwnLFxuICAgICAgICAgICAgICAgIHJlZ2lzdGVyOiAxLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnc2lnbmluJywge1xuICAgICAgICAgICAgICAgIHVybDogJy9zaWduaW4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvYXV0aC9hdXRoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXG4gICAgICAgICAgICAgICAgcmVnaXN0ZXI6IDAsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCdsb2dvdXQnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL2xvZ291dCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC9hdXRoL2F1dGguaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsJyxcbiAgICAgICAgICAgICAgICBsb2dvdXQ6IDEsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd1c2VycycsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvdXNlcnMvdXNlci5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVXNlckN0cmwnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc2hlZXRzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvd29ya3NoZWV0cy93b3Jrc2hlZXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzaGVldEN0cmwnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbJyRxJywgJyRsb2NhdGlvbicsICckbG9jYWxTdG9yYWdlJywgZnVuY3Rpb24gKCRxLCAkbG9jYXRpb24sICRsb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ3JlcXVlc3QnOiBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG4gICAgICAgICAgICAgICAgICAgIGlmICgkbG9jYWxTdG9yYWdlLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuaGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0JlYXJlciAnICsgJGxvY2FsU3RvcmFnZS50b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ3Jlc3BvbnNlRXJyb3InOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAwIHx8IHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxIHx8IHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbiAgICB9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdGltZU1hbmFnZXIuY29udHJvbGxlcjpBdXRoQ3RybFxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqICMgQXV0aEN0cmxcbiAgICAgKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnKS5jb250cm9sbGVyKCdBdXRoQ3RybCcsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUsICRzdGF0ZSwgJGxvY2F0aW9uLCAkbG9jYWxTdG9yYWdlLCBBdXRoU3J2KSB7XG5cbiAgICAgICAgZnVuY3Rpb24gc3VjY2Vzc0F1dGggKHJlcykge1xuICAgICAgICAgICAgJGxvY2FsU3RvcmFnZS50b2tlbiA9IHJlcy50b2tlbjtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiAgICAgPSBcIiMvXCI7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUucGVyZm9ybUxvZ2luID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5yZWdpc3Rlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuc2lnbnVwKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuc2lnbmluKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnBlcmZvcm1Mb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBBdXRoU3J2LmxvZ291dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gXCIjL3NpZ25pblwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNpZ25pbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmb3JtRGF0YSAgICAgICAgPSAkc2NvcGUuY3JlZGVudGlhbHM7XG4gICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gbnVsbDtcblxuICAgICAgICAgICAgQXV0aFNydi5zaWduaW4oZm9ybURhdGEsIHN1Y2Nlc3NBdXRoLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmF1dGhFcnJvciA9ICdJbnZhbGlkIGVtYWlsL3Bhc3N3b3JkLic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGZvcm1EYXRhICAgICAgICA9ICRzY29wZS5jcmVkZW50aWFscztcbiAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgICAgPSBudWxsO1xuXG4gICAgICAgICAgICBBdXRoU3J2LnNpZ251cChmb3JtRGF0YSwgc3VjY2Vzc0F1dGgsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9ycyAmJiBlcnIuZXJyb3JzWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgICAgPSBlcnIuZXJyb3JzWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgICAgPSAnRmFpbGVkIHRvIHNpZ251cCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVkZWZpbmluZyBwYWdlIHN0YXR1cyBmb3IgbG9naW4vbG9nb3V0L3JlZ2lzdGVyXG4gICAgICAgICRzY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9nb3V0ICAgICAgID0gJHN0YXRlLmN1cnJlbnQubG9nb3V0O1xuICAgICAgICAgICAgaWYgKCRzY29wZS5sb2dvdXQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVyZm9ybUxvZ291dCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUucmVnaXN0ZXIgICAgID0gJHN0YXRlLmN1cnJlbnQucmVnaXN0ZXI7XG4gICAgICAgICAgICAkc2NvcGUubG9naW5UZXh0ICAgID0gJHNjb3BlLnJlZ2lzdGVyID8gJ1JlZ2lzdGVyJyA6ICdMb2dpbic7XG4gICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gbnVsbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLnRva2VuICAgICAgICAgICAgPSAkbG9jYWxTdG9yYWdlLnRva2VuO1xuICAgICAgICAkc2NvcGUudG9rZW5DbGFpbXMgICAgICA9IEF1dGhTcnYuZ2V0VG9rZW5DbGFpbXMoKTtcbiAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzICAgICAgPSB7fTtcblxuICAgIH0pO1xufSkoKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ0F1dGhTcnYnLCBmdW5jdGlvbiAoJGh0dHAsIEFQSV9VUkwsICRsb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgZnVuY3Rpb24gdXJsQmFzZTY0RGVjb2RlKHN0cikge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IHN0ci5yZXBsYWNlKCctJywgJysnKS5yZXBsYWNlKCdfJywgJy8nKTtcbiAgICAgICAgICAgIHN3aXRjaCAob3V0cHV0Lmxlbmd0aCAlIDQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICc9PSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICc9JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYmFzZTY0dXJsIHN0cmluZyEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5hdG9iKG91dHB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRDbGFpbXNGcm9tVG9rZW4oKSB7XG4gICAgICAgICAgICB2YXIgdG9rZW4gPSAkbG9jYWxTdG9yYWdlLnRva2VuO1xuICAgICAgICAgICAgdmFyIHVzZXIgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVuY29kZWQgPSB0b2tlbi5zcGxpdCgnLicpWzFdO1xuICAgICAgICAgICAgICAgIHVzZXIgPSBKU09OLnBhcnNlKHVybEJhc2U2NERlY29kZShlbmNvZGVkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0b2tlbkNsYWltcyA9IGdldENsYWltc0Zyb21Ub2tlbigpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzaWdudXA6IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICAgICAgICAgICRodHRwLnBvc3QoQVBJX1VSTCArICd1c2Vycy9zaWdudXAnLCBkYXRhKS5zdWNjZXNzKHN1Y2Nlc3MpLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaWduaW46IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICAgICAgICAgICRodHRwLnBvc3QoQVBJX1VSTCArICd1c2Vycy9zaWduaW4nLCBkYXRhKS5zdWNjZXNzKHN1Y2Nlc3MpLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2dvdXQ6IGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5DbGFpbXMgPSB7fTtcbiAgICAgICAgICAgICAgICBkZWxldGUgJGxvY2FsU3RvcmFnZS50b2tlbjtcbiAgICAgICAgICAgICAgICBzdWNjZXNzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0VG9rZW5DbGFpbXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW5DbGFpbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOlVzZXJDdHJsXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogIyBVc2VyQ3RybFxuICAgICAqIENvbnRyb2xsZXIgb2YgdGhlIHRpbWVNYW5hZ2VyXG4gICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgbWREaWFsb2dTcnYsIFVzZXJTcnYpIHtcblxuICAgICAgICAkc2NvcGUuZ2V0UHJvZmlsZSAgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgVXNlclNydi5tZSh7fSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIC8vIHN0b3JpbmcgaW4gcm9vdFNjb3BlIHRvIHNoYXJlIHdpdGggb3RoZXIgY29udHJvbGxlcnNcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLm1lICAgPSByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5FZGl0UHJvZmlsZURpYWxvZyAgPSBmdW5jdGlvbiAoZXZlbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciAgID0gJHJvb3RTY29wZS5tZTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmZyb21UZW1wbGF0ZSgnLi92aWV3cy9hcHAvZGlhbG9ncy9lZGl0X3VzZXIuaHRtbCcsIGV2ZW50LCAkc2NvcGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5nZXRQcm9maWxlKCk7XG4gICAgfSk7XG59KSgpO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnVXNlclNydicsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIEFQSV9VUkwpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShBUElfVVJMICsgJ3VzZXJzLzppZCcsIHt9LCB7XG5cbiAgICAgICAgICAgIG1lOiB7XG4gICAgICAgICAgICAgICAgdXJsOiBBUElfVVJMICsgJ21lJyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0VXNlcnM6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiAnQGVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6ICdAcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBmaXJzdF9uYW1lOiAnQGZpcnN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICBsYXN0X25hbWU6ICdAbGFzdF9uYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6ICdAdXNlcm5hbWUnLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlX2ltYWdlOiAnQHByb2ZpbGVfaW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICByb2xlOiAnQHJvbGUnLFxuICAgICAgICAgICAgICAgICAgICB3b3JraW5nX2hvdXJzOiAnQHdvcmtpbmdfaG91cnMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6ICdAZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogJ0BwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0X25hbWU6ICdAZmlyc3RfbmFtZScsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RfbmFtZTogJ0BsYXN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogJ0B1c2VybmFtZScsXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1hZ2U6ICdAcHJvZmlsZV9pbWFnZScsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdAcm9sZScsXG4gICAgICAgICAgICAgICAgICAgIHdvcmtpbmdfaG91cnM6ICdAd29ya2luZ19ob3VycycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOldvcmtzaGVldEN0cmxcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiAjIFdvcmtzaGVldEN0cmxcbiAgICAgKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnKS5jb250cm9sbGVyKCdXb3Jrc2hlZXRDdHJsJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgbWRNZW51U3J2LCBtZERpYWxvZ1NydiwgbWRUb2FzdFNydiwgV29ya3NoZWV0U3J2LCBVc2VyU3J2KSB7XG5cbiAgICAgICAgJHNjb3BlLm9wZW5NZW51ID0gZnVuY3Rpb24gKCRtZE9wZW5NZW51LCBldilcbiAgICAgICAge1xuICAgICAgICAgICAgbWRNZW51U3J2Lm9wZW5NZW51KCRtZE9wZW5NZW51LCBldik7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5EZWxldGVXb3Jrc2hlZXREaWFsb2cgICAgPSBmdW5jdGlvbiAoZXZlbnQsIHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyAgPSB7XG4gICAgICAgICAgICAgICAgJ3RpdGxlJyAgICAgICAgIDogJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyB3b3Jrc2hlZXQ/JyxcbiAgICAgICAgICAgICAgICAndGV4dENvbnRlbnQnICAgOiAnVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZScsXG4gICAgICAgICAgICAgICAgJ2FyaWFMYWJlbCcgICAgIDogJ2RlbGV0ZVdvcmtzaGVldCcsXG4gICAgICAgICAgICAgICAgJ29rJyAgICAgICAgICAgIDogJ1llcycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcgICAgICAgIDogJ0NhbmNlbCcsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5jb25maXJtKGV2ZW50LCBwYXJhbXMsIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZVdvcmtzaGVldCh3b3Jrc2hlZXQpO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vcGVuRGVsZXRlVXNlckRpYWxvZyAgICA9IGZ1bmN0aW9uIChldmVudCwgdXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyAgPSB7XG4gICAgICAgICAgICAgICAgJ3RpdGxlJyAgICAgICAgIDogJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyB1c2VyPycsXG4gICAgICAgICAgICAgICAgJ3RleHRDb250ZW50JyAgIDogJ1RoaXMgYWN0aW9uIGNhbm5vdCBiZSB1bmRvbmUnLFxuICAgICAgICAgICAgICAgICdhcmlhTGFiZWwnICAgICA6ICdkZWxldGVVc2VyJyxcbiAgICAgICAgICAgICAgICAnb2snICAgICAgICAgICAgOiAnWWVzJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyAgICAgICAgOiAnQ2FuY2VsJyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNvbmZpcm0oZXZlbnQsIHBhcmFtcywgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGVsZXRlVXNlcih1c2VyKTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlbkVkaXRVc2VyRGlhbG9nICAgPSBmdW5jdGlvbiAoZXZlbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmZyb21UZW1wbGF0ZSgnLi92aWV3cy9hcHAvZGlhbG9ncy9lZGl0X3VzZXIuaHRtbCcsIGV2ZW50LCAkc2NvcGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vcGVuRWRpdFdvcmtzaGVldERpYWxvZyAgPSBmdW5jdGlvbiAoZXZlbnQsIHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLmNhbkVkaXRXb3Jrc2hlZXQod29ya3NoZWV0KTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0ICAgICA9IHdvcmtzaGVldDtcbiAgICAgICAgICAgIC8vIGNyZWF0aW5nIGEgamF2YXNjcmlwdCBkYXRlIGZyb20gc3RyaW5nXG4gICAgICAgICAgICBpZiAod29ya3NoZWV0LmRhdGUpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMgID0gbmV3IERhdGUod29ya3NoZWV0LmRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5mcm9tVGVtcGxhdGUoJy4vdmlld3MvYXBwL2RpYWxvZ3MvZWRpdF93b3Jrc2hlZXQuaHRtbCcsIGV2ZW50LCAkc2NvcGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIC0tLS1cblxuICAgICAgICAkc2NvcGUud29ya3NoZWV0RmlsdGVyID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh3b3Jrc2hlZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCEkc2NvcGUuZmlsdGVycy5zdGFydF9kYXRlIHx8IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKSA+PSAkc2NvcGUuZmlsdGVycy5zdGFydF9kYXRlKSAmJlxuICAgICAgICAgICAgICAgICAgICAoISRzY29wZS5maWx0ZXJzLmVuZF9kYXRlIHx8IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKSA8PSAkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zZWxlY3RVc2VyICAgPSBmdW5jdGlvbiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMgICAgICAgPSBbXTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciAgICAgID0gdXNlcjtcblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2LnVzZXJXb3Jrc2hlZXRzKHsndXNlcklkJyA6IHVzZXIuaWR9LCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMgICA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zb3J0VXNlcnMgICAgPSBmdW5jdGlvbiAoc29ydCwgcmV2ZXJzZSlcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJTb3J0ICAgICAgICAgPSBzb3J0O1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJTb3J0UmV2ZXJzZSAgPSByZXZlcnNlO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5kZWxldGVXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCF3b3Jrc2hlZXQuaWQpIHtcbiAgICAgICAgICAgICAgICAvLyBubyB3b3Jrc2hlZXQgdG8gZGVsZXRlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBXb3Jrc2hlZXRTcnYuZGVsZXRlKHtpZCA6IHdvcmtzaGVldC5pZH0sIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgd29ya3NoZWV0SW5kZXggID0gJHNjb3BlLndvcmtzaGVldHMuaW5kZXhPZih3b3Jrc2hlZXQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzaGVldEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUud29ya3NoZWV0cy5zcGxpY2Uod29ya3NoZWV0SW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuc2hvdyh7J2NvbnRlbnQnIDogJ1dvcmtzaGVldCBEZWxldGVkIScsICdwb3NpdGlvbicgOiAndG9wIHJpZ2h0JywgJ2RlbGF5JyA6IDMwMDB9KTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGVsZXRlVXNlciAgPSBmdW5jdGlvbiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCF1c2VyLmlkKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gdXNlciB0byBkZWxldGVcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFVzZXJTcnYuZGVsZXRlKHtpZCA6IHVzZXIuaWR9LCBmdW5jdGlvbiAoc3VjY2Vzcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHVzZXJJbmRleCAgICAgICA9ICRzY29wZS51c2Vycy5pbmRleE9mKHVzZXIpO1xuICAgICAgICAgICAgICAgIC8vIGRlbGV0aW5nIHVzZXIgZnJvbSBET01cbiAgICAgICAgICAgICAgICBpZiAodXNlckluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcnMuc3BsaWNlKHVzZXJJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHVzZXIuaWQgPT0gJHNjb3BlLm1lLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGxvZ2dlZCB1c2VyIHdhcyBkZWxldGVkLCBsb2dnaW5nIG91dFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBcIiMvbG9nb3V0XCI7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciAgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgbWRUb2FzdFNydi5zaG93KHsnY29udGVudCcgOiAnVXNlciBEZWxldGVkIScsICdwb3NpdGlvbicgOiAndG9wIHJpZ2h0JywgJ2RlbGF5JyA6IDMwMDB9KTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2FuY2VsRWRpdFVzZXIgICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNhbmNlbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5maW5pc2hFZGl0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5zYXZlVXNlcih1c2VyKTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmhpZGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2F2ZVVzZXIgPSBmdW5jdGlvbiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIG1ldGhvZCAgPSB1c2VyLmlkID8gJ3VwZGF0ZScgOiAnY3JlYXRlJztcblxuICAgICAgICAgICAgVXNlclNydlttZXRob2RdKHVzZXIsIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGluc2VydCBpbiBET00gKyB0b2FzdFxuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyB0b2FzdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbEVkaXRXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgbWREaWFsb2dTcnYuY2FuY2VsKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmZpbmlzaEVkaXRXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLnNhdmVXb3Jrc2hlZXQoKTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmhpZGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2F2ZVdvcmtzaGVldCAgICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBtZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5pZCA/ICd1cGRhdGUnIDogJ2NyZWF0ZSc7XG4gICAgICAgICAgICAvLyBwYXJzaW5nIGRhdGUgYW5kIHVzZXJfaWRcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0LnVzZXJfaWQgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC51c2VyX2lkID8gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQudXNlcl9pZCA6ICRzY29wZS5jdXJyZW50VXNlci5pZDtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0LmRhdGUgICAgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMgPyAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApIDogJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZTtcblxuICAgICAgICAgICAgaWYgKCRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZU5vdGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2W21ldGhvZF0oJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQsIGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc2hlZXQgICA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgIC8vIGluc2VydGluZyB3b3Jrc2hlZXQgaW4gRE9NXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ICAgICAgID0gJHNjb3BlLndvcmtzaGVldHMubWFwKGZ1bmN0aW9uICh3KSB7IHJldHVybiB3LmlkOyB9KS5pbmRleE9mKHdvcmtzaGVldC5pZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdvcmtzaGVldCBub3Qgb24gbGlzdCwgY3JlYXRpbmcgZW50cnlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgICAgPSAoSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3b3Jrc2hlZXQpKSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzLnVuc2hpZnQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuc2hvdyh7J2NvbnRlbnQnIDogJ1N1Y2Nlc3NmdWxseSBDcmVhdGVkIFdvcmtzaGVldCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgbWRUb2FzdFNydi5lcnJvcih7J2NvbnRlbnQnIDogJ0Vycm9yIEVkaXRpbmcgV29ya3NoZWV0IScsICdwb3NpdGlvbicgOiAndG9wIHJpZ2h0JywgJ2RlbGF5JyA6IDMwMDB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5kZWxldGVOb3RlICAgPSBmdW5jdGlvbiAoaW5kZXgpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5vdGVzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jcmVhdGVOb3RlICAgPSBmdW5jdGlvbiAoKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoISRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICghJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubm90ZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3RlcyAgID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5vdGVzLnB1c2goJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubmV3X25vdGUpO1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubmV3X25vdGUgICAgPSBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2FuRWRpdFdvcmtzaGVldCA9IGZ1bmN0aW9uICh3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIHVzZXIgY2FuIGVkaXQgd29ya3NoZWV0IGlmIGl0J3MgYW4gYWRtaW4gb3Igb3ducyB0aGUgd29ya3NoZWV0XG4gICAgICAgICAgICByZXR1cm4gKCRyb290U2NvcGUubWUucm9sZSA9PT0gJ0FkbWluJyB8fCB3b3Jrc2hlZXQudXNlcl9pZCA9PSAkcm9vdFNjb3BlLm1lLmlkKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuaGFzQWRtaW5BY2Nlc3MgPSBmdW5jdGlvbiAoKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyB1c2VyIGNhbiBlZGl0IHdvcmtzaGVldCBpZiBpdCdzIGFuIGFkbWluIG9yIG93bnMgdGhlIHdvcmtzaGVldFxuICAgICAgICAgICAgcmV0dXJuICgkcm9vdFNjb3BlLm1lLnJvbGUgPT09ICdBZG1pbicgfHwgJHJvb3RTY29wZS5tZS5yb2xlID09PSAnTWFuYWdlcicpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5nZXRVc2VycyAgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgVXNlclNydi5nZXRVc2Vycyh7fSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICRzY29wZS51c2VycyAgICA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBlcnJvciB0cmVhdG1lbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tXG5cbiAgICAgICAgJHNjb3BlLmdldFVzZXJzKCk7XG4gICAgICAgICRzY29wZS5maWx0ZXJzICA9IHt9O1xuICAgIH0pO1xufSkoKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ1dvcmtzaGVldFNydicsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIEFQSV9VUkwpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShBUElfVVJMICsgJ3dvcmtzaGVldHMvOmlkJywge30sIHtcblxuICAgICAgICAgICAgdXNlcldvcmtzaGVldHM6IHtcbiAgICAgICAgICAgICAgICB1cmw6IEFQSV9VUkwgKyAndXNlci86dXNlcklkL3dvcmtzaGVldHMnLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY3JlYXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogJ0BkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgaG91cnM6ICdAaG91cnMnLFxuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnQHVzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICBub3RlczogJ0Bub3RlcycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgICAgICBkYXRlOiAnQGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICBob3VyczogJ0Bob3VycycsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6ICdAdXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgICAgIG5vdGVzOiAnQG5vdGVzJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZWxldGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9KTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ21kRGlhbG9nU3J2JywgZnVuY3Rpb24gKCRtZERpYWxvZykge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcm9tVGVtcGxhdGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgZXZlbnQsICRzY29wZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiB0ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBjbGlja091dHNpZGVUb0Nsb3NlOiB0cnVlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zY29wZSA9ICRzY29wZS4kbmV3KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZERpYWxvZy5zaG93KG9wdGlvbnMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkbWREaWFsb2cuaGlkZSgpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY2FuY2VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZERpYWxvZy5jYW5jZWwoKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGFsZXJ0OiBmdW5jdGlvbiAodGl0bGUsIGNvbnRlbnQpe1xuICAgICAgICAgICAgICAgICRtZERpYWxvZy5zaG93KFxuICAgICAgICAgICAgICAgICAgICAkbWREaWFsb2cuYWxlcnQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpdGxlKHRpdGxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRlbnQoY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vaygnT2snKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjb25maXJtOiBmdW5jdGlvbiAoZXZlbnQsIHBhcmFtcywgc3VjY2VzcywgZXJyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbmZpcm0gICAgID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxuICAgICAgICAgICAgICAgICAgICAudGl0bGUocGFyYW1zLnRpdGxlKVxuICAgICAgICAgICAgICAgICAgICAudGV4dENvbnRlbnQocGFyYW1zLnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAuYXJpYUxhYmVsKHBhcmFtcy5hcmlhTGFiZWwpXG4gICAgICAgICAgICAgICAgICAgIC50YXJnZXRFdmVudChldmVudClcbiAgICAgICAgICAgICAgICAgICAgLm9rKHBhcmFtcy5vaylcbiAgICAgICAgICAgICAgICAgICAgLmNhbmNlbChwYXJhbXMuY2FuY2VsKTtcblxuICAgICAgICAgICAgICAgICRtZERpYWxvZy5zaG93KGNvbmZpcm0pLnRoZW4oc3VjY2VzcywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLnNlcnZpY2UoJ21kTWVudVNydicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgb3Blbk1lbnUgOiBmdW5jdGlvbiAoJG1kT3Blbk1lbnUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYXRvckV2ID0gZXZlbnQ7XG4gICAgICAgICAgICAgICAgJG1kT3Blbk1lbnUoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ21kVG9hc3RTcnYnLCBmdW5jdGlvbiAoJG1kVG9hc3QpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBzaG93OiBmdW5jdGlvbiAocGFyYW1zKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kVG9hc3Quc2hvdyhcbiAgICAgICAgICAgICAgICAgICAgJG1kVG9hc3Quc2ltcGxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250ZW50KHBhcmFtcy5jb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvc2l0aW9uKHBhcmFtcy5wb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oaWRlRGVsYXkocGFyYW1zLmRlbGF5KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChwYXJhbXMpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiAkbWRUb2FzdC5zaG93KFxuICAgICAgICAgICAgICAgICAgICAkbWRUb2FzdC5zaW1wbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRlbnQocGFyYW1zLmNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucG9zaXRpb24ocGFyYW1zLnBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW1lKCd3YXJuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oaWRlRGVsYXkocGFyYW1zLmRlbGF5KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG4iXX0=
