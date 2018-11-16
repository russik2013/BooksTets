<?php

namespace App\Http\Controllers;

use App\Author;
use App\Book;
use App\BooksParams;
use App\Helpers\CRUDModelHelper;
use App\Http\Requests\BookRequest;
use App\Rubric;
use Illuminate\Support\Facades\DB;

class BookController extends Controller
{
    private $model = 'Book';
    private $baseRoute = 'book';
    private $baseViewFolder = 'books';

    public function index()
    {
        return view('books.index')
            ->with('books', Book::all());
    }

    public function show($id)
    {
        $book = Book::find($id);

        if(!$book){
            return redirect()->back();
        }
        return view($this->baseViewFolder.'.show')
            ->with('book',$book);
    }

    public function create()
    {
        return view('books.create')
            ->with('authors', Author::all())
            ->with('rubrics', Rubric::all());
    }

    public function add(BookRequest $request)
    {
        DB::transaction(function() use ($request)
        {
            $book = Book::create([
                'title' => $request->title,
                'photo' => $request->photo
            ]);

            $params = CRUDModelHelper::formBookParamsArray($request, $book);

            $booksParams = BooksParams::insert($params);
            if( !$book || !$booksParams ){
                DB::rollback();
                return redirect()->back();
            } else {
                DB::commit();
                return redirect()->route($this->baseRoute.'.index');
            }
        });
        DB::commit();


        return redirect()->route($this->baseRoute.'.index');
    }

    public function edit($id)
    {
        $book = Book::with('getParamsAuthors', 'getParamsRubrics')->find($id);

        if(!$book){
            return redirect()->route('book.index');
        }
        return view('books.edit')
                ->with('book', $book)
                ->with('authors', Author::all())
                ->with('rubrics', Rubric::all());;
    }

    public function update(BookRequest $request)
    {
        DB::transaction(function() use ($request)
        {
            $book = Book::find($request->id);
            $book->fill($request->all());
            $book->save();

            $book->getParams()->delete();

            $params = CRUDModelHelper::formBookParamsArray($request, $book);

            $booksParams = BooksParams::insert($params);
            if( !$book || !$booksParams ){
                DB::rollback();
                return redirect()->back();
            } else {
                DB::commit();
                return redirect()->route($this->baseRoute.'.index');
            }
        });
        DB::commit();
        return redirect()->route($this->baseRoute.'.index');

    }

    public function delete($id)
    {
        $book = Book::find($id);
        if($book){
            $book->delete();
        }
        return redirect()->route('book.index');
    }
}
