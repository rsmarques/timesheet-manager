(function(){
    "use strict";

    angular.module('app.config').config(function($mdIconProvider) {
        $mdIconProvider.fontSet('md', 'material-icons');
    })

    .constant('API_URL', 'api/');

})();