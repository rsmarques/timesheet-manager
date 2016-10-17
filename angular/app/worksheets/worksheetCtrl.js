'use strict';

/**
 * @ngdoc function
 * @name timeManager.controller:WorksheetCtrl
 * @description
 * # WorksheetCtrl
 * Controller of the timeManager
 */
angular.module('app.controllers')

    .controller('WorksheetCtrl', function ($scope, Worksheet) {

        console.log('WorksheetCtrl');
        Worksheet.userWorksheets({'userId' : 7}, function (result) {
            console.log(result);

        }, function (err) {
            console.log(err);
            console.log('err');
        });

    });
