(function(){
    "use strict";

    /**
     * @ngdoc function
     * @name timeManager.controller:WorksheetCtrl
     * @description
     * # WorksheetCtrl
     * Controller of the timeManager
     */
    angular.module('app.controllers').controller('WorksheetCtrl', function ($rootScope, $scope, mdMenuSrv, mdDialogSrv, mdToastSrv, WorksheetSrv, UserSrv) {

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
    });
})();
