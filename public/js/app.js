(function(){
    "use strict";

    var app = angular.module('app', [
        'app.controllers',
        'app.services',
        'app.routes',
        'app.config'
    ]);


    angular.module('app.routes', ['ui.router']);
    angular.module('app.controllers', ['ui.router', 'ngMaterial', 'ngResource']);
    angular.module('app.services', []);
    angular.module('app.config', []);

})();

(function(){
    "use strict";

    angular.module('app.config').config(["$mdIconProvider", function($mdIconProvider) {
        $mdIconProvider.fontSet('md', 'material-icons');
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

                $scope.deletedWorksheetToast();

            }, function (err) {

            });
        }

        $scope.deletedWorksheetToast    = function ()
        {
            var params  = {'content' : 'Worksheet Deleted!', 'position' : 'top right', 'delay' : 3000};
            mdToastSrv.show(params);
        }

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

        });
    }]);

angular.module('app.services')

    .factory('mdDialogSrv', ["$mdDialog", function ($mdDialog) {

        return {
            fromTemplate: function (template, $scope) {

                var options = {
                    templateUrl: './views/dialogs/' + template + '/' + template + '.html'
                };

                if ($scope){
                    options.scope = $scope.$new();
                }

                return $mdDialog.show(options);
            },

            hide: function () {
                return $mdDialog.hide();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldEN0cmwuanMiLCJhcHAvd29ya3NoZWV0cy93b3Jrc2hlZXRTcnYuanMiLCJhcHAvdXNlcnMvdXNlckN0cmwuanMiLCJhcHAvdXNlcnMvdXNlclNydi5qcyIsInNlcnZpY2VzL21lbnUvZGlhbG9nU3J2LmpzIiwic2VydmljZXMvbWVudS9tZW51U3J2LmpzIiwic2VydmljZXMvbWVudS90b2FzdFNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUE7SUFDQSxRQUFBLE9BQUEsbUJBQUEsQ0FBQSxhQUFBLGNBQUE7SUFDQSxRQUFBLE9BQUEsZ0JBQUE7SUFDQSxRQUFBLE9BQUEsY0FBQTs7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLDJCQUFBLFNBQUEsaUJBQUE7UUFDQSxnQkFBQSxRQUFBLE1BQUE7OztLQUdBLFNBQUEsV0FBQTs7O0FDUEEsQ0FBQSxVQUFBO0lBQ0E7O0lBRUEsUUFBQSxPQUFBLGNBQUEsaUVBQUEsVUFBQSxnQkFBQSxvQkFBQSxlQUFBOztRQUVBOzthQUVBLE1BQUEsVUFBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7YUFFQSxNQUFBLFVBQUE7Z0JBQ0EsS0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7O2FBRUEsTUFBQSxTQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzthQUVBLE1BQUEsY0FBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7O1FBR0EsbUJBQUEsVUFBQTs7O0FDNUJBOzs7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LE9BQUE7Ozs7O0FBS0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcbiAgICAgICAgJ2FwcC5jb250cm9sbGVycycsXG4gICAgICAgICdhcHAuc2VydmljZXMnLFxuICAgICAgICAnYXBwLnJvdXRlcycsXG4gICAgICAgICdhcHAuY29uZmlnJ1xuICAgIF0pO1xuXG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnJvdXRlcycsIFsndWkucm91dGVyJ10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnLCBbJ3VpLnJvdXRlcicsICduZ01hdGVyaWFsJywgJ25nUmVzb3VyY2UnXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycsIFtdKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbmZpZycsIFtdKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb25maWcnKS5jb25maWcoZnVuY3Rpb24oJG1kSWNvblByb3ZpZGVyKSB7XG4gICAgICAgICRtZEljb25Qcm92aWRlci5mb250U2V0KCdtZCcsICdtYXRlcmlhbC1pY29ucycpO1xuICAgIH0pXG5cbiAgICAuY29uc3RhbnQoJ0FQSV9VUkwnLCAnYXBpLycpO1xuXG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnKS5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRodHRwUHJvdmlkZXIpIHtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuXG4gICAgICAgICAgICAuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL2F1dGgvYXV0aC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnc2lnbmluJywge1xuICAgICAgICAgICAgICAgIHVybDogJy9zaWduaW4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvYXV0aC9hdXRoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd1c2VycycsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvdXNlcnMvdXNlci5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVXNlckN0cmwnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc2hlZXRzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvd29ya3NoZWV0cy93b3Jrc2hlZXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzaGVldEN0cmwnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgfSk7XG59KSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6QXV0aEN0cmxcbiAqIEBkZXNjcmlwdGlvblxuICogIyBBdXRoQ3RybFxuICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpXG5cbiAgICAuY29udHJvbGxlcignQXV0aEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU3J2KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ0F1dGhDdHJsJyk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdBdXRoU3J2JywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgQVBJX1VSTCkge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKEFQSV9VUkwsIHt9LCB7XG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOldvcmtzaGVldEN0cmxcbiAqIEBkZXNjcmlwdGlvblxuICogIyBXb3Jrc2hlZXRDdHJsXG4gKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICovXG5hbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJylcblxuICAgIC5jb250cm9sbGVyKCdXb3Jrc2hlZXRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgbWRNZW51U3J2LCBtZERpYWxvZ1NydiwgbWRUb2FzdFNydiwgV29ya3NoZWV0U3J2LCBVc2VyU3J2KSB7XG5cbiAgICAgICAgJHNjb3BlLm9wZW5NZW51ID0gZnVuY3Rpb24gKCRtZE9wZW5NZW51LCBldilcbiAgICAgICAge1xuICAgICAgICAgICAgbWRNZW51U3J2Lm9wZW5NZW51KCRtZE9wZW5NZW51LCBldik7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5EZWxldGVXb3Jrc2hlZXREaWFsb2cgICAgPSBmdW5jdGlvbiAoZXZlbnQsIHdvcmtzaGVldClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyAgPSB7XG4gICAgICAgICAgICAgICAgJ3RpdGxlJyAgICAgICAgIDogJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyB3b3Jrc2hlZXQ/JyxcbiAgICAgICAgICAgICAgICAndGV4dENvbnRlbnQnICAgOiAnVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZScsXG4gICAgICAgICAgICAgICAgJ2FyaWFMYWJlbCcgICAgIDogJ2RlbGV0ZVdvcmtzaGVldCcsXG4gICAgICAgICAgICAgICAgJ29rJyAgICAgICAgICAgIDogJ1llcycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbCcgICAgICAgIDogJ0NhbmNlbCcsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtZERpYWxvZ1Nydi5jb25maXJtKGV2ZW50LCBwYXJhbXMsIGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZVdvcmtzaGVldCh3b3Jrc2hlZXQpO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUud29ya3NoZWV0RmlsdGVyID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh3b3Jrc2hlZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCEkc2NvcGUuZmlsdGVycy5zdGFydF9kYXRlIHx8IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKSA+PSAkc2NvcGUuZmlsdGVycy5zdGFydF9kYXRlKVxuICAgICAgICAgICAgICAgICAgICAmJiAoISRzY29wZS5maWx0ZXJzLmVuZF9kYXRlIHx8IG5ldyBEYXRlKHdvcmtzaGVldC5kYXRlKSA8PSAkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zZWxlY3RVc2VyICAgPSBmdW5jdGlvbiAodXNlcilcbiAgICAgICAge1xuICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMgICAgICAgPSBbXTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciAgICAgID0gdXNlcjtcblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2LnVzZXJXb3Jrc2hlZXRzKHsndXNlcklkJyA6IHVzZXIuaWR9LCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMgICA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnNvcnRVc2VycyAgICA9IGZ1bmN0aW9uIChzb3J0LCByZXZlcnNlKVxuICAgICAgICB7XG4gICAgICAgICAgICAkc2NvcGUudXNlclNvcnQgICAgICAgICA9IHNvcnQ7XG4gICAgICAgICAgICAkc2NvcGUudXNlclNvcnRSZXZlcnNlICA9IHJldmVyc2U7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZGVsZXRlV29ya3NoZWV0ICA9IGZ1bmN0aW9uICh3b3Jrc2hlZXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICghd29ya3NoZWV0LmlkKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gd29ya3NoZWV0IHRvIGRlbGV0ZVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV29ya3NoZWV0U3J2LmRlbGV0ZSh7aWQgOiB3b3Jrc2hlZXQuaWR9LCBmdW5jdGlvbiAoc3VjY2Vzcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzaGVldEluZGV4ICA9ICRzY29wZS53b3Jrc2hlZXRzLmluZGV4T2Yod29ya3NoZWV0KTtcblxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc2hlZXRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLndvcmtzaGVldHMuc3BsaWNlKHdvcmtzaGVldEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuZGVsZXRlZFdvcmtzaGVldFRvYXN0KCk7XG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZGVsZXRlZFdvcmtzaGVldFRvYXN0ICAgID0gZnVuY3Rpb24gKClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyAgPSB7J2NvbnRlbnQnIDogJ1dvcmtzaGVldCBEZWxldGVkIScsICdwb3NpdGlvbicgOiAndG9wIHJpZ2h0JywgJ2RlbGF5JyA6IDMwMDB9O1xuICAgICAgICAgICAgbWRUb2FzdFNydi5zaG93KHBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICBVc2VyU3J2LmdldFVzZXJzKHt9LCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcnMgICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGVycm9yIHRyZWF0bWVudFxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuZmlsdGVycyAgPSB7fTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ1dvcmtzaGVldFNydicsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIEFQSV9VUkwpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShBUElfVVJMICsgJ3dvcmtzaGVldHMvOmlkJywge30sIHtcblxuICAgICAgICAgICAgdXNlcldvcmtzaGVldHM6IHtcbiAgICAgICAgICAgICAgICB1cmw6IEFQSV9VUkwgKyAndXNlci86dXNlcklkL3dvcmtzaGVldHMnLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY3JlYXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogJ0BkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgaG91cnM6ICdAaG91cnMnLFxuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnQHVzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICBub3RlczogJ0Bub3RlcycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgICAgICBkYXRlOiAnQGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICBob3VyczogJ0Bob3VycycsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6ICdAdXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgICAgIG5vdGVzOiAnQG5vdGVzJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZWxldGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9KTtcbiAgICB9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6VXNlckN0cmxcbiAqIEBkZXNjcmlwdGlvblxuICogIyBVc2VyQ3RybFxuICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpXG5cbiAgICAuY29udHJvbGxlcignVXNlckN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyU3J2KSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1VzZXJDdHJsJyk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdVc2VyU3J2JywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgQVBJX1VSTCkge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKEFQSV9VUkwgKyAndXNlcnMvOmlkJywge30sIHtcblxuICAgICAgICAgICAgZ2V0VXNlcnM6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9KTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ21kRGlhbG9nU3J2JywgZnVuY3Rpb24gKCRtZERpYWxvZykge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcm9tVGVtcGxhdGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgJHNjb3BlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2RpYWxvZ3MvJyArIHRlbXBsYXRlICsgJy8nICsgdGVtcGxhdGUgKyAnLmh0bWwnXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUpe1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNjb3BlID0gJHNjb3BlLiRuZXcoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kRGlhbG9nLnNob3cob3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZERpYWxvZy5oaWRlKCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhbGVydDogZnVuY3Rpb24gKHRpdGxlLCBjb250ZW50KXtcbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuc2hvdyhcbiAgICAgICAgICAgICAgICAgICAgJG1kRGlhbG9nLmFsZXJ0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aXRsZSh0aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAub2soJ09rJylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY29uZmlybTogZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMsIHN1Y2Nlc3MsIGVycikge1xuICAgICAgICAgICAgICAgIHZhciBjb25maXJtICAgICA9ICRtZERpYWxvZy5jb25maXJtKClcbiAgICAgICAgICAgICAgICAgICAgLnRpdGxlKHBhcmFtcy50aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgLnRleHRDb250ZW50KHBhcmFtcy50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICAgICAgLmFyaWFMYWJlbChwYXJhbXMuYXJpYUxhYmVsKVxuICAgICAgICAgICAgICAgICAgICAudGFyZ2V0RXZlbnQoZXZlbnQpXG4gICAgICAgICAgICAgICAgICAgIC5vayhwYXJhbXMub2spXG4gICAgICAgICAgICAgICAgICAgIC5jYW5jZWwocGFyYW1zLmNhbmNlbCk7XG5cbiAgICAgICAgICAgICAgICAkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKHN1Y2Nlc3MsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5zZXJ2aWNlKCdtZE1lbnVTcnYnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIG9wZW5NZW51IDogZnVuY3Rpb24gKCRtZE9wZW5NZW51LCBldmVudCkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmF0b3JFdiA9IGV2ZW50O1xuICAgICAgICAgICAgICAgICRtZE9wZW5NZW51KGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdtZFRvYXN0U3J2JywgZnVuY3Rpb24gKCRtZFRvYXN0KSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24gKHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtZFRvYXN0LnNob3coXG4gICAgICAgICAgICAgICAgICAgICRtZFRvYXN0LnNpbXBsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udGVudChwYXJhbXMuY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3NpdGlvbihwYXJhbXMucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGlkZURlbGF5KHBhcmFtcy5kZWxheSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAocGFyYW1zKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJG1kVG9hc3Quc2hvdyhcbiAgICAgICAgICAgICAgICAgICAgJG1kVG9hc3Quc2ltcGxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250ZW50KHBhcmFtcy5jb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvc2l0aW9uKHBhcmFtcy5wb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVtZSgnd2FybicpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGlkZURlbGF5KHBhcmFtcy5kZWxheSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuIl19
