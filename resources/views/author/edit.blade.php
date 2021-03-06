@extends('layouts.main')
@section('content')
    <style>
        .error{
            color: red;
        }
    </style>

    <div class="row justify-content-md-center">
        <form action="{{route('author.update')}}" method="post">
            <div class="form-group">
                <label for="exampleInputName">Name</label>
                <input type="text" class="form-control" name="name" value="{{$author->name}}"
                       aria-describedby="nameHelp" placeholder="Enter name">
                @if ($errors->has('name'))
                    <div class="error">{{ $errors->first('name') }}</div>
                @endif
            </div>

            <input type="hidden" value="{{$author->id}}" name="id">

            {!! csrf_field() !!}

            <div class="form-group">
                <label for="exampleInputSurname">Surname</label>
                <input type="text" class="form-control" name="surname" value="{{$author->surname}}"
                       aria-describedby="titleHelp" placeholder="Enter surname">
                @if ($errors->has('surname'))
                    <div class="error">{{ $errors->first('surname') }}</div>
                @endif
            </div>

            <button type="submit" class="btn btn-primary">Submit</button>
            <a class="btn btn-danger" href="{{route('author.index')}}">Back</a>
        </form>
    </div>

@endsection
