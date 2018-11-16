@extends('layouts.main')
@section('content')
    <table class="table table-striped">

        <thead>
        <tr>
            <th scope="col">name</th>
            <th scope="col">control</th>
        </tr>

        </thead>
        <tbody>
        @foreach($rubrics as $rubric)
            <tr>
                <td>{{$rubric->name}}</td>
                <td>
                    @if((Auth::user()->role ? Auth::user()->role->name : "client") == 'admin')
                        <a class="btn btn-primary" href="{{route('rubric.edit', ['id' => $rubric->id])}}" role="button">Edit</a>
                        <a class="btn btn-danger" href="{{route('rubric.delete', ['id' => $rubric->id])}}">Delete</a>
                    @endif
                    <a class="btn btn-success" href="{{route('rubric.show', ['id' => $rubric->id])}}">Show</a>
                </td>

            </tr>
        @endforeach
        </tbody>
    </table>

    <a class="btn btn-primary btn-lg btn-block" href="{{route('rubric.create')}}">Add new</a>
@endsection