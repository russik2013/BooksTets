<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class BooksParams extends Model
{
    protected $fillable = ["book_id"];

    public function appraisers()
    {
        return $this->morphTo();
    }

    public function book()
    {
        return $this->belongsTo(Book::class,'book_id','id');
    }

}
