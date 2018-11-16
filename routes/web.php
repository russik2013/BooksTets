<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});


/**
* Books
 */

Route::group(['prefix' => 'books'], function (){

    Route::get('/',             'BookController@index')     -> name('book.index');
    Route::get('/show/{id}',    'BookController@show')      -> name('book.show');

    Route::group(['middleware' => 'admin'], function (){
        Route::get('/create',       'BookController@create')    -> name('book.create');
        Route::post('/create',      'BookController@add')       -> name('book.add');
        Route::get('/edit/{id}',    'BookController@edit')      -> name('book.edit');
        Route::post('/edit',        'BookController@update')    -> name('book.update');
        Route::get('/delete/{id}',  'BookController@delete')    -> name('book.delete');
    });

});


Route::group(['prefix' => 'authors'], function (){

    Route::get('/',             'AuthorController@index')     -> name('author.index');
    Route::get('/show/{id}',    'AuthorController@show')      -> name('author.show');

    Route::group(['middleware' => 'admin'], function (){
        Route::get('/create',       'AuthorController@create')    -> name('author.create');
        Route::post('/create',      'AuthorController@add')       -> name('author.add');
        Route::get('/edit/{id}',    'AuthorController@edit')      -> name('author.edit');
        Route::post('/edit',        'AuthorController@update')    -> name('author.update');
        Route::get('/delete/{id}',  'AuthorController@delete')    -> name('author.delete');
    });

});

Route::group(['prefix' => 'rubric'], function (){

    Route::get('/',             'RubricController@index')     -> name('rubric.index');
    Route::get('/show/{id}',    'RubricController@show')      -> name('rubric.show');

    Route::group(['middleware' => 'admin'], function (){
        Route::get('/create',       'RubricController@create')    -> name('rubric.create');
        Route::post('/create',      'RubricController@add')       -> name('rubric.add');
        Route::get('/edit/{id}',    'RubricController@edit')      -> name('rubric.edit');
        Route::post('/edit',        'RubricController@update')    -> name('rubric.update');
        Route::get('/delete/{id}',  'RubricController@delete')    -> name('rubric.delete');
    });

});
Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');
