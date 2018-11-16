@extends('layouts.main')
@section('content')
    <table class="table table-striped">

        <thead>
        <tr>
            <th scope="col">name</th>
            <th scope="col">surname</th>
            <th scope="col">control</th>
        </tr>

        </thead>
        <tbody>
        @foreach($authors as $author)
            <tr>
                <td>{{$author->name}}</td>
                <td>{{$author->surname}}</td>
                <td>
                    @if((Auth::user()->role ? Auth::user()->role->name : "client") == 'admin')
                        <a class="btn btn-primary" href="{{route('author.edit', ['id' => $author->id])}}" role="button">Edit</a>
                        <a class="btn btn-danger" href="{{route('author.delete', ['id' => $author->id])}}">Delete</a>
                    @endif
                    <a class="btn btn-success" href="{{route('author.show', ['id' => $author->id])}}">Show</a>
                </td>

            </tr>
        @endforeach
        </tbody>
    </table>

    <a class="btn btn-primary btn-lg btn-block" href="{{route('author.create')}}">Add new</a>
@endsection