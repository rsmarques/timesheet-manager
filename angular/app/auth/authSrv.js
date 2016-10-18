angular.module('app.services')

    .factory('AuthSrv', function ($resource, API_URL) {
        return $resource(API_URL, {}, {

        });
    });
