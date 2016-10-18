angular.module('app.services')

    .factory('mdToastSrv', function ($mdToast) {

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
    });
