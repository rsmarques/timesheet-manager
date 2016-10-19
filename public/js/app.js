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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC91c2Vycy91c2VyQ3RybC5qcyIsImFwcC91c2Vycy91c2VyU3J2LmpzIiwic2VydmljZXMvbWF0ZXJpYWwvZGlhbG9nU3J2LmpzIiwic2VydmljZXMvbWF0ZXJpYWwvbWVudVNydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL3RvYXN0U3J2LmpzIiwiYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Q3RybC5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldFNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUEsYUFBQTtJQUNBLFFBQUEsT0FBQSxtQkFBQSxDQUFBLGFBQUEsY0FBQSxjQUFBLGNBQUE7SUFDQSxRQUFBLE9BQUEsZ0JBQUE7SUFDQSxRQUFBLE9BQUEsY0FBQTs7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLDJCQUFBLFNBQUEsaUJBQUE7UUFDQSxnQkFBQSxRQUFBLE1BQUE7OztLQUdBLDhCQUFBLFNBQUEsb0JBQUE7UUFDQSxtQkFBQSxNQUFBLGFBQUEsa0JBQUEsUUFBQTtRQUNBLG1CQUFBLE1BQUEsZUFBQSxrQkFBQSxVQUFBO1FBQ0EsbUJBQUEsTUFBQSxlQUFBLGtCQUFBLGVBQUE7UUFDQSxtQkFBQSxNQUFBLGFBQUEsa0JBQUEsUUFBQTs7O0tBR0EsU0FBQSxXQUFBOzs7QUNkQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxRQUFBLE9BQUEsY0FBQSxpRUFBQSxVQUFBLGdCQUFBLG9CQUFBLGVBQUE7O1FBRUE7O2FBRUEsTUFBQSxVQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZ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LFNBQUEsT0FBQTtnQkFDQSxNQUFBLEtBQUEsVUFBQSxnQkFBQSxNQUFBLFFBQUEsU0FBQSxNQUFBOztZQUVBLFFBQUEsVUFBQSxNQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLEtBQUEsVUFBQSxnQkFBQSxNQUFBLFFBQUEsU0FBQSxNQUFBOztZQUVBLFFBQUEsVUFBQSxTQUFBO2dCQUNBLGNBQUE7Z0JBQ0EsT0FBQSxjQUFBO2dCQUNBOztZQUVBLGdCQUFBLFlBQUE7Z0JBQ0EsT0FBQTs7OztBQzdDQSxDQUFBLFVBQUE7SUFDQTs7Ozs7Ozs7O0lBU0EsUUFBQSxPQUFBLG1CQUFBLFdBQUEsK0RBQUEsVUFBQSxZQUFBLFFBQUEsYUFBQSxTQUFBOztRQUVBLE9BQUEsZUFBQTtRQUNBO1lBQ0EsUUFBQSxHQUFBLElBQUEsVUFBQSxRQUFBOztnQkFFQSxXQUFBLE9BQUEsT0FBQTtlQUNBLFVBQUEsS0FBQTs7Ozs7UUFLQSxPQUFBLHlCQUFBLFVBQUE7UUFDQTtZQUNBLE9BQUEsZ0JBQUEsV0FBQTtZQUNBLFlBQUEsYUFBQSxzQ0FBQSxPQUFBOzs7UUFHQSxPQUFBOzs7O0FDNUJBLFFBQUEsT0FBQTs7S0FFQSxRQUFBLG9DQUFBLFVBQUEsV0FBQSxTQUFBO1FBQ0EsT0FBQSxVQUFBLFVBQUEsYUFBQSxJQUFBOztZQUVBLElBQUE7Z0JBQ0EsS0FBQSxVQUFBO2dCQUNBLFFBQUE7OztZQUdBLFVBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7WUFJQSxLQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxPQUFBO29CQUNBLFVBQUE7b0JBQ0EsWUFBQTtvQkFDQSxXQUFBO29CQUNBLFVBQUE7b0JBQ0EsZUFBQTtvQkFDQSxNQUFBO29CQUNBLGVBQUE7Ozs7WUFJQSxRQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBO29CQUNBLE9BQUE7b0JBQ0EsVUFBQTtvQkFD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IiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXG4gICAgICAgICdhcHAuY29udHJvbGxlcnMnLFxuICAgICAgICAnYXBwLnNlcnZpY2VzJyxcbiAgICAgICAgJ2FwcC5yb3V0ZXMnLFxuICAgICAgICAnYXBwLmNvbmZpZydcbiAgICBdKTtcblxuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnLCBbJ3VpLnJvdXRlcicsICduZ1N0b3JhZ2UnXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycsIFsndWkucm91dGVyJywgJ25nTWF0ZXJpYWwnLCAnbmdSZXNvdXJjZScsICduZ01lc3NhZ2VzJywgJ25nU3RvcmFnZSddKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJywgW10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29uZmlnJywgW10pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbmZpZycpLmNvbmZpZyhmdW5jdGlvbigkbWRJY29uUHJvdmlkZXIpIHtcbiAgICAgICAgJG1kSWNvblByb3ZpZGVyLmZvbnRTZXQoJ21kJywgJ21hdGVyaWFsLWljb25zJyk7XG4gICAgfSlcblxuICAgIC5jb25maWcoZnVuY3Rpb24oJG1kVGhlbWluZ1Byb3ZpZGVyKSB7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGFyay1ncmV5JykuYmFja2dyb3VuZFBhbGV0dGUoJ2dyZXknKS5kYXJrKCk7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGFyay1vcmFuZ2UnKS5iYWNrZ3JvdW5kUGFsZXR0ZSgnb3JhbmdlJykuZGFyaygpO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RhcmstcHVycGxlJykuYmFja2dyb3VuZFBhbGV0dGUoJ2RlZXAtcHVycGxlJykuZGFyaygpO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RhcmstYmx1ZScpLmJhY2tncm91bmRQYWxldHRlKCdibHVlJykuZGFyaygpO1xuICAgIH0pXG5cbiAgICAuY29uc3RhbnQoJ0FQSV9VUkwnLCAnYXBpLycpO1xuXG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnKS5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRodHRwUHJvdmlkZXIpIHtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuXG4gICAgICAgICAgICAuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL2F1dGgvYXV0aC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwnLFxuICAgICAgICAgICAgICAgIHJlZ2lzdGVyOiAxLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnc2lnbmluJywge1xuICAgICAgICAgICAgICAgIHVybDogJy9zaWduaW4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvYXV0aC9hdXRoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXG4gICAgICAgICAgICAgICAgcmVnaXN0ZXI6IDAsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCdsb2dvdXQnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL2xvZ291dCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC9hdXRoL2F1dGguaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsJyxcbiAgICAgICAgICAgICAgICBsb2dvdXQ6IDEsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd1c2VycycsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvdXNlcnMvdXNlci5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVXNlckN0cmwnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc2hlZXRzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvd29ya3NoZWV0cy93b3Jrc2hlZXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzaGVldEN0cmwnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbJyRxJywgJyRsb2NhdGlvbicsICckbG9jYWxTdG9yYWdlJywgZnVuY3Rpb24gKCRxLCAkbG9jYXRpb24sICRsb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ3JlcXVlc3QnOiBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG4gICAgICAgICAgICAgICAgICAgIGlmICgkbG9jYWxTdG9yYWdlLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuaGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0JlYXJlciAnICsgJGxvY2FsU3RvcmFnZS50b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ3Jlc3BvbnNlRXJyb3InOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAwIHx8IHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxIHx8IHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3NpZ25pbicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbiAgICB9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdGltZU1hbmFnZXIuY29udHJvbGxlcjpBdXRoQ3RybFxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqICMgQXV0aEN0cmxcbiAgICAgKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnKS5jb250cm9sbGVyKCdBdXRoQ3RybCcsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUsICRzdGF0ZSwgJGxvY2F0aW9uLCAkbG9jYWxTdG9yYWdlLCBBdXRoU3J2KSB7XG5cbiAgICAgICAgZnVuY3Rpb24gc3VjY2Vzc0F1dGggKHJlcykge1xuICAgICAgICAgICAgJGxvY2FsU3RvcmFnZS50b2tlbiA9IHJlcy50b2tlbjtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiAgICAgPSBcIiMvXCI7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUucGVyZm9ybUxvZ2luID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5yZWdpc3Rlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuc2lnbnVwKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuc2lnbmluKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnBlcmZvcm1Mb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBBdXRoU3J2LmxvZ291dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gXCIjL3NpZ25pblwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNpZ25pbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmb3JtRGF0YSAgICAgICAgPSAkc2NvcGUuY3JlZGVudGlhbHM7XG4gICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gbnVsbDtcblxuICAgICAgICAgICAgQXV0aFNydi5zaWduaW4oZm9ybURhdGEsIHN1Y2Nlc3NBdXRoLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmF1dGhFcnJvciA9ICdJbnZhbGlkIGVtYWlsL3Bhc3N3b3JkLic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGZvcm1EYXRhICAgICAgICA9ICRzY29wZS5jcmVkZW50aWFscztcbiAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgICAgPSBudWxsO1xuXG4gICAgICAgICAgICBBdXRoU3J2LnNpZ251cChmb3JtRGF0YSwgc3VjY2Vzc0F1dGgsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9ycyAmJiBlcnIuZXJyb3JzWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgICAgPSBlcnIuZXJyb3JzWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRoRXJyb3IgICAgPSAnRmFpbGVkIHRvIHNpZ251cCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVkZWZpbmluZyBwYWdlIHN0YXR1cyBmb3IgbG9naW4vbG9nb3V0L3JlZ2lzdGVyXG4gICAgICAgICRzY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9nb3V0ICAgICAgID0gJHN0YXRlLmN1cnJlbnQubG9nb3V0O1xuICAgICAgICAgICAgaWYgKCRzY29wZS5sb2dvdXQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVyZm9ybUxvZ291dCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUucmVnaXN0ZXIgICAgID0gJHN0YXRlLmN1cnJlbnQucmVnaXN0ZXI7XG4gICAgICAgICAgICAkc2NvcGUubG9naW5UZXh0ICAgID0gJHNjb3BlLnJlZ2lzdGVyID8gJ1JlZ2lzdGVyJyA6ICdMb2dpbic7XG4gICAgICAgICAgICAkc2NvcGUuYXV0aEVycm9yICAgID0gbnVsbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLnRva2VuICAgICAgICAgICAgPSAkbG9jYWxTdG9yYWdlLnRva2VuO1xuICAgICAgICAkc2NvcGUudG9rZW5DbGFpbXMgICAgICA9IEF1dGhTcnYuZ2V0VG9rZW5DbGFpbXMoKTtcbiAgICAgICAgJHNjb3BlLmNyZWRlbnRpYWxzICAgICAgPSB7fTtcblxuICAgIH0pO1xufSkoKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ0F1dGhTcnYnLCBmdW5jdGlvbiAoJGh0dHAsIEFQSV9VUkwsICRsb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgZnVuY3Rpb24gdXJsQmFzZTY0RGVjb2RlKHN0cikge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IHN0ci5yZXBsYWNlKCctJywgJysnKS5yZXBsYWNlKCdfJywgJy8nKTtcbiAgICAgICAgICAgIHN3aXRjaCAob3V0cHV0Lmxlbmd0aCAlIDQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICc9PSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICc9JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYmFzZTY0dXJsIHN0cmluZyEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5hdG9iKG91dHB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRDbGFpbXNGcm9tVG9rZW4oKSB7XG4gICAgICAgICAgICB2YXIgdG9rZW4gPSAkbG9jYWxTdG9yYWdlLnRva2VuO1xuICAgICAgICAgICAgdmFyIHVzZXIgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVuY29kZWQgPSB0b2tlbi5zcGxpdCgnLicpWzFdO1xuICAgICAgICAgICAgICAgIHVzZXIgPSBKU09OLnBhcnNlKHVybEJhc2U2NERlY29kZShlbmNvZGVkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0b2tlbkNsYWltcyA9IGdldENsYWltc0Zyb21Ub2tlbigpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzaWdudXA6IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICAgICAgICAgICRodHRwLnBvc3QoQVBJX1VSTCArICd1c2Vycy9zaWdudXAnLCBkYXRhKS5zdWNjZXNzKHN1Y2Nlc3MpLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaWduaW46IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICAgICAgICAgICRodHRwLnBvc3QoQVBJX1VSTCArICd1c2Vycy9zaWduaW4nLCBkYXRhKS5zdWNjZXNzKHN1Y2Nlc3MpLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2dvdXQ6IGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5DbGFpbXMgPSB7fTtcbiAgICAgICAgICAgICAgICBkZWxldGUgJGxvY2FsU3RvcmFnZS50b2tlbjtcbiAgICAgICAgICAgICAgICBzdWNjZXNzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0VG9rZW5DbGFpbXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW5DbGFpbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOlVzZXJDdHJsXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogIyBVc2VyQ3RybFxuICAgICAqIENvbnRyb2xsZXIgb2YgdGhlIHRpbWVNYW5hZ2VyXG4gICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgbWREaWFsb2dTcnYsIFVzZXJTcnYpIHtcblxuICAgICAgICAkc2NvcGUuZ2V0UHJvZmlsZSAgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgVXNlclNydi5tZSh7fSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIC8vIHN0b3JpbmcgaW4gcm9vdFNjb3BlIHRvIHNoYXJlIHdpdGggb3RoZXIgY29udHJvbGxlcnNcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLm1lICAgPSByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5FZGl0UHJvZmlsZURpYWxvZyAgPSBmdW5jdGlvbiAoZXZlbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciAgID0gJHJvb3RTY29wZS5tZTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmZyb21UZW1wbGF0ZSgnLi92aWV3cy9hcHAvZGlhbG9ncy9lZGl0X3VzZXIuaHRtbCcsIGV2ZW50LCAkc2NvcGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5nZXRQcm9maWxlKCk7XG4gICAgfSk7XG59KSgpO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnVXNlclNydicsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIEFQSV9VUkwpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShBUElfVVJMICsgJ3VzZXJzLzppZCcsIHt9LCB7XG5cbiAgICAgICAgICAgIG1lOiB7XG4gICAgICAgICAgICAgICAgdXJsOiBBUElfVVJMICsgJ21lJyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0VXNlcnM6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiAnQGVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6ICdAcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBmaXJzdF9uYW1lOiAnQGZpcnN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICBsYXN0X25hbWU6ICdAbGFzdF9uYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6ICdAdXNlcm5hbWUnLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlX2ltYWdlOiAnQHByb2ZpbGVfaW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICByb2xlOiAnQHJvbGUnLFxuICAgICAgICAgICAgICAgICAgICB3b3JraW5nX2hvdXJzOiAnQHdvcmtpbmdfaG91cnMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6ICdAZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogJ0BwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0X25hbWU6ICdAZmlyc3RfbmFtZScsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RfbmFtZTogJ0BsYXN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogJ0B1c2VybmFtZScsXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1hZ2U6ICdAcHJvZmlsZV9pbWFnZScsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdAcm9sZScsXG4gICAgICAgICAgICAgICAgICAgIHdvcmtpbmdfaG91cnM6ICdAd29ya2luZ19ob3VycycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnbWREaWFsb2dTcnYnLCBmdW5jdGlvbiAoJG1kRGlhbG9nKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZyb21UZW1wbGF0ZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBldmVudCwgJHNjb3BlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHRlbXBsYXRlLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNjb3BlID0gJHNjb3BlLiRuZXcoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLnNob3cob3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZERpYWxvZy5oaWRlKCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjYW5jZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLmNhbmNlbCgpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYWxlcnQ6IGZ1bmN0aW9uICh0aXRsZSwgY29udGVudCl7XG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZERpYWxvZy5hbGVydCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGl0bGUodGl0bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChjb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9rKCdPaycpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNvbmZpcm06IGZ1bmN0aW9uIChldmVudCwgcGFyYW1zLCBzdWNjZXNzLCBlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlybSAgICAgPSAkbWREaWFsb2cuY29uZmlybSgpXG4gICAgICAgICAgICAgICAgICAgIC50aXRsZShwYXJhbXMudGl0bGUpXG4gICAgICAgICAgICAgICAgICAgIC50ZXh0Q29udGVudChwYXJhbXMudGV4dENvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIC5hcmlhTGFiZWwocGFyYW1zLmFyaWFMYWJlbClcbiAgICAgICAgICAgICAgICAgICAgLnRhcmdldEV2ZW50KGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAub2socGFyYW1zLm9rKVxuICAgICAgICAgICAgICAgICAgICAuY2FuY2VsKHBhcmFtcy5jYW5jZWwpO1xuXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihzdWNjZXNzLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuc2VydmljZSgnbWRNZW51U3J2JywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBvcGVuTWVudSA6IGZ1bmN0aW9uICgkbWRPcGVuTWVudSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hdG9yRXYgPSBldmVudDtcbiAgICAgICAgICAgICAgICAkbWRPcGVuTWVudShldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnbWRUb2FzdFNydicsIGZ1bmN0aW9uICgkbWRUb2FzdCkge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uIChwYXJhbXMpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiAkbWRUb2FzdC5zaG93KFxuICAgICAgICAgICAgICAgICAgICAkbWRUb2FzdC5zaW1wbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRlbnQocGFyYW1zLmNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucG9zaXRpb24ocGFyYW1zLnBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheShwYXJhbXMuZGVsYXkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZFRvYXN0LnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZFRvYXN0LnNpbXBsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChwYXJhbXMuY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3NpdGlvbihwYXJhbXMucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbWUoJ3dhcm4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheShwYXJhbXMuZGVsYXkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcbiIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdGltZU1hbmFnZXIuY29udHJvbGxlcjpXb3Jrc2hlZXRDdHJsXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogIyBXb3Jrc2hlZXRDdHJsXG4gICAgICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAgICAgKi9cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJykuY29udHJvbGxlcignV29ya3NoZWV0Q3RybCcsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUsIG1kTWVudVNydiwgbWREaWFsb2dTcnYsIG1kVG9hc3RTcnYsIFdvcmtzaGVldFNydiwgVXNlclNydikge1xuXG4gICAgICAgICRzY29wZS5vcGVuTWVudSA9IGZ1bmN0aW9uICgkbWRPcGVuTWVudSwgZXYpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kTWVudVNydi5vcGVuTWVudSgkbWRPcGVuTWVudSwgZXYpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vcGVuRGVsZXRlV29ya3NoZWV0RGlhbG9nICAgID0gZnVuY3Rpb24gKGV2ZW50LCB3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgID0ge1xuICAgICAgICAgICAgICAgICd0aXRsZScgICAgICAgICA6ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgd29ya3NoZWV0PycsXG4gICAgICAgICAgICAgICAgJ3RleHRDb250ZW50JyAgIDogJ1RoaXMgYWN0aW9uIGNhbm5vdCBiZSB1bmRvbmUnLFxuICAgICAgICAgICAgICAgICdhcmlhTGFiZWwnICAgICA6ICdkZWxldGVXb3Jrc2hlZXQnLFxuICAgICAgICAgICAgICAgICdvaycgICAgICAgICAgICA6ICdZZXMnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnICAgICAgICA6ICdDYW5jZWwnLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbWREaWFsb2dTcnYuY29uZmlybShldmVudCwgcGFyYW1zLCBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5kZWxldGVXb3Jrc2hlZXQod29ya3NoZWV0KTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlbkRlbGV0ZVVzZXJEaWFsb2cgICAgPSBmdW5jdGlvbiAoZXZlbnQsIHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgID0ge1xuICAgICAgICAgICAgICAgICd0aXRsZScgICAgICAgICA6ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgdXNlcj8nLFxuICAgICAgICAgICAgICAgICd0ZXh0Q29udGVudCcgICA6ICdUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lJyxcbiAgICAgICAgICAgICAgICAnYXJpYUxhYmVsJyAgICAgOiAnZGVsZXRlVXNlcicsXG4gICAgICAgICAgICAgICAgJ29rJyAgICAgICAgICAgIDogJ1llcycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcgICAgICAgIDogJ0NhbmNlbCcsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5jb25maXJtKGV2ZW50LCBwYXJhbXMsIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZVVzZXIodXNlcik7XG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5FZGl0VXNlckRpYWxvZyAgID0gZnVuY3Rpb24gKGV2ZW50KVxuICAgICAgICB7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5mcm9tVGVtcGxhdGUoJy4vdmlld3MvYXBwL2RpYWxvZ3MvZWRpdF91c2VyLmh0bWwnLCBldmVudCwgJHNjb3BlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlbkVkaXRXb3Jrc2hlZXREaWFsb2cgID0gZnVuY3Rpb24gKGV2ZW50LCB3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5jYW5FZGl0V29ya3NoZWV0KHdvcmtzaGVldCk7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldCAgICAgPSB3b3Jrc2hlZXQ7XG4gICAgICAgICAgICAvLyBjcmVhdGluZyBhIGphdmFzY3JpcHQgZGF0ZSBmcm9tIHN0cmluZ1xuICAgICAgICAgICAgaWYgKHdvcmtzaGVldC5kYXRlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZUpTICA9IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWREaWFsb2dTcnYuZnJvbVRlbXBsYXRlKCcuL3ZpZXdzL2FwcC9kaWFsb2dzL2VkaXRfd29ya3NoZWV0Lmh0bWwnLCBldmVudCwgJHNjb3BlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyAtLS0tXG5cbiAgICAgICAgJHNjb3BlLndvcmtzaGVldEZpbHRlciA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAod29ya3NoZWV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPj0gJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgKCEkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPD0gJHNjb3BlLmZpbHRlcnMuZW5kX2RhdGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2VsZWN0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgICAgID0gW107XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgICAgICA9IHVzZXI7XG5cbiAgICAgICAgICAgIFdvcmtzaGVldFNydi51c2VyV29ya3NoZWV0cyh7J3VzZXJJZCcgOiB1c2VyLmlkfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc29ydFVzZXJzICAgID0gZnVuY3Rpb24gKHNvcnQsIHJldmVyc2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS51c2VyU29ydCAgICAgICAgID0gc29ydDtcbiAgICAgICAgICAgICRzY29wZS51c2VyU29ydFJldmVyc2UgID0gcmV2ZXJzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGVsZXRlV29ya3NoZWV0ICA9IGZ1bmN0aW9uICh3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICghd29ya3NoZWV0LmlkKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gd29ya3NoZWV0IHRvIGRlbGV0ZVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2LmRlbGV0ZSh7aWQgOiB3b3Jrc2hlZXQuaWR9LCBmdW5jdGlvbiAoc3VjY2Vzcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzaGVldEluZGV4ICA9ICRzY29wZS53b3Jrc2hlZXRzLmluZGV4T2Yod29ya3NoZWV0KTtcblxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc2hlZXRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMuc3BsaWNlKHdvcmtzaGVldEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtZFRvYXN0U3J2LnNob3coeydjb250ZW50JyA6ICdXb3Jrc2hlZXQgRGVsZXRlZCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmRlbGV0ZVVzZXIgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICghdXNlci5pZCkge1xuICAgICAgICAgICAgICAgIC8vIG5vIHVzZXIgdG8gZGVsZXRlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBVc2VyU3J2LmRlbGV0ZSh7aWQgOiB1c2VyLmlkfSwgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcblxuICAgICAgICAgICAgICAgIHZhciB1c2VySW5kZXggICAgICAgPSAkc2NvcGUudXNlcnMuaW5kZXhPZih1c2VyKTtcbiAgICAgICAgICAgICAgICAvLyBkZWxldGluZyB1c2VyIGZyb20gRE9NXG4gICAgICAgICAgICAgICAgaWYgKHVzZXJJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJzLnNwbGljZSh1c2VySW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh1c2VyLmlkID09ICRzY29wZS5tZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBsb2dnZWQgdXNlciB3YXMgZGVsZXRlZCwgbG9nZ2luZyBvdXRcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gXCIjL2xvZ291dFwiO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuc2hvdyh7J2NvbnRlbnQnIDogJ1VzZXIgRGVsZXRlZCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbEVkaXRVc2VyICAgPSBmdW5jdGlvbiAoKVxuICAgICAgICB7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5jYW5jZWwoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZmluaXNoRWRpdFVzZXIgICA9IGZ1bmN0aW9uICh1c2VyKVxuICAgICAgICB7XG4gICAgICAgICAgICAkc2NvcGUuc2F2ZVVzZXIodXNlcik7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5oaWRlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNhdmVVc2VyID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBtZXRob2QgID0gdXNlci5pZCA/ICd1cGRhdGUnIDogJ2NyZWF0ZSc7XG5cbiAgICAgICAgICAgIFVzZXJTcnZbbWV0aG9kXSh1c2VyLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBpbnNlcnQgaW4gRE9NICsgdG9hc3RcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gdG9hc3RcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWxFZGl0V29ya3NoZWV0ICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNhbmNlbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5maW5pc2hFZGl0V29ya3NoZWV0ICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5zYXZlV29ya3NoZWV0KCk7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5oaWRlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNhdmVXb3Jrc2hlZXQgICAgPSBmdW5jdGlvbiAoKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgbWV0aG9kICAgICAgICAgICAgICAgICAgICAgID0gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuaWQgPyAndXBkYXRlJyA6ICdjcmVhdGUnO1xuICAgICAgICAgICAgLy8gcGFyc2luZyBkYXRlIGFuZCB1c2VyX2lkXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC51c2VyX2lkID0gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQudXNlcl9pZCA/ICRzY29wZS5jdXJyZW50V29ya3NoZWV0LnVzZXJfaWQgOiAkc2NvcGUuY3VycmVudFVzZXIuaWQ7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlICAgID0gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZUpTID8gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZUpTLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKSA6ICRzY29wZS5jdXJyZW50V29ya3NoZWV0LmRhdGU7XG5cbiAgICAgICAgICAgIGlmICgkc2NvcGUuY3VycmVudFdvcmtzaGVldC5uZXdfbm90ZSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVOb3RlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFdvcmtzaGVldFNydlttZXRob2RdKCRzY29wZS5jdXJyZW50V29ya3NoZWV0LCBmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgd29ya3NoZWV0ICAgPSByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICAvLyBpbnNlcnRpbmcgd29ya3NoZWV0IGluIERPTVxuICAgICAgICAgICAgICAgIHZhciBpbmRleCAgICAgICA9ICRzY29wZS53b3Jrc2hlZXRzLm1hcChmdW5jdGlvbiAodykgeyByZXR1cm4gdy5pZDsgfSkuaW5kZXhPZih3b3Jrc2hlZXQuaWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3b3Jrc2hlZXQgbm90IG9uIGxpc3QsIGNyZWF0aW5nIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhICAgID0gKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod29ya3NoZWV0KSkpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUud29ya3NoZWV0cy51bnNoaWZ0KGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBtZFRvYXN0U3J2LnNob3coeydjb250ZW50JyA6ICdTdWNjZXNzZnVsbHkgQ3JlYXRlZCBXb3Jrc2hlZXQhJywgJ3Bvc2l0aW9uJyA6ICd0b3AgcmlnaHQnLCAnZGVsYXknIDogMzAwMH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuZXJyb3Ioeydjb250ZW50JyA6ICdFcnJvciBFZGl0aW5nIFdvcmtzaGVldCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGVsZXRlTm90ZSAgID0gZnVuY3Rpb24gKGluZGV4KVxuICAgICAgICB7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY3JlYXRlTm90ZSAgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCEkc2NvcGUuY3VycmVudFdvcmtzaGVldC5uZXdfbm90ZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoISRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5vdGVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubm90ZXMgICA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3Rlcy5wdXNoKCRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlKTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlICAgID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbkVkaXRXb3Jrc2hlZXQgPSBmdW5jdGlvbiAod29ya3NoZWV0KVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyB1c2VyIGNhbiBlZGl0IHdvcmtzaGVldCBpZiBpdCdzIGFuIGFkbWluIG9yIG93bnMgdGhlIHdvcmtzaGVldFxuICAgICAgICAgICAgcmV0dXJuICgkcm9vdFNjb3BlLm1lLnJvbGUgPT09ICdBZG1pbicgfHwgd29ya3NoZWV0LnVzZXJfaWQgPT0gJHJvb3RTY29wZS5tZS5pZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmhhc0FkbWluQWNjZXNzID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gdXNlciBjYW4gZWRpdCB3b3Jrc2hlZXQgaWYgaXQncyBhbiBhZG1pbiBvciBvd25zIHRoZSB3b3Jrc2hlZXRcbiAgICAgICAgICAgIHJldHVybiAoJHJvb3RTY29wZS5tZS5yb2xlID09PSAnQWRtaW4nIHx8ICRyb290U2NvcGUubWUucm9sZSA9PT0gJ01hbmFnZXInKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZ2V0VXNlcnMgICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFVzZXJTcnYuZ2V0VXNlcnMoe30sIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudXNlcnMgICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gZXJyb3IgdHJlYXRtZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyAtLS0tLS0tLS0tLVxuXG4gICAgICAgICRzY29wZS5nZXRVc2VycygpO1xuICAgICAgICAkc2NvcGUuZmlsdGVycyAgPSB7fTtcbiAgICB9KTtcbn0pKCk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdXb3Jrc2hlZXRTcnYnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCArICd3b3Jrc2hlZXRzLzppZCcsIHt9LCB7XG5cbiAgICAgICAgICAgIHVzZXJXb3Jrc2hlZXRzOiB7XG4gICAgICAgICAgICAgICAgdXJsOiBBUElfVVJMICsgJ3VzZXIvOnVzZXJJZC93b3Jrc2hlZXRzJyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6ICdAZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzOiAnQGhvdXJzJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogJ0B1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgbm90ZXM6ICdAbm90ZXMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogJ0BkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgaG91cnM6ICdAaG91cnMnLFxuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnQHVzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICBub3RlczogJ0Bub3RlcycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG4iXX0=
