<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Weather App</title>
        <meta name="description" content="Single page app that reads current location and displays local weather">
        <meta charset="utf-8">
        <!--Let browser know website is optimized for mobile-->
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!--Import Google Icon Font-->
        <link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link rel='stylesheet prefetch' href="//fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900,900italic&subset=latin,cyrillic">

        <!-- App Icon -->
        <link rel="icon" href="images/logo/logo.png">
        <link rel="apple-touch-icon" href="images/logo/logo.png">

        <!-- gulp build -->
        <link rel="stylesheet" href="{!! asset('css/vendor.css') !!}">
        <link rel="stylesheet" href="{!! asset('css/all.css') !!}">
        <!-- endbuild -->
    </head>
    <body ng-app="app">
        <!--[if lte IE 8]>
        <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->

        <!-- gulp build -->
        <script src="{!! asset('js/vendor.js') !!}"></script>
        <script src="{!! asset('js/app.js') !!}"></script>
        <!-- endbuild -->

        <!-- Add your site or application content here -->
        <div layout="column" layout-fill ui-view></div>
    </body>
</html>
