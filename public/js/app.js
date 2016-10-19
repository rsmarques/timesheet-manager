(function(){
    "use strict";

    var app = angular.module('app', [
        'app.controllers',
        'app.services',
        'app.routes',
        'app.config'
    ]);


    angular.module('app.routes', ['ui.router']);
    angular.module('app.controllers', ['ui.router', 'ngMaterial', 'ngResource', 'ngMessages']);
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
            })
            .state('signin', {
                url: '/signin',
                templateUrl: './views/app/auth/auth.html',
                controller: 'AuthCtrl',
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
    angular.module('app.controllers').controller('AuthCtrl', ["$scope", "AuthSrv", function ($scope, AuthSrv) {

        console.log('AuthCtrl');
    }]);
})();

angular.module('app.services')

    .factory('AuthSrv', ["$resource", "API_URL", function ($resource, API_URL) {
        return $resource(API_URL, {}, {

        });
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

        $scope.saveUser     = function (user)
        {
            method  = user.id ? 'update' : 'create';

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC91c2Vycy91c2VyQ3RybC5qcyIsImFwcC91c2Vycy91c2VyU3J2LmpzIiwiYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Q3RybC5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldFNydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL2RpYWxvZ1Nydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL21lbnVTcnYuanMiLCJzZXJ2aWNlcy9tYXRlcmlhbC90b2FzdFNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUE7SUFDQSxRQUFBLE9BQUEsbUJBQUEsQ0FBQSxhQUFBLGNBQUEsY0FBQTtJQUNBLFFBQUEsT0FBQSxnQkFBQTtJQUNBLFFBQUEsT0FBQSxjQUFBOzs7O0FDZEEsQ0FBQSxVQUFBO0lBQ0E7O0lBRUEsUUFBQSxPQUFBLGNBQUEsMkJBQUEsU0FBQSxpQkFBQTtRQUNBLGdCQUFBLFFBQUEsTUFBQTs7O0tBR0EsOEJBQUEsU0FBQSxvQkFBQTtRQUNBLG1CQUFBLE1BQUEsYUFBQSxrQkFBQSxRQUFBO1FBQ0EsbUJBQUEsTUFBQSxlQUFBLGtCQUFBLFVBQUE7UUFDQSxtQkFBQSxNQUFBLGVBQUEsa0JBQUEsZUFBQTtRQUNBLG1CQUFBLE1BQUEsYUFBQSxrQkFBQSxRQUFBOzs7S0FHQSxTQUFBLFdBQUE7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLGlFQUFBLFVBQUEsZ0JBQUEsb0JBQUEsZUFBQTs7UUFFQTs7YUFFQSxNQUFBLFVBQUE7Z0JBQ0EsS0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7O2FBRUEsTUFBQSxVQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzthQUVBLE1BQUEsU0FBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7YUFFQSxNQUFBLGNBQUE7Z0JBQ0EsS0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7OztRQUdBLG1CQUFBLFVBQUE7OztBQzVCQSxDQUFBLFVBQUE7SUFDQTs7Ozs7Ozs7SUFRQSxRQUFBLE9BQUEsbUJBQUEsV0FBQSxrQ0FBQSxVQUFBLFFBQUEsU0FBQTs7UUFFQSxRQUFBLElBQUE7Ozs7QUNYQSxRQUFBLE9BQUE7O0tBRUEsUUFBQSxvQ0FBQSxVQUFBLFdBQUEsU0FBQTtRQUNBLE9BQUEsVUFBQSxTQUFBLElBQUE7Ozs7O0FDSEEsQ0FBQSxVQUFBO0lBQ0E7Ozs7Ozs7OztJQVNBLFFBQUEsT0FBQSxtQkFBQSxXQUFBLGtDQUFBLFVBQUEsUUFBQSxTQUFBOztRQUVBLFFBQUEsSUFBQTs7OztBQ1pBLFFBQUEsT0FBQTs7S0FFQSxRQUFBLG9DQUFBLFVBQUEsV0FBQSxTQUFBO1FBQ0EsT0FBQSxVQUFBLFVBQUEsYUFBQSxJQUFBOztZQUVBLFVBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7WUFJQSxLQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxPQUFBO29CQUNBLFVBQUE7b0JBQ0EsWUFBQTtvQkFDQSxXQUFBO29CQUNBLFVBQUE7b0JBQ0EsZUFBQTtvQkFDQSxNQUFBO29CQUNBLGVBQUE7Ozs7WUFJQSxRQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBO29CQUNBLE9BQUE7b0JBQ0EsVUFBQTtvQkFDQSxZQUFBO29CQUNBLFdBQUE7b0JBQ0EsVUFBQTtvQkFDQSxlQUFBO29CQUNBLE1BQUE7b0JBQ0EsZUFBQTs7OztZQUlBLFFBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNB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QUNBLFFBQUEsT0FBQTt5QkFDQSxTQUFBLE9BQUE7eUJBQ0EsTUFBQTt5QkFDQSxVQUFBLE9BQUE7Ozs7O0FBS0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcbiAgICAgICAgJ2FwcC5jb250cm9sbGVycycsXG4gICAgICAgICdhcHAuc2VydmljZXMnLFxuICAgICAgICAnYXBwLnJvdXRlcycsXG4gICAgICAgICdhcHAuY29uZmlnJ1xuICAgIF0pO1xuXG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnJvdXRlcycsIFsndWkucm91dGVyJ10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnLCBbJ3VpLnJvdXRlcicsICduZ01hdGVyaWFsJywgJ25nUmVzb3VyY2UnLCAnbmdNZXNzYWdlcyddKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJywgW10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29uZmlnJywgW10pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbmZpZycpLmNvbmZpZyhmdW5jdGlvbigkbWRJY29uUHJvdmlkZXIpIHtcbiAgICAgICAgJG1kSWNvblByb3ZpZGVyLmZvbnRTZXQoJ21kJywgJ21hdGVyaWFsLWljb25zJyk7XG4gICAgfSlcblxuICAgIC5jb25maWcoZnVuY3Rpb24oJG1kVGhlbWluZ1Byb3ZpZGVyKSB7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGFyay1ncmV5JykuYmFja2dyb3VuZFBhbGV0dGUoJ2dyZXknKS5kYXJrKCk7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGFyay1vcmFuZ2UnKS5iYWNrZ3JvdW5kUGFsZXR0ZSgnb3JhbmdlJykuZGFyaygpO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RhcmstcHVycGxlJykuYmFja2dyb3VuZFBhbGV0dGUoJ2RlZXAtcHVycGxlJykuZGFyaygpO1xuICAgICAgICAkbWRUaGVtaW5nUHJvdmlkZXIudGhlbWUoJ2RhcmstYmx1ZScpLmJhY2tncm91bmRQYWxldHRlKCdibHVlJykuZGFyaygpO1xuICAgIH0pXG5cbiAgICAuY29uc3RhbnQoJ0FQSV9VUkwnLCAnYXBpLycpO1xuXG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnKS5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRodHRwUHJvdmlkZXIpIHtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuXG4gICAgICAgICAgICAuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL2F1dGgvYXV0aC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnc2lnbmluJywge1xuICAgICAgICAgICAgICAgIHVybDogJy9zaWduaW4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvYXV0aC9hdXRoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd1c2VycycsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvdXNlcnMvdXNlci5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVXNlckN0cmwnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc2hlZXRzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvd29ya3NoZWV0cy93b3Jrc2hlZXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzaGVldEN0cmwnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6QXV0aEN0cmxcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiAjIEF1dGhDdHJsXG4gICAgICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAgICAgKi9cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJykuY29udHJvbGxlcignQXV0aEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU3J2KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ0F1dGhDdHJsJyk7XG4gICAgfSk7XG59KSgpO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnQXV0aFNydicsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIEFQSV9VUkwpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShBUElfVVJMLCB7fSwge1xuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOlVzZXJDdHJsXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogIyBVc2VyQ3RybFxuICAgICAqIENvbnRyb2xsZXIgb2YgdGhlIHRpbWVNYW5hZ2VyXG4gICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlclNydikge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2VyQ3RybCcpO1xuICAgIH0pO1xufSkoKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ1VzZXJTcnYnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCArICd1c2Vycy86aWQnLCB7fSwge1xuXG4gICAgICAgICAgICBnZXRVc2Vyczoge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY3JlYXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6ICdAZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogJ0BwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0X25hbWU6ICdAZmlyc3RfbmFtZScsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RfbmFtZTogJ0BsYXN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogJ0B1c2VybmFtZScsXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1hZ2U6ICdAcHJvZmlsZV9pbWFnZScsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdAcm9sZScsXG4gICAgICAgICAgICAgICAgICAgIHdvcmtpbmdfaG91cnM6ICdAd29ya2luZ19ob3VycycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgICAgICBlbWFpbDogJ0BlbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiAnQHBhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RfbmFtZTogJ0BmaXJzdF9uYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgbGFzdF9uYW1lOiAnQGxhc3RfbmFtZScsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiAnQHVzZXJuYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZV9pbWFnZTogJ0Bwcm9maWxlX2ltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ0Byb2xlJyxcbiAgICAgICAgICAgICAgICAgICAgd29ya2luZ19ob3VyczogJ0B3b3JraW5nX2hvdXJzJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZWxldGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6V29ya3NoZWV0Q3RybFxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqICMgV29ya3NoZWV0Q3RybFxuICAgICAqIENvbnRyb2xsZXIgb2YgdGhlIHRpbWVNYW5hZ2VyXG4gICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpLmNvbnRyb2xsZXIoJ1dvcmtzaGVldEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBtZE1lbnVTcnYsIG1kRGlhbG9nU3J2LCBtZFRvYXN0U3J2LCBXb3Jrc2hlZXRTcnYsIFVzZXJTcnYpIHtcblxuICAgICAgICAkc2NvcGUub3Blbk1lbnUgPSBmdW5jdGlvbiAoJG1kT3Blbk1lbnUsIGV2KVxuICAgICAgICB7XG4gICAgICAgICAgICBtZE1lbnVTcnYub3Blbk1lbnUoJG1kT3Blbk1lbnUsIGV2KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlbkRlbGV0ZVdvcmtzaGVldERpYWxvZyAgICA9IGZ1bmN0aW9uIChldmVudCwgd29ya3NoZWV0KVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgcGFyYW1zICA9IHtcbiAgICAgICAgICAgICAgICAndGl0bGUnICAgICAgICAgOiAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIHdvcmtzaGVldD8nLFxuICAgICAgICAgICAgICAgICd0ZXh0Q29udGVudCcgICA6ICdUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lJyxcbiAgICAgICAgICAgICAgICAnYXJpYUxhYmVsJyAgICAgOiAnZGVsZXRlV29ya3NoZWV0JyxcbiAgICAgICAgICAgICAgICAnb2snICAgICAgICAgICAgOiAnWWVzJyxcbiAgICAgICAgICAgICAgICAnY2FuY2VsJyAgICAgICAgOiAnQ2FuY2VsJyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNvbmZpcm0oZXZlbnQsIHBhcmFtcywgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGVsZXRlV29ya3NoZWV0KHdvcmtzaGVldCk7XG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5FZGl0VXNlckRpYWxvZyAgID0gZnVuY3Rpb24gKGV2ZW50KVxuICAgICAgICB7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5mcm9tVGVtcGxhdGUoJy4vdmlld3MvYXBwL2RpYWxvZ3MvZWRpdF91c2VyLmh0bWwnLCBldmVudCwgJHNjb3BlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlbkVkaXRXb3Jrc2hlZXREaWFsb2cgID0gZnVuY3Rpb24gKGV2ZW50LCB3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0ICAgICA9IHdvcmtzaGVldDtcbiAgICAgICAgICAgIC8vIGNyZWF0aW5nIGEgamF2YXNjcmlwdCBkYXRlIGZyb20gc3RyaW5nXG4gICAgICAgICAgICBpZiAod29ya3NoZWV0LmRhdGUpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMgID0gbmV3IERhdGUod29ya3NoZWV0LmRhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5mcm9tVGVtcGxhdGUoJy4vdmlld3MvYXBwL2RpYWxvZ3MvZWRpdF93b3Jrc2hlZXQuaHRtbCcsIGV2ZW50LCAkc2NvcGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIC0tLS1cblxuICAgICAgICAkc2NvcGUud29ya3NoZWV0RmlsdGVyID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh3b3Jrc2hlZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCEkc2NvcGUuZmlsdGVycy5zdGFydF9kYXRlIHx8IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKSA+PSAkc2NvcGUuZmlsdGVycy5zdGFydF9kYXRlKSAmJlxuICAgICAgICAgICAgICAgICAgICAoISRzY29wZS5maWx0ZXJzLmVuZF9kYXRlIHx8IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKSA8PSAkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zZWxlY3RVc2VyICAgPSBmdW5jdGlvbiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMgICAgICAgPSBbXTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciAgICAgID0gdXNlcjtcblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2LnVzZXJXb3Jrc2hlZXRzKHsndXNlcklkJyA6IHVzZXIuaWR9LCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMgICA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zb3J0VXNlcnMgICAgPSBmdW5jdGlvbiAoc29ydCwgcmV2ZXJzZSlcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJTb3J0ICAgICAgICAgPSBzb3J0O1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJTb3J0UmV2ZXJzZSAgPSByZXZlcnNlO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5kZWxldGVXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCF3b3Jrc2hlZXQuaWQpIHtcbiAgICAgICAgICAgICAgICAvLyBubyB3b3Jrc2hlZXQgdG8gZGVsZXRlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBXb3Jrc2hlZXRTcnYuZGVsZXRlKHtpZCA6IHdvcmtzaGVldC5pZH0sIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgd29ya3NoZWV0SW5kZXggID0gJHNjb3BlLndvcmtzaGVldHMuaW5kZXhPZih3b3Jrc2hlZXQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzaGVldEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUud29ya3NoZWV0cy5zcGxpY2Uod29ya3NoZWV0SW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuc2hvdyh7J2NvbnRlbnQnIDogJ1dvcmtzaGVldCBEZWxldGVkIScsICdwb3NpdGlvbicgOiAndG9wIHJpZ2h0JywgJ2RlbGF5JyA6IDMwMDB9KTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2FuY2VsRWRpdFVzZXIgICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNhbmNlbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5maW5pc2hFZGl0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5zYXZlVXNlcih1c2VyKTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmhpZGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2F2ZVVzZXIgICAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZCAgPSB1c2VyLmlkID8gJ3VwZGF0ZScgOiAnY3JlYXRlJztcblxuICAgICAgICAgICAgVXNlclNydlttZXRob2RdKHVzZXIsIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGluc2VydCBpbiBET00gKyB0b2FzdFxuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyB0b2FzdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbEVkaXRXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgbWREaWFsb2dTcnYuY2FuY2VsKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmZpbmlzaEVkaXRXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLnNhdmVXb3Jrc2hlZXQoKTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmhpZGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2F2ZVdvcmtzaGVldCAgICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBtZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5pZCA/ICd1cGRhdGUnIDogJ2NyZWF0ZSc7XG4gICAgICAgICAgICAvLyBwYXJzaW5nIGRhdGUgYW5kIHVzZXJfaWRcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0LnVzZXJfaWQgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC51c2VyX2lkID8gJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQudXNlcl9pZCA6ICRzY29wZS5jdXJyZW50VXNlci5pZDtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0LmRhdGUgICAgPSAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMgPyAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5kYXRlSlMudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApIDogJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQuZGF0ZTtcblxuICAgICAgICAgICAgaWYgKCRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZU5vdGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2W21ldGhvZF0oJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQsIGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc2hlZXQgICA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgIC8vIGluc2VydGluZyB3b3Jrc2hlZXQgaW4gRE9NXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ICAgICAgID0gJHNjb3BlLndvcmtzaGVldHMubWFwKGZ1bmN0aW9uICh3KSB7IHJldHVybiB3LmlkOyB9KS5pbmRleE9mKHdvcmtzaGVldC5pZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdvcmtzaGVldCBub3Qgb24gbGlzdCwgY3JlYXRpbmcgZW50cnlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgICAgPSAoSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3b3Jrc2hlZXQpKSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzLnVuc2hpZnQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIG1kVG9hc3RTcnYuc2hvdyh7J2NvbnRlbnQnIDogJ1N1Y2Nlc3NmdWxseSBDcmVhdGVkIFdvcmtzaGVldCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgbWRUb2FzdFNydi5lcnIoeydjb250ZW50JyA6ICdFcnJvciBFZGl0aW5nIFdvcmtzaGVldCEnLCAncG9zaXRpb24nIDogJ3RvcCByaWdodCcsICdkZWxheScgOiAzMDAwfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZGVsZXRlTm90ZSAgID0gZnVuY3Rpb24gKGluZGV4KVxuICAgICAgICB7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY3JlYXRlTm90ZSAgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCEkc2NvcGUuY3VycmVudFdvcmtzaGVldC5uZXdfbm90ZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoISRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5vdGVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubm90ZXMgICA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3Rlcy5wdXNoKCRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlKTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlICAgID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gLS0tLS0tLS0tLS1cblxuICAgICAgICBVc2VyU3J2LmdldFVzZXJzKHt9LCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcnMgICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGVycm9yIHRyZWF0bWVudFxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuZmlsdGVycyAgPSB7fTtcbiAgICB9KTtcbn0pKCk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnV29ya3NoZWV0U3J2JywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgQVBJX1VSTCkge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKEFQSV9VUkwgKyAnd29ya3NoZWV0cy86aWQnLCB7fSwge1xuXG4gICAgICAgICAgICB1c2VyV29ya3NoZWV0czoge1xuICAgICAgICAgICAgICAgIHVybDogQVBJX1VSTCArICd1c2VyLzp1c2VySWQvd29ya3NoZWV0cycsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGdldDoge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjcmVhdGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgICAgICBkYXRlOiAnQGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICBob3VyczogJ0Bob3VycycsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6ICdAdXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgICAgIG5vdGVzOiAnQG5vdGVzJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6ICdAZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzOiAnQGhvdXJzJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogJ0B1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgbm90ZXM6ICdAbm90ZXMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGRlbGV0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnbWREaWFsb2dTcnYnLCBmdW5jdGlvbiAoJG1kRGlhbG9nKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZyb21UZW1wbGF0ZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBldmVudCwgJHNjb3BlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHRlbXBsYXRlLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrT3V0c2lkZVRvQ2xvc2U6IHRydWVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNjb3BlID0gJHNjb3BlLiRuZXcoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLnNob3cob3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZERpYWxvZy5oaWRlKCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjYW5jZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLmNhbmNlbCgpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYWxlcnQ6IGZ1bmN0aW9uICh0aXRsZSwgY29udGVudCl7XG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZERpYWxvZy5hbGVydCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGl0bGUodGl0bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChjb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9rKCdPaycpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNvbmZpcm06IGZ1bmN0aW9uIChldmVudCwgcGFyYW1zLCBzdWNjZXNzLCBlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlybSAgICAgPSAkbWREaWFsb2cuY29uZmlybSgpXG4gICAgICAgICAgICAgICAgICAgIC50aXRsZShwYXJhbXMudGl0bGUpXG4gICAgICAgICAgICAgICAgICAgIC50ZXh0Q29udGVudChwYXJhbXMudGV4dENvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIC5hcmlhTGFiZWwocGFyYW1zLmFyaWFMYWJlbClcbiAgICAgICAgICAgICAgICAgICAgLnRhcmdldEV2ZW50KGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAub2socGFyYW1zLm9rKVxuICAgICAgICAgICAgICAgICAgICAuY2FuY2VsKHBhcmFtcy5jYW5jZWwpO1xuXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihzdWNjZXNzLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuc2VydmljZSgnbWRNZW51U3J2JywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBvcGVuTWVudSA6IGZ1bmN0aW9uICgkbWRPcGVuTWVudSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hdG9yRXYgPSBldmVudDtcbiAgICAgICAgICAgICAgICAkbWRPcGVuTWVudShldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnbWRUb2FzdFNydicsIGZ1bmN0aW9uICgkbWRUb2FzdCkge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uIChwYXJhbXMpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiAkbWRUb2FzdC5zaG93KFxuICAgICAgICAgICAgICAgICAgICAkbWRUb2FzdC5zaW1wbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRlbnQocGFyYW1zLmNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucG9zaXRpb24ocGFyYW1zLnBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheShwYXJhbXMuZGVsYXkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZFRvYXN0LnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZFRvYXN0LnNpbXBsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChwYXJhbXMuY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3NpdGlvbihwYXJhbXMucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbWUoJ3dhcm4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGVEZWxheShwYXJhbXMuZGVsYXkpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcbiJdfQ==
