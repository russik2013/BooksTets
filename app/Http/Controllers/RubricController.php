<?php

namespace App\Http\Controllers;

use App\Helpers\CRUDModelHelper;
use App\Http\Requests\RubricRequest;
use App\Rubric;

class RubricController extends Controller
{

    private $model = 'Rubric';
    private $baseRoute = 'rubric';
    private $baseViewFolder = 'rubric';

    public function index()
    {
        return view('rubric.index')
            ->with('rubrics', Rubric::all());
    }

    public function create()
    {
        return view('rubric.create');
    }

    public function add(RubricRequest $request)
    {
        $result = CRUDModelHelper::add($this->model, $request, $this->baseRoute);
        return $result;
    }

    public function edit($id)
    {
        $rubric = Rubric::find($id);
        if(!$rubric){
            return redirect()->route('rubric.index');
        }
        return view('rubric.edit')
            ->with('rubric', $rubric);
    }

    public function update(RubricRequest $request)
    {
        $result = CRUDModelHelper::update($this->model, $request, $this->baseRoute);
        return $result;
    }

    public function delete($id)
    {
        $rubric = Rubric::find($id);
        if($rubric){
            $rubric->delete();
        }
        return redirect()->route('rubric.index');
    }

    public function show($id)
    {
        $result = CRUDModelHelper::show($this->model, $id, $this->baseViewFolder, $this->baseRoute);
        return $result;
    }
}
