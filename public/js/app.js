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
'use strict';

/**
 * @ngdoc function
 * @name timeManager.controller:AuthCtrl
 * @description
 * # AuthCtrl
 * Controller of the timeManager
 */
angular.module('app.controllers')

    .controller('AuthCtrl', ["$scope", "AuthSrv", function ($scope, AuthSrv) {

        console.log('AuthCtrl');
    }]);

angular.module('app.services')

    .factory('AuthSrv', ["$resource", "API_URL", function ($resource, API_URL) {
        return $resource(API_URL, {}, {

        });
    }]);

'use strict';

/**
 * @ngdoc function
 * @name timeManager.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the timeManager
 */
angular.module('app.controllers')

    .controller('UserCtrl', ["$scope", "UserSrv", function ($scope, UserSrv) {

        console.log('UserCtrl');
    }]);

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

'use strict';

/**
 * @ngdoc function
 * @name timeManager.controller:WorksheetCtrl
 * @description
 * # WorksheetCtrl
 * Controller of the timeManager
 */
angular.module('app.controllers')

    .controller('WorksheetCtrl', ["$scope", "mdMenuSrv", "mdDialogSrv", "mdToastSrv", "WorksheetSrv", "UserSrv", function ($scope, mdMenuSrv, mdDialogSrv, mdToastSrv, WorksheetSrv, UserSrv) {

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

            })
        }

        $scope.openEditUserDialog   = function (event)
        {
            mdDialogSrv.fromTemplate('./views/app/dialogs/edit_user.html', event, $scope);
        }

        $scope.openEditWorksheetDialog  = function (event, worksheet)
        {
            $scope.currentWorksheet     = worksheet;
            // creating a javascript date from string
            if (worksheet.date) {
                $scope.currentWorksheet.dateJS  = new Date(worksheet.date);
            }

            mdDialogSrv.fromTemplate('./views/app/dialogs/edit_worksheet.html', event, $scope);
        }

        // ----

        $scope.worksheetFilter = function ()
        {
            return function (worksheet) {
                return (!$scope.filters.start_date || new Date(worksheet.date) >= $scope.filters.start_date)
                    && (!$scope.filters.end_date || new Date(worksheet.date) <= $scope.filters.end_date);
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
        }

        $scope.sortUsers    = function (sort, reverse)
        {
            $scope.userSort         = sort;
            $scope.userSortReverse  = reverse;
        }

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
        }

        $scope.cancelEditUser   = function ()
        {
            mdDialogSrv.cancel();
        }

        $scope.finishEditUser   = function (user)
        {
            $scope.saveUser(user);
            mdDialogSrv.hide();
        }

        $scope.saveUser     = function (user)
        {
            method  = user.id ? 'update' : 'create';
            console.log(method);

            UserSrv[method](user, function (result) {

                console.log('result');
                console.log(result);

            }, function (err) {
                console.log('err');
                console.log(err);
            });
        }

        $scope.cancelEditWorksheet  = function ()
        {
            mdDialogSrv.cancel();
        }

        $scope.finishEditWorksheet  = function (worksheet)
        {
            $scope.saveWorksheet(worksheet);
            mdDialogSrv.hide();
        }

        $scope.saveWorksheet    = function (worksheet)
        {
            method              = worksheet.id ? 'update' : 'create';
            // parsing date and user_id
            worksheet.user_id   = worksheet.user_id ? worksheet.user_id : $scope.currentUser.id;
            worksheet.date      = worksheet.dateJS ? worksheet.dateJS.toISOString().substring(0, 10) : worksheet.date;

            WorksheetSrv[method](worksheet, function (result) {

                var newWorksheet    = result.data;
                // inserting worksheet in DOM
                var index           = $scope.worksheets.map(function (w) { return w.id; }).indexOf(newWorksheet.id);

                if (index === -1) {
                    // event not on list, creating entry
                    var data        = (JSON.parse(JSON.stringify(newWorksheet)));
                    $scope.worksheets.unshift(data);
                    mdToastSrv.show({'content' : 'Successfully Created Worksheet!', 'position' : 'top right', 'delay' : 3000});
                }

            }, function (err) {
                mdToastSrv.err({'content' : 'Error Editing Worksheet!', 'position' : 'top right', 'delay' : 3000});
            });
        }

        $scope.deleteNote   = function (index)
        {
            $scope.currentWorksheet.notes.splice(index, 1);

            return true;
        }

        $scope.createNote   = function ()
        {
            console.log($scope.currentWorksheet);
            if (!$scope.currentWorksheet.new_note) return false;

            if (!$scope.currentWorksheet.notes) {
                $scope.currentWorksheet.notes   = [];
            }

            $scope.currentWorksheet.notes.push($scope.currentWorksheet.new_note);
            $scope.currentWorksheet.new_note    = null;

            return true;
        }


        // -----------

        UserSrv.getUsers({}, function (result) {
            $scope.users    = result.data;

        }, function (err) {
            // TODO error treatment
        });

        $scope.filters  = {};
    }]);

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC91c2Vycy91c2VyQ3RybC5qcyIsImFwcC91c2Vycy91c2VyU3J2LmpzIiwiYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Q3RybC5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldFNydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL2RpYWxvZ1Nydi5qcyIsInNlcnZpY2VzL21hdGVyaWFsL21lbnVTcnYuanMiLCJzZXJ2aWNlcy9tYXRlcmlhbC90b2FzdFNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUE7SUFDQSxRQUFBLE9BQUEsbUJBQUEsQ0FBQSxhQUFBLGNBQUEsY0FBQTtJQUNBLFFBQUEsT0FBQSxnQkFBQTtJQUNBLFFBQUEsT0FBQSxjQUFBOzs7O0FDZEEsQ0FBQSxVQUFBO0lBQ0E7O0lBRUEsUUFBQSxPQUFBLGNBQUEsMkJBQUEsU0FBQSxpQkFBQTtRQUNBLGdCQUFBLFFBQUEsTUFBQTs7O0tBR0EsOEJBQUEsU0FBQSxvQkFBQTtRQUNBLG1CQUFBLE1BQUEsYUFBQSxrQkFBQSxRQUFBO1FBQ0EsbUJBQUEsTUFBQSxlQUFBLGtCQUFBLFVBQUE7UUFDQSxtQkFBQSxNQUFBLGVBQUEsa0JBQUEsZUFBQTtRQUNBLG1CQUFBLE1BQUEsYUFBQSxrQkFBQSxRQUFBOzs7S0FHQSxTQUFBLFdBQUE7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLGlFQUFBLFVBQUEsZ0JBQUEsb0JBQUEsZUFBQTs7UUFFQTs7YUFFQSxNQUFBLFVBQUE7Z0JBQ0EsS0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7O2FBRUEs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QTt5QkFDQSxNQUFBO3lCQUNBLFVBQUEsT0FBQTs7Ozs7QUFLQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuICAgICAgICAnYXBwLmNvbnRyb2xsZXJzJyxcbiAgICAgICAgJ2FwcC5zZXJ2aWNlcycsXG4gICAgICAgICdhcHAucm91dGVzJyxcbiAgICAgICAgJ2FwcC5jb25maWcnXG4gICAgXSk7XG5cblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAucm91dGVzJywgWyd1aS5yb3V0ZXInXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycsIFsndWkucm91dGVyJywgJ25nTWF0ZXJpYWwnLCAnbmdSZXNvdXJjZScsICduZ01lc3NhZ2VzJ10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnLCBbXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb25maWcnLCBbXSk7XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29uZmlnJykuY29uZmlnKGZ1bmN0aW9uKCRtZEljb25Qcm92aWRlcikge1xuICAgICAgICAkbWRJY29uUHJvdmlkZXIuZm9udFNldCgnbWQnLCAnbWF0ZXJpYWwtaWNvbnMnKTtcbiAgICB9KVxuXG4gICAgLmNvbmZpZyhmdW5jdGlvbigkbWRUaGVtaW5nUHJvdmlkZXIpIHtcbiAgICAgICAgJG1kVGhlbWluZ1Byb3ZpZGVyLnRoZW1lKCdkYXJrLWdyZXknKS5iYWNrZ3JvdW5kUGFsZXR0ZSgnZ3JleScpLmRhcmsoKTtcbiAgICAgICAgJG1kVGhlbWluZ1Byb3ZpZGVyLnRoZW1lKCdkYXJrLW9yYW5nZScpLmJhY2tncm91bmRQYWxldHRlKCdvcmFuZ2UnKS5kYXJrKCk7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGFyay1wdXJwbGUnKS5iYWNrZ3JvdW5kUGFsZXR0ZSgnZGVlcC1wdXJwbGUnKS5kYXJrKCk7XG4gICAgICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGFyay1ibHVlJykuYmFja2dyb3VuZFBhbGV0dGUoJ2JsdWUnKS5kYXJrKCk7XG4gICAgfSlcblxuICAgIC5jb25zdGFudCgnQVBJX1VSTCcsICdhcGkvJyk7XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnJvdXRlcycpLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGh0dHBQcm92aWRlcikge1xuXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXG5cbiAgICAgICAgICAgIC5zdGF0ZSgnc2lnbnVwJywge1xuICAgICAgICAgICAgICAgIHVybDogJy9zaWdudXAnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvYXV0aC9hdXRoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCdzaWduaW4nLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3NpZ25pbicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC9hdXRoL2F1dGguaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ3VzZXJzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy91c2VycycsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC91c2Vycy91c2VyLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyQ3RybCdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzaGVldHMnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC93b3Jrc2hlZXRzL3dvcmtzaGVldC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NoZWV0Q3RybCdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICB9KTtcbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdGltZU1hbmFnZXIuY29udHJvbGxlcjpBdXRoQ3RybFxuICogQGRlc2NyaXB0aW9uXG4gKiAjIEF1dGhDdHJsXG4gKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICovXG5hbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJylcblxuICAgIC5jb250cm9sbGVyKCdBdXRoQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTcnYpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnQXV0aEN0cmwnKTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ0F1dGhTcnYnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCwge30sIHtcblxuICAgICAgICB9KTtcbiAgICB9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6VXNlckN0cmxcbiAqIEBkZXNjcmlwdGlvblxuICogIyBVc2VyQ3RybFxuICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpXG5cbiAgICAuY29udHJvbGxlcignVXNlckN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyU3J2KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1VzZXJDdHJsJyk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdVc2VyU3J2JywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgQVBJX1VSTCkge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKEFQSV9VUkwgKyAndXNlcnMvOmlkJywge30sIHtcblxuICAgICAgICAgICAgZ2V0VXNlcnM6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiAnQGVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6ICdAcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBmaXJzdF9uYW1lOiAnQGZpcnN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICBsYXN0X25hbWU6ICdAbGFzdF9uYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6ICdAdXNlcm5hbWUnLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlX2ltYWdlOiAnQHByb2ZpbGVfaW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICByb2xlOiAnQHJvbGUnLFxuICAgICAgICAgICAgICAgICAgICB3b3JraW5nX2hvdXJzOiAnQHdvcmtpbmdfaG91cnMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6ICdAZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogJ0BwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0X25hbWU6ICdAZmlyc3RfbmFtZScsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RfbmFtZTogJ0BsYXN0X25hbWUnLFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogJ0B1c2VybmFtZScsXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1hZ2U6ICdAcHJvZmlsZV9pbWFnZScsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdAcm9sZScsXG4gICAgICAgICAgICAgICAgICAgIHdvcmtpbmdfaG91cnM6ICdAd29ya2luZ19ob3VycycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdGltZU1hbmFnZXIuY29udHJvbGxlcjpXb3Jrc2hlZXRDdHJsXG4gKiBAZGVzY3JpcHRpb25cbiAqICMgV29ya3NoZWV0Q3RybFxuICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpXG5cbiAgICAuY29udHJvbGxlcignV29ya3NoZWV0Q3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIG1kTWVudVNydiwgbWREaWFsb2dTcnYsIG1kVG9hc3RTcnYsIFdvcmtzaGVldFNydiwgVXNlclNydikge1xuXG4gICAgICAgICRzY29wZS5vcGVuTWVudSA9IGZ1bmN0aW9uICgkbWRPcGVuTWVudSwgZXYpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kTWVudVNydi5vcGVuTWVudSgkbWRPcGVuTWVudSwgZXYpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vcGVuRGVsZXRlV29ya3NoZWV0RGlhbG9nICAgID0gZnVuY3Rpb24gKGV2ZW50LCB3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgID0ge1xuICAgICAgICAgICAgICAgICd0aXRsZScgICAgICAgICA6ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgd29ya3NoZWV0PycsXG4gICAgICAgICAgICAgICAgJ3RleHRDb250ZW50JyAgIDogJ1RoaXMgYWN0aW9uIGNhbm5vdCBiZSB1bmRvbmUnLFxuICAgICAgICAgICAgICAgICdhcmlhTGFiZWwnICAgICA6ICdkZWxldGVXb3Jrc2hlZXQnLFxuICAgICAgICAgICAgICAgICdvaycgICAgICAgICAgICA6ICdZZXMnLFxuICAgICAgICAgICAgICAgICdjYW5jZWwnICAgICAgICA6ICdDYW5jZWwnLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbWREaWFsb2dTcnYuY29uZmlybShldmVudCwgcGFyYW1zLCBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5kZWxldGVXb3Jrc2hlZXQod29ya3NoZWV0KTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm9wZW5FZGl0VXNlckRpYWxvZyAgID0gZnVuY3Rpb24gKGV2ZW50KVxuICAgICAgICB7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5mcm9tVGVtcGxhdGUoJy4vdmlld3MvYXBwL2RpYWxvZ3MvZWRpdF91c2VyLmh0bWwnLCBldmVudCwgJHNjb3BlKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5vcGVuRWRpdFdvcmtzaGVldERpYWxvZyAgPSBmdW5jdGlvbiAoZXZlbnQsIHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQgICAgID0gd29ya3NoZWV0O1xuICAgICAgICAgICAgLy8gY3JlYXRpbmcgYSBqYXZhc2NyaXB0IGRhdGUgZnJvbSBzdHJpbmdcbiAgICAgICAgICAgIGlmICh3b3Jrc2hlZXQuZGF0ZSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0LmRhdGVKUyAgPSBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmZyb21UZW1wbGF0ZSgnLi92aWV3cy9hcHAvZGlhbG9ncy9lZGl0X3dvcmtzaGVldC5odG1sJywgZXZlbnQsICRzY29wZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAtLS0tXG5cbiAgICAgICAgJHNjb3BlLndvcmtzaGVldEZpbHRlciA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAod29ya3NoZWV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPj0gJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgJiYgKCEkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPD0gJHNjb3BlLmZpbHRlcnMuZW5kX2RhdGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2VsZWN0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgICAgID0gW107XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgICAgICA9IHVzZXI7XG5cbiAgICAgICAgICAgIFdvcmtzaGVldFNydi51c2VyV29ya3NoZWV0cyh7J3VzZXJJZCcgOiB1c2VyLmlkfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5zb3J0VXNlcnMgICAgPSBmdW5jdGlvbiAoc29ydCwgcmV2ZXJzZSlcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJTb3J0ICAgICAgICAgPSBzb3J0O1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJTb3J0UmV2ZXJzZSAgPSByZXZlcnNlO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmRlbGV0ZVdvcmtzaGVldCAgPSBmdW5jdGlvbiAod29ya3NoZWV0KVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoIXdvcmtzaGVldC5pZCkge1xuICAgICAgICAgICAgICAgIC8vIG5vIHdvcmtzaGVldCB0byBkZWxldGVcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFdvcmtzaGVldFNydi5kZWxldGUoe2lkIDogd29ya3NoZWV0LmlkfSwgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcblxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc2hlZXRJbmRleCAgPSAkc2NvcGUud29ya3NoZWV0cy5pbmRleE9mKHdvcmtzaGVldCk7XG5cbiAgICAgICAgICAgICAgICBpZiAod29ya3NoZWV0SW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzLnNwbGljZSh3b3Jrc2hlZXRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbWRUb2FzdFNydi5zaG93KHsnY29udGVudCcgOiAnV29ya3NoZWV0IERlbGV0ZWQhJywgJ3Bvc2l0aW9uJyA6ICd0b3AgcmlnaHQnLCAnZGVsYXknIDogMzAwMH0pO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbEVkaXRVc2VyICAgPSBmdW5jdGlvbiAoKVxuICAgICAgICB7XG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5jYW5jZWwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5maW5pc2hFZGl0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS5zYXZlVXNlcih1c2VyKTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5zYXZlVXNlciAgICAgPSBmdW5jdGlvbiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kICA9IHVzZXIuaWQgPyAndXBkYXRlJyA6ICdjcmVhdGUnO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobWV0aG9kKTtcblxuICAgICAgICAgICAgVXNlclNydlttZXRob2RdKHVzZXIsIGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2VycicpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5jYW5jZWxFZGl0V29ya3NoZWV0ICA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmNhbmNlbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmZpbmlzaEVkaXRXb3Jrc2hlZXQgID0gZnVuY3Rpb24gKHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLnNhdmVXb3Jrc2hlZXQod29ya3NoZWV0KTtcbiAgICAgICAgICAgIG1kRGlhbG9nU3J2LmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5zYXZlV29ya3NoZWV0ICAgID0gZnVuY3Rpb24gKHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kICAgICAgICAgICAgICA9IHdvcmtzaGVldC5pZCA/ICd1cGRhdGUnIDogJ2NyZWF0ZSc7XG4gICAgICAgICAgICAvLyBwYXJzaW5nIGRhdGUgYW5kIHVzZXJfaWRcbiAgICAgICAgICAgIHdvcmtzaGVldC51c2VyX2lkICAgPSB3b3Jrc2hlZXQudXNlcl9pZCA/IHdvcmtzaGVldC51c2VyX2lkIDogJHNjb3BlLmN1cnJlbnRVc2VyLmlkO1xuICAgICAgICAgICAgd29ya3NoZWV0LmRhdGUgICAgICA9IHdvcmtzaGVldC5kYXRlSlMgPyB3b3Jrc2hlZXQuZGF0ZUpTLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKSA6IHdvcmtzaGVldC5kYXRlO1xuXG4gICAgICAgICAgICBXb3Jrc2hlZXRTcnZbbWV0aG9kXSh3b3Jrc2hlZXQsIGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBuZXdXb3Jrc2hlZXQgICAgPSByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICAvLyBpbnNlcnRpbmcgd29ya3NoZWV0IGluIERPTVxuICAgICAgICAgICAgICAgIHZhciBpbmRleCAgICAgICAgICAgPSAkc2NvcGUud29ya3NoZWV0cy5tYXAoZnVuY3Rpb24gKHcpIHsgcmV0dXJuIHcuaWQ7IH0pLmluZGV4T2YobmV3V29ya3NoZWV0LmlkKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlbnQgbm90IG9uIGxpc3QsIGNyZWF0aW5nIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhICAgICAgICA9IChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG5ld1dvcmtzaGVldCkpKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMudW5zaGlmdChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgbWRUb2FzdFNydi5zaG93KHsnY29udGVudCcgOiAnU3VjY2Vzc2Z1bGx5IENyZWF0ZWQgV29ya3NoZWV0IScsICdwb3NpdGlvbicgOiAndG9wIHJpZ2h0JywgJ2RlbGF5JyA6IDMwMDB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBtZFRvYXN0U3J2LmVycih7J2NvbnRlbnQnIDogJ0Vycm9yIEVkaXRpbmcgV29ya3NoZWV0IScsICdwb3NpdGlvbicgOiAndG9wIHJpZ2h0JywgJ2RlbGF5JyA6IDMwMDB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmRlbGV0ZU5vdGUgICA9IGZ1bmN0aW9uIChpbmRleClcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubm90ZXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuY3JlYXRlTm90ZSAgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQpO1xuICAgICAgICAgICAgaWYgKCEkc2NvcGUuY3VycmVudFdvcmtzaGVldC5uZXdfbm90ZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoISRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5vdGVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRXb3Jrc2hlZXQubm90ZXMgICA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFdvcmtzaGVldC5ub3Rlcy5wdXNoKCRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlKTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50V29ya3NoZWV0Lm5ld19ub3RlICAgID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tXG5cbiAgICAgICAgVXNlclNydi5nZXRVc2Vycyh7fSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJzICAgID0gcmVzdWx0LmRhdGE7XG5cbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgLy8gVE9ETyBlcnJvciB0cmVhdG1lbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmZpbHRlcnMgID0ge307XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdXb3Jrc2hlZXRTcnYnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCArICd3b3Jrc2hlZXRzLzppZCcsIHt9LCB7XG5cbiAgICAgICAgICAgIHVzZXJXb3Jrc2hlZXRzOiB7XG4gICAgICAgICAgICAgICAgdXJsOiBBUElfVVJMICsgJ3VzZXIvOnVzZXJJZC93b3Jrc2hlZXRzJyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6ICdAZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzOiAnQGhvdXJzJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogJ0B1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgbm90ZXM6ICdAbm90ZXMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogJ0BkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgaG91cnM6ICdAaG91cnMnLFxuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnQHVzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICBub3RlczogJ0Bub3RlcycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdtZERpYWxvZ1NydicsIGZ1bmN0aW9uICgkbWREaWFsb2cpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnJvbVRlbXBsYXRlOiBmdW5jdGlvbiAodGVtcGxhdGUsIGV2ZW50LCAkc2NvcGUpIHtcblxuICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogdGVtcGxhdGUsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tPdXRzaWRlVG9DbG9zZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2NvcGUgPSAkc2NvcGUuJG5ldygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiAkbWREaWFsb2cuc2hvdyhvcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLmhpZGUoKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNhbmNlbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkbWREaWFsb2cuY2FuY2VsKCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhbGVydDogZnVuY3Rpb24gKHRpdGxlLCBjb250ZW50KXtcbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgICAgICAgICAgICAgJG1kRGlhbG9nLmFsZXJ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aXRsZSh0aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAub2soJ09rJylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY29uZmlybTogZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMsIHN1Y2Nlc3MsIGVycikge1xuICAgICAgICAgICAgICAgIHZhciBjb25maXJtICAgICA9ICRtZERpYWxvZy5jb25maXJtKClcbiAgICAgICAgICAgICAgICAgICAgLnRpdGxlKHBhcmFtcy50aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgLnRleHRDb250ZW50KHBhcmFtcy50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICAgICAgLmFyaWFMYWJlbChwYXJhbXMuYXJpYUxhYmVsKVxuICAgICAgICAgICAgICAgICAgICAudGFyZ2V0RXZlbnQoZXZlbnQpXG4gICAgICAgICAgICAgICAgICAgIC5vayhwYXJhbXMub2spXG4gICAgICAgICAgICAgICAgICAgIC5jYW5jZWwocGFyYW1zLmNhbmNlbCk7XG5cbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKHN1Y2Nlc3MsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5zZXJ2aWNlKCdtZE1lbnVTcnYnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIG9wZW5NZW51IDogZnVuY3Rpb24gKCRtZE9wZW5NZW51LCBldmVudCkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmF0b3JFdiA9IGV2ZW50O1xuICAgICAgICAgICAgICAgICRtZE9wZW5NZW51KGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdtZFRvYXN0U3J2JywgZnVuY3Rpb24gKCRtZFRvYXN0KSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24gKHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZFRvYXN0LnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZFRvYXN0LnNpbXBsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChwYXJhbXMuY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3NpdGlvbihwYXJhbXMucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGlkZURlbGF5KHBhcmFtcy5kZWxheSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAocGFyYW1zKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kVG9hc3Quc2hvdyhcbiAgICAgICAgICAgICAgICAgICAgJG1kVG9hc3Quc2ltcGxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250ZW50KHBhcmFtcy5jb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvc2l0aW9uKHBhcmFtcy5wb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVtZSgnd2FybicpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGlkZURlbGF5KHBhcmFtcy5kZWxheSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuIl19
