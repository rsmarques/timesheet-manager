<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

// API endpoints
Route::group(array('prefix' => 'api'), function () {


    Route::get('/', function () {
        return array("welcome to the Time Manager API");
    });

    // authentication endpoints
    Route::post('/users/signin', 'UserController@signIn');
    Route::post('/users/signup', 'UserController@signUp');

    // Private endpoints, require authentication
    Route::group(array('middleware' => ['jwt.auth']), function () {

        // user REST endpoints
        Route::get('/me', 'UserController@me');
        Route::post('users', 'UserController@createUser'); // create user
        Route::get('users/{id}', 'UserController@getUser'); // get user
        Route::put('users/{id}', 'UserController@updateUser'); // update user
        Route::delete('users/{id}', 'UserController@deleteUser'); // delete user

        // worksheets REST endpoints
        Route::get('user/{id}/worksheets', 'WorksheetController@userWorksheets');
        Route::post('worksheets', 'WorksheetController@createWorksheet'); // create worksheet
        Route::get('worksheets/{id}', 'WorksheetController@getWorksheet'); // get worksheet
        Route::put('worksheets/{id}', 'WorksheetController@updateWorksheet'); // update worksheet
        Route::delete('worksheets/{id}', 'WorksheetController@deleteWorksheet'); // delete worksheet
    });
});

// Angular routes
Route::any('{path?}', 'ViewController@home')->where("path", "^(?!api/).+");
