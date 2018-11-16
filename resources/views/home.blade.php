@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <div class="panel panel-default">
                <div class="panel-heading">Dashboard</div>

                <div class="panel-body">
                    @if (session('status'))
                        <div class="alert alert-success">
                            {{ session('status') }}
                        </div>
                    @endif
                        <a class="btn btn-danger" href="{{route('book.index')}}">Books</a>
                        <a class="btn btn-danger" href="{{route('author.index')}}">Authors</a>
                        <a class="btn btn-danger" href="{{route('rubric.index')}}">Rubrics</a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
