
@extends('layouts.main')
@section('content')
<table class="table table-striped">

    <thead>
        <tr>
            <th scope="col">title</th>
            <th scope="col">photo</th>
            <th scope="col">control</th>
        </tr>

    </thead>
    <tbody>
        @foreach($books as $book)
            <tr>
                <td>{{$book->title}}</td>
                <td>
                    <div class="col-md-4" style="padding-left: 0px;  padding-right: 0px;">
                        <img style="max-height: 100px; max-width: 100px;" src="{{asset('images/'.$book->photo)}}" class="img-fluid">
                    </div>
                </td>
                <td>
                    @if((Auth::user()->role ? Auth::user()->role->name : "client") == 'admin')
                        <a class="btn btn-primary" href="{{route('book.edit', ['id' => $book->id])}}" role="button">Edit</a>
                        <a class="btn btn-danger" href="{{route('book.delete', ['id' => $book->id])}}">Delete</a>
                    @endif
                    <a class="btn btn-success" href="{{route('book.show', ['id' => $book->id])}}">Show</a>
                </td>

            </tr>
            @endforeach
    </tbody>
</table>

<a class="btn btn-primary btn-lg btn-block" href="{{route('book.create')}}">Add new</a>
@endsection