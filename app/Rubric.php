<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Rubric extends Model
{
    protected $fillable = ['name'];

    public function getBooks()
    {
        return $this->morphMany('App\BooksParams', 'appraisers');
    }
}
