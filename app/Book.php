<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = ['title', 'photo'];

    public function setPhotoAttribute($value)
    {
        $filename = md5(time())."_".time().'.'.$value->getClientOriginalExtension();
        $value->move(public_path().'\images\\', $filename);
        $this->attributes['photo'] =  $filename;
    }

    public function getParams()
    {
        return $this->hasMany('App\BooksParams', 'book_id', 'id');
    }

    public function getParamsAuthors()
    {
        return $this->hasMany('App\BooksParams', 'book_id', 'id')
            ->where('appraisers_type', 'App\Author');
    }

    public function getParamsRubrics()
    {
        return $this->hasMany('App\BooksParams', 'book_id', 'id')
            ->where('appraisers_type', 'App\Rubric');
    }

}
