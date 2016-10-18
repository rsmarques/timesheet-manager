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

    .controller('AuthCtrl', ["$scope", "Auth", function ($scope, Auth) {

        console.log('AuthCtrl');
    }]);

angular.module('app.services')

    .factory('Auth', ["$resource", "API_URL", function ($resource, API_URL) {
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

    .controller('WorksheetCtrl', ["$scope", "mdMenuService", "Worksheet", "User", function ($scope, mdMenuService, Worksheet, User) {

        $scope.openMenu = function ($mdOpenMenu, ev) {
            mdMenuService.openMenu($mdOpenMenu, ev);
        };

        $scope.worksheetFilter = function ()
        {
            return function (worksheet) {
                return (!$scope.filters.start_date || new Date(worksheet.date) >= $scope.filters.start_date) && (!$scope.filters.end_date || new Date(worksheet.date) <= $scope.filters.end_date);
            };
        };

        $scope.selectUser   = function (user)
        {
            $scope.worksheets       = [];
            $scope.currentUser      = user;

            Worksheet.userWorksheets({'userId' : user.id}, function (result) {
                $scope.worksheets   = result.data;

            }, function (err) {
                console.log('err');
                console.log(err);
            });
        }

        $scope.sortUsers    = function (sort, reverse)
        {
            $scope.userSort         = sort;
            $scope.userSortReverse  = reverse;
        }

        User.getUsers({}, function (result) {
            $scope.users    = result.data;

        }, function (err) {
            // TODO error treatment
        });

        $scope.filters  = {};
    }]);

angular.module('app.services')

    .factory('Worksheet', ["$resource", "API_URL", function ($resource, API_URL) {
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
                method: 'GET',
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

    .controller('UserCtrl', ["$scope", "User", function ($scope, User) {

        console.log('UserCtrl');
    }]);

angular.module('app.services')

    .factory('User', ["$resource", "API_URL", function ($resource, API_URL) {
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

    .service('mdMenuService', function () {
        return {

            openMenu : function ($mdOpenMenu, event) {
                originatorEv = event;
                $mdOpenMenu(event);
            }
        };
    });
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldEN0cmwuanMiLCJhcHAvd29ya3NoZWV0cy93b3Jrc2hlZXRTcnYuanMiLCJhcHAvdXNlcnMvdXNlckN0cmwuanMiLCJhcHAvdXNlcnMvdXNlclNydi5qcyIsInNlcnZpY2VzL21lbnUvbWVudVNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUE7SUFDQSxRQUFBLE9BQUEsbUJBQUEsQ0FBQSxhQUFBLGNBQUE7SUFDQSxRQUFBLE9BQUEsZ0JBQUE7SUFDQSxRQUFBLE9BQUEsY0FBQTs7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLDJCQUFBLFNBQUEsaUJBQUE7UUFDQSxnQkFBQSxRQUFBLE1BQUE7OztLQUdBLFNBQUEsV0FBQTs7O0FDUEEsQ0FBQSxVQUFBO0lBQ0E7O0lBRUEsUUFBQSxPQUFBLGNBQUEsaUVBQUEsVUFBQSxnQkFBQSxvQkFBQSxlQUFBOztRQUVBOzthQUVBLE1BQUEsVUFBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7YUFFQSxNQUFBLFVBQUE7Z0JBQ0EsS0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7O2FBRUEsTUFBQSxTQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzthQUVBLE1BQUEsY0FBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7O1FBR0EsbUJBQUEsVUFBQTs7O0FDNUJBOzs7Ozs7Ozs7QUFTQSxRQUFBLE9BQUE7O0tBRUEsV0FBQSwrQkFBQSxVQUFBLFFBQUEsTUFBQTs7UUFFQSxRQUFBLElBQUE7OztBQ2JBLFFBQUEsT0FBQTs7S0FFQSxRQUFBLGlDQUFBLFVBQUEsV0FBQSxTQUFBO1FBQ0EsT0FBQSxVQUFBLFNBQUEsSUFBQTs7Ozs7QUNIQTs7Ozs7Ozs7O0FBU0EsUUFBQSxPQUFBOztLQUVBLFdBQUEsa0VBQUEsVUFBQSxRQUFBLGVBQUEsV0FBQSxNQUFBOztRQUVBLE9BQUEsV0FBQSxVQUFBLGFBQUEsSUFBQTtZQUNBLGNBQUEsU0FBQSxhQUFBOzs7UUFHQSxPQUFBLGtCQUFBO1FBQ0E7WUFDQSxPQUFBLFVBQUEsV0FBQTtnQkFDQSxPQUFBLENBQUEsQ0FBQSxPQUFBLFFBQUEsY0FBQSxJQUFBLEtBQUEsVUFBQSxTQUFBLE9BQUEsUUFBQSxnQkFBQSxDQUFBLE9BQUEsUUFBQSxZQUFBLElBQUEsS0FBQSxVQUFBLFNBQUEsT0FBQSxRQUFBOzs7O1FBSUEsT0FBQSxlQUFBLFVBQUE7UUFDQTtZQUNBLE9BQUEsbUJBQUE7WUFDQSxPQUFBLG1CQUFBOztZQUVBLFVBQUEsZUFBQSxDQUFBLFdBQUEsS0FBQSxLQUFBLFVBQUEsUUFBQTtnQkFDQSxPQUFBLGVBQUEsT0FBQTs7ZUFFQSxVQUFBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBO2dCQUNBLFFBQUEsSUFBQTs7OztRQUlBLE9BQUEsZUFBQSxVQUFBLE1BQUE7UUFDQTtZQUNBLE9BQUEsbUJBQUE7WUFDQSxPQUFBLG1CQUFBOzs7UUFHQSxLQUFBLFNBQUEsSUFBQSxVQUFBLFFBQUE7WUFDQSxPQUFBLFdBQUEsT0FBQTs7V0FFQSxVQUFBLEtBQUE7Ozs7UUFJQSxPQUFBLFdBQUE7OztBQ25EQSxRQUFBLE9BQUE7O0tBRUEsUUFBQSxzQ0FBQSxVQUFBLFdBQUEsU0FBQTtRQUNBLE9BQUEsVUFBQSxVQUFBLGtCQUFBLElBQUE7O1lBRUEsZ0JBQUE7Z0JBQ0EsS0FBQSxVQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBOzs7O1lBSUEsS0FBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7OztZQUlBLFFBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7b0JBQ0EsTUFBQTtvQkFDQSxPQUFBO29CQUNBLFNBQUE7b0JBQ0EsT0FBQTs7OztZQUlBLFFBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7b0JBQ0EsTUFBQTtvQkFDQSxPQUFBO29CQUNBLFNBQUE7b0JBQ0EsT0FBQTs7OztZQUlBLFFBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7Ozs7QUM3Q0E7Ozs7Ozs7OztBQVNBLFFBQUEsT0FBQTs7S0FFQSxXQUFBLCtCQUFBLFVBQUEsUUFBQSxNQUFBOztRQUVBLFFBQUEsSUFBQTs7O0FDYkEsUUFBQSxPQUFBOztLQUVBLFFBQUEsaUNBQUEsVUFBQSxXQUFBLFNBQUE7UUFDQSxPQUFBLFVBQUEsVUFBQSxhQUFBLElBQUE7O1lBRUEsVUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7Ozs7OztBQ1JBLFFBQUEsT0FBQTs7S0FFQSxRQUFBLGlCQUFBLFlBQUE7UUFDQSxPQUFBOztZQUVBLFdBQUEsVUFBQSxhQUFBLE9BQUE7Z0JBQ0EsZUFBQTtnQkFDQSxZQUFBOzs7T0FHQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuICAgICAgICAnYXBwLmNvbnRyb2xsZXJzJyxcbiAgICAgICAgJ2FwcC5zZXJ2aWNlcycsXG4gICAgICAgICdhcHAucm91dGVzJyxcbiAgICAgICAgJ2FwcC5jb25maWcnXG4gICAgXSk7XG5cblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAucm91dGVzJywgWyd1aS5yb3V0ZXInXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycsIFsndWkucm91dGVyJywgJ25nTWF0ZXJpYWwnLCAnbmdSZXNvdXJjZSddKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJywgW10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29uZmlnJywgW10pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbmZpZycpLmNvbmZpZyhmdW5jdGlvbigkbWRJY29uUHJvdmlkZXIpIHtcbiAgICAgICAgJG1kSWNvblByb3ZpZGVyLmZvbnRTZXQoJ21kJywgJ21hdGVyaWFsLWljb25zJyk7XG4gICAgfSlcblxuICAgIC5jb25zdGFudCgnQVBJX1VSTCcsICdhcGkvJyk7XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnJvdXRlcycpLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGh0dHBQcm92aWRlcikge1xuXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXG5cbiAgICAgICAgICAgIC5zdGF0ZSgnc2lnbnVwJywge1xuICAgICAgICAgICAgICAgIHVybDogJy9zaWdudXAnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvYXV0aC9hdXRoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCdzaWduaW4nLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3NpZ25pbicsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC9hdXRoL2F1dGguaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDdHJsJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ3VzZXJzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy91c2VycycsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC91c2Vycy91c2VyLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyQ3RybCdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzaGVldHMnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2FwcC93b3Jrc2hlZXRzL3dvcmtzaGVldC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NoZWV0Q3RybCdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICB9KTtcbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdGltZU1hbmFnZXIuY29udHJvbGxlcjpBdXRoQ3RybFxuICogQGRlc2NyaXB0aW9uXG4gKiAjIEF1dGhDdHJsXG4gKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICovXG5hbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJylcblxuICAgIC5jb250cm9sbGVyKCdBdXRoQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGgpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnQXV0aEN0cmwnKTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ0F1dGgnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCwge30sIHtcblxuICAgICAgICB9KTtcbiAgICB9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6V29ya3NoZWV0Q3RybFxuICogQGRlc2NyaXB0aW9uXG4gKiAjIFdvcmtzaGVldEN0cmxcbiAqIENvbnRyb2xsZXIgb2YgdGhlIHRpbWVNYW5hZ2VyXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnKVxuXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzaGVldEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBtZE1lbnVTZXJ2aWNlLCBXb3Jrc2hlZXQsIFVzZXIpIHtcblxuICAgICAgICAkc2NvcGUub3Blbk1lbnUgPSBmdW5jdGlvbiAoJG1kT3Blbk1lbnUsIGV2KSB7XG4gICAgICAgICAgICBtZE1lbnVTZXJ2aWNlLm9wZW5NZW51KCRtZE9wZW5NZW51LCBldik7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLndvcmtzaGVldEZpbHRlciA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAod29ya3NoZWV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPj0gJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSkgJiYgKCEkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPD0gJHNjb3BlLmZpbHRlcnMuZW5kX2RhdGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2VsZWN0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgICAgID0gW107XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgICAgICA9IHVzZXI7XG5cbiAgICAgICAgICAgIFdvcmtzaGVldC51c2VyV29ya3NoZWV0cyh7J3VzZXJJZCcgOiB1c2VyLmlkfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnInKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc29ydFVzZXJzICAgID0gZnVuY3Rpb24gKHNvcnQsIHJldmVyc2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS51c2VyU29ydCAgICAgICAgID0gc29ydDtcbiAgICAgICAgICAgICRzY29wZS51c2VyU29ydFJldmVyc2UgID0gcmV2ZXJzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIFVzZXIuZ2V0VXNlcnMoe30sIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICRzY29wZS51c2VycyAgICA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gZXJyb3IgdHJlYXRtZW50XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5maWx0ZXJzICA9IHt9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnV29ya3NoZWV0JywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgQVBJX1VSTCkge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKEFQSV9VUkwgKyAnd29ya3NoZWV0cy86aWQnLCB7fSwge1xuXG4gICAgICAgICAgICB1c2VyV29ya3NoZWV0czoge1xuICAgICAgICAgICAgICAgIHVybDogQVBJX1VSTCArICd1c2VyLzp1c2VySWQvd29ya3NoZWV0cycsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGdldDoge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBjcmVhdGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgICAgICBkYXRlOiAnQGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICBob3VyczogJ0Bob3VycycsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6ICdAdXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgICAgIG5vdGVzOiAnQG5vdGVzJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6ICdAZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzOiAnQGhvdXJzJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogJ0B1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgbm90ZXM6ICdAbm90ZXMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGRlbGV0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdGltZU1hbmFnZXIuY29udHJvbGxlcjpVc2VyQ3RybFxuICogQGRlc2NyaXB0aW9uXG4gKiAjIFVzZXJDdHJsXG4gKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICovXG5hbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJylcblxuICAgIC5jb250cm9sbGVyKCdVc2VyQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFVzZXIpIHtcblxuICAgICAgICBjb25zb2xlLmxvZygnVXNlckN0cmwnKTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnKVxuXG4gICAgLmZhY3RvcnkoJ1VzZXInLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCArICd1c2Vycy86aWQnLCB7fSwge1xuXG4gICAgICAgICAgICBnZXRVc2Vyczoge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuc2VydmljZSgnbWRNZW51U2VydmljZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgb3Blbk1lbnUgOiBmdW5jdGlvbiAoJG1kT3Blbk1lbnUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYXRvckV2ID0gZXZlbnQ7XG4gICAgICAgICAgICAgICAgJG1kT3Blbk1lbnUoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pOyJdfQ==
