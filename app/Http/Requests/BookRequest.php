<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        switch (request()::route()->getName()){

            case 'book.add' :
                return [
                    'title' => 'required|string',
                    'photo' => 'required|image'
                ];
            break;
            case 'book.update' :
                return [
                    'title' => 'nullable|string',
                    'photo' => 'nullable|image',
                    'id'    => 'required|exists:books,id'
                ];
            break;
        }
        return [
            //
        ];
    }
}
