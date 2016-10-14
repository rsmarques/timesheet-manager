<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Worksheet extends Model
{

    protected $table    = 'worksheets';
    public $timestamps  = true;

    public function user()
    {
        return $this->belongsTo('User');
    }

    public function notes()
    {
        return $this->hasMany('Note');
    }
}
