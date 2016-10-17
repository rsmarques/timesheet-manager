angular.module('app.services')

    .factory('Auth', function ($resource, API_URL) {
        return $resource(API_URL, {}, {

        });
    });
