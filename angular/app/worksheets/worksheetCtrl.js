'use strict';

/**
 * @ngdoc function
 * @name timeManager.controller:WorksheetCtrl
 * @description
 * # WorksheetCtrl
 * Controller of the timeManager
 */
angular.module('app.controllers')

    .controller('WorksheetCtrl', function ($scope, Worksheet, User) {

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
    });
