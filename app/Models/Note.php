<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{

    protected $table = 'notes';
    public $timestamps = true;

    public function worksheet()
    {
        return $this->belongsTo('Worksheet');
    }
}
