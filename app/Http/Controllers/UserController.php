<?php

namespace App\Http\Controllers;

// use League\Fractal\Resource\Collection;
use User;

use JWTAuth;
use Response;

use Log;
use Validator;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

class UserController extends ApiController
{
    public function findByUsername($username)
    {
        $user   = User::findByUsername($username);

        if (empty($user)) {
            return $this->responseWithErrors("The requested user [$username] does not exist.", 404);
        }

        return $user;
    }

    public function signUp(Request $request)
    {
        $validator  = Validator::make($request->all(), [
            'email'         => 'required|email|max:255|unique:users',
            'password'      => 'required|min:6',
            'username'      => 'unique:users',
        ]);

        if ($validator->fails()) {
            return $this->responseWithErrors($validator->errors()->all(), 422);
        }

        $user               = new User;

        $user->email        = $request->input('email');
        $user->password     = $request->input('password');
        $user->first_name   = $request->input('first_name');
        $user->last_name    = $request->input('last_name', null);
        $user->username     = $request->input('username', $user->calcUsername());

        $user->save();

        $token              = JWTAuth::fromUser($user);

        return Response::json(compact('token'));
    }

    public function signIn(Request $request)
    {
        $credentials    = $request->only('email', 'password');

        if (!$token     = JWTAuth::attempt($credentials)) {
            return Response::json(false, HttpResponse::HTTP_UNAUTHORIZED);
        }

        return Response::json(compact('token'));
    }

    public function me(Request $request)
    {
        $user   = JWTAuth::parseToken()->toUser();

        if (!$user) {
            return $this->responseWithErrors("User not authenticated!");
        }

        return $user;
    }
}
