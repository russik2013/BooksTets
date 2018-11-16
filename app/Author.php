<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    protected $fillable = ['name', 'surname'];

    public function getFullNameAttribute()
    {
        return $this->attributes['name']. ' '. $this->attributes['surname'];
    }

    public function getBooks()
    {
        return $this->morphMany('App\BooksParams', 'appraisers');
    }
}
