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

'use strict';

/**
 * @ngdoc function
 * @name timeManager.controller:WorksheetCtrl
 * @description
 * # WorksheetCtrl
 * Controller of the timeManager
 */
angular.module('app.controllers')

    .controller('WorksheetCtrl', ["$scope", "Worksheet", "User", function ($scope, Worksheet, User) {

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsInJvdXRlcy5qcyIsImFwcC9hdXRoL2F1dGhDdHJsLmpzIiwiYXBwL2F1dGgvYXV0aFNydi5qcyIsImFwcC91c2Vycy91c2VyQ3RybC5qcyIsImFwcC91c2Vycy91c2VyU3J2LmpzIiwiYXBwL3dvcmtzaGVldHMvd29ya3NoZWV0Q3RybC5qcyIsImFwcC93b3Jrc2hlZXRzL3dvcmtzaGVldFNydi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLFVBQUE7SUFDQTs7SUFFQSxJQUFBLE1BQUEsUUFBQSxPQUFBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztJQUlBLFFBQUEsT0FBQSxjQUFBLENBQUE7SUFDQSxRQUFBLE9BQUEsbUJBQUEsQ0FBQSxhQUFBLGNBQUE7SUFDQSxRQUFBLE9BQUEsZ0JBQUE7SUFDQSxRQUFBLE9BQUEsY0FBQTs7OztBQ2RBLENBQUEsVUFBQTtJQUNBOztJQUVBLFFBQUEsT0FBQSxjQUFBLDJCQUFBLFNBQUEsaUJBQUE7UUFDQSxnQkFBQSxRQUFBLE1BQUE7OztLQUdBLFNBQUEsV0FBQTs7O0FDUEEsQ0FBQSxVQUFBO0lBQ0E7O0lBRUEsUUFBQSxPQUFBLGNBQUEsaUVBQUEsVUFBQSxnQkFBQSxvQkFBQSxlQUFBOztRQUVBOzthQUVBLE1BQUEsVUFBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7YUFFQSxNQUFBLFVBQUE7Z0JBQ0EsS0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7O2FBRUEsTUFBQSxTQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzthQUVBLE1BQUEsY0FBQTtnQkFDQSxLQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7O1FBR0EsbUJBQUEsVUFBQTs7O0FDNUJBOzs7Ozs7Ozs7QUFTQSxRQUFBLE9BQUE7O0tBRUEsV0FBQSwrQkFBQSxVQUFBLFFBQUEsTUFBQTs7UUFFQSxRQUFBLElBQUE7OztBQ2JBLFFBQUEsT0FBQTs7S0FFQSxRQUFBLGlDQUFBLFVBQUEsV0FBQSxTQUFBO1FBQ0EsT0FBQSxVQUFBLFNBQUEsSUFBQTs7Ozs7QUNIQTs7Ozs7Ozs7O0FBU0EsUUFBQSxPQUFBOztLQUVBLFdBQUEsK0JBQUEsVUFBQSxRQUFBLE1BQUE7O1FBRUEsUUFBQSxJQUFBOzs7QUNiQSxRQUFBLE9BQUE7O0tBRUEsUUFBQSxpQ0FBQSxVQUFBLFdBQUEsU0FBQTtRQUNBLE9BQUEsVUFBQSxVQUFBLGFBQUEsSUFBQTs7WUFFQSxVQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBOzs7Ozs7O0FDUkE7Ozs7Ozs7OztBQVNBLFFBQUEsT0FBQTs7S0FFQSxXQUFBLGlEQUFBLFVBQUEsUUFBQSxXQUFBLE1BQUE7O1FBRUEsT0FBQSxrQkFBQTtRQUNBO1lBQ0EsT0FBQSxVQUFBLFdBQUE7Z0JBQ0EsT0FBQSxDQUFBLENBQUEsT0FBQSxRQUFBLGNBQUEsSUFBQSxLQUFBLFVBQUEsU0FBQSxPQUFBLFFBQUEsZ0JBQUEsQ0FBQSxPQUFBLFFBQUEsWUFBQSxJQUFBLEtBQUEsVUFBQSxTQUFBLE9BQUEsUUFBQTs7OztRQUlBLE9BQUEsZUFBQSxVQUFBO1FBQ0E7WUFDQSxPQUFBLG1CQUFBO1lBQ0EsT0FBQSxtQkFBQTs7WUFFQSxVQUFBLGVBQUEsQ0FBQSxXQUFBLEtBQUEsS0FBQSxVQUFBLFFBQUE7Z0JBQ0EsT0FBQSxlQUFBLE9BQUE7O2VBRUEsVUFBQSxLQUFBO2dCQUNBLFFBQUEsSUFBQTtnQkFDQSxRQUFBLElBQUE7Ozs7UUFJQSxPQUFBLGVBQUEsVUFBQSxNQUFBO1FBQ0E7WUFDQSxPQUFBLG1CQUFBO1lBQ0EsT0FBQSxtQkFBQTs7OztRQUlBLEtBQUEsU0FBQSxJQUFBLFVBQUEsUUFBQTtZQUNBLE9BQUEsV0FBQSxPQUFBOztXQUVBLFVBQUEsS0FBQTs7OztRQUlBLE9BQUEsV0FBQTs7O0FDaERBLFFBQUEsT0FBQTs7S0FFQSxRQUFBLHNDQUFBLFVBQUEsV0FBQSxTQUFBO1FBQ0EsT0FBQSxVQUFBLFVBQUEsa0JBQUEsSUFBQTs7WUFFQSxnQkFBQTtnQkFDQSxLQUFBLFVBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxRQUFBO29CQUNBLElBQUE7Ozs7WUFJQSxLQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxJQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxNQUFBO29CQUNBLE9BQUE7b0JBQ0EsU0FBQTtvQkFDQSxPQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTtvQkFDQSxNQUFBO29CQUNBLE9BQUE7b0JBQ0EsU0FBQTtvQkFDQSxPQUFBOzs7O1lBSUEsUUFBQTtnQkFDQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsSUFBQTs7Ozs7O0FBTUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcbiAgICAgICAgJ2FwcC5jb250cm9sbGVycycsXG4gICAgICAgICdhcHAuc2VydmljZXMnLFxuICAgICAgICAnYXBwLnJvdXRlcycsXG4gICAgICAgICdhcHAuY29uZmlnJ1xuICAgIF0pO1xuXG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnJvdXRlcycsIFsndWkucm91dGVyJ10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnLCBbJ3VpLnJvdXRlcicsICduZ01hdGVyaWFsJywgJ25nUmVzb3VyY2UnXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycsIFtdKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbmZpZycsIFtdKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb25maWcnKS5jb25maWcoZnVuY3Rpb24oJG1kSWNvblByb3ZpZGVyKSB7XG4gICAgICAgICRtZEljb25Qcm92aWRlci5mb250U2V0KCdtZCcsICdtYXRlcmlhbC1pY29ucycpO1xuICAgIH0pXG5cbiAgICAuY29uc3RhbnQoJ0FQSV9VUkwnLCAnYXBpLycpO1xuXG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnKS5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRodHRwUHJvdmlkZXIpIHtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuXG4gICAgICAgICAgICAuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvYXBwL2F1dGgvYXV0aC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQXV0aEN0cmwnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnc2lnbmluJywge1xuICAgICAgICAgICAgICAgIHVybDogJy9zaWduaW4nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvYXV0aC9hdXRoLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ3RybCcsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd1c2VycycsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvdXNlcnMvdXNlci5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVXNlckN0cmwnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc2hlZXRzJywge1xuICAgICAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9hcHAvd29ya3NoZWV0cy93b3Jrc2hlZXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzaGVldEN0cmwnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgfSk7XG59KSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHRpbWVNYW5hZ2VyLmNvbnRyb2xsZXI6QXV0aEN0cmxcbiAqIEBkZXNjcmlwdGlvblxuICogIyBBdXRoQ3RybFxuICogQ29udHJvbGxlciBvZiB0aGUgdGltZU1hbmFnZXJcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2FwcC5jb250cm9sbGVycycpXG5cbiAgICAuY29udHJvbGxlcignQXV0aEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ0F1dGhDdHJsJyk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdBdXRoJywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgQVBJX1VSTCkge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKEFQSV9VUkwsIHt9LCB7XG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOlVzZXJDdHJsXG4gKiBAZGVzY3JpcHRpb25cbiAqICMgVXNlckN0cmxcbiAqIENvbnRyb2xsZXIgb2YgdGhlIHRpbWVNYW5hZ2VyXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdhcHAuY29udHJvbGxlcnMnKVxuXG4gICAgLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlcikge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2VyQ3RybCcpO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpXG5cbiAgICAuZmFjdG9yeSgnVXNlcicsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIEFQSV9VUkwpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShBUElfVVJMICsgJ3VzZXJzLzppZCcsIHt9LCB7XG5cbiAgICAgICAgICAgIGdldFVzZXJzOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB0aW1lTWFuYWdlci5jb250cm9sbGVyOldvcmtzaGVldEN0cmxcbiAqIEBkZXNjcmlwdGlvblxuICogIyBXb3Jrc2hlZXRDdHJsXG4gKiBDb250cm9sbGVyIG9mIHRoZSB0aW1lTWFuYWdlclxuICovXG5hbmd1bGFyLm1vZHVsZSgnYXBwLmNvbnRyb2xsZXJzJylcblxuICAgIC5jb250cm9sbGVyKCdXb3Jrc2hlZXRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgV29ya3NoZWV0LCBVc2VyKSB7XG5cbiAgICAgICAgJHNjb3BlLndvcmtzaGVldEZpbHRlciA9IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAod29ya3NoZWV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPj0gJHNjb3BlLmZpbHRlcnMuc3RhcnRfZGF0ZSkgJiYgKCEkc2NvcGUuZmlsdGVycy5lbmRfZGF0ZSB8fCBuZXcgRGF0ZSh3b3Jrc2hlZXQuZGF0ZSkgPD0gJHNjb3BlLmZpbHRlcnMuZW5kX2RhdGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc2VsZWN0VXNlciAgID0gZnVuY3Rpb24gKHVzZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgICAgID0gW107XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgICAgICA9IHVzZXI7XG5cbiAgICAgICAgICAgIFdvcmtzaGVldC51c2VyV29ya3NoZWV0cyh7J3VzZXJJZCcgOiB1c2VyLmlkfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICRzY29wZS53b3Jrc2hlZXRzICAgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnInKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuc29ydFVzZXJzICAgID0gZnVuY3Rpb24gKHNvcnQsIHJldmVyc2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgICRzY29wZS51c2VyU29ydCAgICAgICAgID0gc29ydDtcbiAgICAgICAgICAgICRzY29wZS51c2VyU29ydFJldmVyc2UgID0gcmV2ZXJzZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgVXNlci5nZXRVc2Vycyh7fSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJzICAgID0gcmVzdWx0LmRhdGE7XG5cbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgLy8gVE9ETyBlcnJvciB0cmVhdG1lbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmZpbHRlcnMgID0ge307XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnNlcnZpY2VzJylcblxuICAgIC5mYWN0b3J5KCdXb3Jrc2hlZXQnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBBUElfVVJMKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1VSTCArICd3b3Jrc2hlZXRzLzppZCcsIHt9LCB7XG5cbiAgICAgICAgICAgIHVzZXJXb3Jrc2hlZXRzOiB7XG4gICAgICAgICAgICAgICAgdXJsOiBBUElfVVJMICsgJ3VzZXIvOnVzZXJJZC93b3Jrc2hlZXRzJyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6ICdAZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzOiAnQGhvdXJzJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogJ0B1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgbm90ZXM6ICdAbm90ZXMnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogJ0BkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgaG91cnM6ICdAaG91cnMnLFxuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnQHVzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICBub3RlczogJ0Bub3RlcycsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGVsZXRlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG4iXX0=
