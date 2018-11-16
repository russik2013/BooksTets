@extends('layouts.main')
@section('content')
    <style>
        .error{
            color: red;
        }
    </style>

    <div class="row justify-content-md-center">
        <form action="{{route('rubric.update')}}" method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label for="exampleInputName">Name</label>
                <input type="text" class="form-control" value="{{$rubric->name}}" name="name"
                       aria-describedby="titleName" placeholder="Enter name">
                @if ($errors->has('name'))
                    <div class="error">{{ $errors->first('name') }}</div>
                @endif
            </div>

            <input type="hidden" name="id" value="{{$rubric->id}}">

            {!! csrf_field() !!}

            <button type="submit" class="btn btn-primary">Submit</button>
            <a class="btn btn-danger" href="{{route('book.index')}}">Back</a>
        </form>
    </div>

@endsection
