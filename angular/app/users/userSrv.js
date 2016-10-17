angular.module('app.services')

    .factory('User', function ($resource, API_URL) {
        return $resource(API_URL, {}, {
            userWorksheets: {
                url: API_URL + 'user/:userId/worksheets',
                method: 'GET',
                params: {
                    id: '@id',
                }
            },

        });
    });
