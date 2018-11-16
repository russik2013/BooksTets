<?php

namespace App\Http\Controllers;


use App\Author;
use App\Helpers\CRUDModelHelper;
use App\Http\Requests\AuthorRequest;

class AuthorController extends Controller
{
    private $model = 'Author';
    private $baseRoute = 'author';
    private $baseViewFolder = 'author';

    public function index()
    {
        return view('author.index')
            ->with('authors', Author::all());
    }

    public function create()
    {
        return view('author.create');
    }

    public function add(AuthorRequest $request)
    {
        $result = CRUDModelHelper::add($this->model, $request, $this->baseRoute);
        return $result;
    }

    public function edit($id)
    {
        $author = Author::find($id);
        if(!$author){
            return redirect()->route('author.index');
        }
        return view('author.edit')
            ->with('author', $author);

    }

    public function update(AuthorRequest $request)
    {
        $result = CRUDModelHelper::update($this->model, $request, $this->baseRoute);
        return $result;
    }

    public function delete($id)
    {
        $author = Author::find($id);
        if($author){
            $author->delete();
        }
        return redirect()->route('author.index');
    }

    public function show($id)
    {
        $result = CRUDModelHelper::show($this->model, $id, $this->baseViewFolder, $this->baseRoute);
        return $result;
    }
}
