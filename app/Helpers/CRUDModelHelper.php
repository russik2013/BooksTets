<?php
/**
 * Created by PhpStorm.
 * User: User
 * Date: 15.11.2018
 * Time: 5:40
 */
namespace App\Helpers;

use App;

class CRUDModelHelper
{
    public static function update($modelName, $request, $baseRoute)
    {
        $modelName = 'App\\'.$modelName;
        $model = $modelName::find($request->id);

        if(!$model){
            return redirect()->route($baseRoute.'.index');
        }
        $model->fill($request->all());
        if($model->save()){
            return redirect()->route($baseRoute.'.index');
        }
        return redirect()->back();
    }

    public static function add($modelName, $request, $baseRoute)
    {
        $modelName = 'App\\'.$modelName;
        $model = new $modelName();
        $model->fill($request->all());
        if($model->save()){
            return redirect()->route($baseRoute.'.index');
        }
        return redirect()->back();
    }

    public static function show($modelName, $id, $baseViewFolder, $baseRoute)
    {
        $modelName = 'App\\'.$modelName;
        $model = $modelName::with('getBooks.book')->find($id);

        if(!$model){
            return redirect()->back();
        }
        return view($baseViewFolder.'.show')
            ->with($baseRoute,$model);
    }

    public static function formBookParamsArray($request, $book)
    {
        $params = [];
        if($request->rubrics){
            foreach (array_unique($request->rubrics) as $rubric){
                $params[] = [
                    'appraisers_type' => 'App\Rubric',
                    'appraisers_id'   => $rubric,
                    'book_id'         => $book->id,
                ];
            }
        }
        if($request->authors){
            foreach (array_unique($request->authors) as $author){
                $params[] = [
                    'appraisers_type' => 'App\Author',
                    'appraisers_id'   => $author,
                    'book_id'         => $book->id,
                ];
            }
        }

        return $params;
    }
}