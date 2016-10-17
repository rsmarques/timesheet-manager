<?php

namespace App\Http\Controllers;

// use League\Fractal\Resource\Collection;
use User;
use Worksheet;
use Note;
use UserTransformer;

use JWTAuth;
use Response;

use Log;
use Validator;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Input;

class UserController extends ApiController
{
    public function findByUsername($username)
    {
        $user   = User::findByUsername($username);

        if (empty($user)) {
            return $this->responseWithErrors("The requested user [$username] does not exist.", 404);
        }

        return $this->respondWithItem($user, new UserTransformer);
    }

    public function me()
    {
        $user   = JWTAuth::parseToken()->toUser();

        if (!$user) {
            return $this->responseWithErrors("User not authenticated!");
        }

        return $this->respondWithItem($user, new UserTransformer);
    }

    public function signUp()
    {
        $validator  = $this->createUserValidator();

        if ($validator->fails()) {
            return $this->responseWithErrors($validator->errors()->all(), 422);
        }

        $user       = $this->storeUser();

        $token      = JWTAuth::fromUser($user);

        return Response::json(compact('token'));
    }

    public function signIn()
    {
        $credentials    = Input::only('email', 'password');

        if (!$token     = JWTAuth::attempt($credentials)) {
            return Response::json(false, HttpResponse::HTTP_UNAUTHORIZED);
        }

        return Response::json(compact('token'));
    }

    public function createUser()
    {
        $validator  = $this->createUserValidator();

        if ($validator->fails()) {
            return $this->responseWithErrors($validator->errors()->all(), 422);
        }

        $user       = $this->storeUser();

        return $this->respondWithItem($user, new UserTransformer);
    }

    public function updateUser($id)
    {
        $user       = User::find($id);

        if (!$user) {
            return $this->responseWithErrors("User [$id] not found!", 500);
        }

        $validator  = $this->updateUserValidator($user);

        if ($validator->fails()) {
            return $this->responseWithErrors($validator->errors()->all(), 422);
        }

        $user       = $this->storeUser($id);

        return $this->respondWithItem($user, new UserTransformer);
    }

    public function deleteUser($id)
    {
        $user       = User::find($id);

        if (!$user) {
            return $this->responseWithErrors("User [$id] not found!", 500);
        }

        // deleting all worksheets and notes first
        Note::join('worksheets', 'notes.worksheet_id', '=', 'worksheets.id')->where('worksheets.user_id', $user->id)->delete();
        Worksheet::where('user_id', $user->id)->delete();
        User::where('id', $user->id)->delete();

        return $this->responseWithNoContent();
    }

    public function storeUser($id = null)
    {
        $user                   = $id ? User::firstOrNew(['id' => $id]) : new User;

        $user->email            = Input::get('email');
        // password is only stored if received
        if (Input::get('password')) {
            $user->password     = Input::get('password');
        }
        $user->first_name       = Input::get('first_name');
        $user->last_name        = Input::get('last_name', null);
        $user->username         = Input::get('username', $user->calcUsername());
        $user->profile_image    = Input::get('profile_image');
        $user->role             = Input::get('role', 'regular');
        $user->working_hours    = Input::get('working_hours', 0);

        $user->save();

        return $user;
    }

    // Validators
    public function createUserValidator()
    {
        return Validator::make(Input::all(), [
            'email'         => 'required|unique:users',
            'password'      => 'required|min:6',
            'username'      => 'unique:users',
            'first_name'    => 'required',
            'last_name'     => 'required',
            'working_hours' => 'integer|min:0',
        ]);
    }

    public function updateUserValidator($user)
    {
        return Validator::make(Input::all(), [
            'email'         => 'required|unique:users,email,' . $user->id,
            'username'      => 'required|unique:users,username,' . $user->id,
            'first_name'    => 'required',
            'last_name'     => 'required',
            'working_hours' => 'integer|min:0',
        ]);
    }
}
