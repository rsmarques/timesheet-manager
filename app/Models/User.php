<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Str;
use DB;
use Log;

class User extends Model
{

    protected $table    = 'users';
    public $timestamps  = true;
    protected $hidden   = array('password');

    public function worksheets()
    {
        return $this->hasMany('Worksheet');
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
