angular.module('app.services')

    .factory('UserSrv', function ($resource, API_URL) {
        return $resource(API_URL + 'users/:id', {}, {

            getUsers: {
                method: 'GET',
                params: {
                    id: '@id',
                }
            },

        });
    });
