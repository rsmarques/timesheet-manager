<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;


use Illuminate\Support\Str;
use Hash;
use DB;
use Log;

class User extends Model implements AuthenticatableContract, CanResetPasswordContract
{
    use Authenticatable, CanResetPassword;

    protected $table    = 'users';
    public $timestamps  = true;
    protected $hidden   = array('password');

    public static function findByUsername($username)
    {
        return User::where('username', $username)->first();
    }

    public function worksheets()
    {
        return $this->hasMany('Worksheet');
    }

    public function getFullName()
    {
        return !empty($this->last_name) ? ($this->first_name . ' ' . $this->last_name) : $this->first_name;
    }

    public function getWorksheetCount()
    {
        return $this->worksheets()->count();
    }

    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::make($password);
    }

    public static function getAuthenticatedUser()
    {
        try {

            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json(['user_not_found'], 404);
            }

        } catch (TokenExpiredException $e) {

            return response()->json(['token_expired'], $e->getStatusCode());

        } catch (TokenInvalidException $e) {

            return response()->json(['token_invalid'], $e->getStatusCode());

        } catch (JWTException $e) {

            return response()->json(['token_absent'], $e->getStatusCode());

        }

        // the token is valid and we have found the user via the sub claim
        return response()->json(compact('user'));
    }

    public function calcUsername()
    {
        if (!empty($this->username)) {
            return $this->username;
        }

        if ($this->first_name or $this->last_name) {
            $sluggable      = '';

            if ($this->first_name) {
                $sluggable .= $this->first_name;
            }

            if ($this->last_name) {
                $sluggable .= "-" . $this->last_name;
            }

            //do not allow slugs starting with number
            if (preg_match('/^\d/', $sluggable)) {
                $sluggable  = 'user-' . $sluggable;
            }

            $sluggable = trim($sluggable);

            if (!$sluggable) {
                $sluggable  = 'user';
            }

            $slug = Str::slug($sluggable);

            if (!$slug) {
                $slug       = 'user';
            }
        } else {
            //if no first name or last name, "user"
            $slug           = Str::slug('user');
        }

        // Avoid repeated slugs
        $repetitions = DB::select(
            DB::raw('select username from users where username REGEXP \'^' . $slug . '(-[0-9]+)?$\' order by username desc')
        );

        if ($repetitions) {
            //find the max number after the slug itself
            $maxNumber  = 0;
            $numbers    = array();
            foreach ($repetitions as $user) {
                preg_match('/-([0-9]+)$/', $user->username, $matches);

                //find slug with numbers in front
                if ($matches) {
                    array_push($numbers, $matches[1]);
                } else {
                    //found just the slug
                    array_push($numbers, 0);
                }
            }

            Log::info('CalcSlug :: Slug $slug repetitions - ' . count($numbers));

            if (count($numbers)) {
                sort($numbers, SORT_NUMERIC);

                //sum 1 to max number and use it in the new slug
                $maxNumber  = end($numbers) + 1;
                $slug       = $slug . '-' . $maxNumber;
            }
        }

        Log::info('CalcSlug :: Calculating slug for user - ' . $this->email . ' -> obtaining: ' . $slug);

        return $slug;
    }
}
