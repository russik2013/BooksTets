@extends('layouts.main')
@section('content')
    <style>
        .error{
            color: red;
        }
    </style>

    <div class="row justify-content-md-center">
        <form action="{{route('book.update')}}" method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label for="exampleInputTitle">Title</label>
                <input type="text" class="form-control" name="title" value="{{$book->title}}" aria-describedby="titleHelp" placeholder="Enter title">
                @if ($errors->has('title'))
                    <div class="error">{{ $errors->first('title') }}</div>
                @endif
            </div>

            <input type="hidden" value="{{$book->id}}" name="id">

            {!! csrf_field() !!}

            <div class="form-group">
                <label for="exampleFormControlPhoto">Photo</label>
                <div class="col-md-4" style="padding-left: 0px;  padding-right: 0px;">
                    <img style="max-height: 20%" src="{{asset('images/'.$book->photo)}}" class="img-fluid">
                </div>


                <input type="file" name="photo" class="form-control-file" >
                @if ($errors->has('photo'))
                    <div class="error">{{ $errors->first('photo') }}</div>
                @endif
            </div>

            <div class="form-group">
                <label>Authors</label>
                <div id="authors">
                        @foreach($book->getParamsAuthors as $bookAuthors)
                        <div class="form-group" id="{{$bookAuthors->id}}">
                            <select name="authors[]" class="custom-select">
                                @foreach($authors as $author)
                                    <option value="{{$author->id}}" @if($bookAuthors->appraisers_id == $author->id) selected @endif>
                                        {{$author->name}} {{$author->surname}}
                                    </option>
                                    @endforeach
                            </select>
                            <button  type='button' class='btn btn-danger' onclick='remove({{$bookAuthors->id}})'>remove</button>
                        </div>
                        @endforeach
                </div>

            </div>

            <div class="form-group">
                <button id="add_author" type="button" class="btn btn-info">Add author</button>
            </div>

            <div class="form-group">
                <label>Rubrics</label>
                <div id="rubrics">
                    @foreach($book->getParamsRubrics as $bookRubrics)
                        <div class="form-group" id="{{$bookRubrics->id}}">
                            <select name="rubrics[]" class="custom-select">
                                @foreach($rubrics as $rubric)
                                    <option value="{{$rubric->id}}" @if($bookRubrics->appraisers_id == $rubric->id) selected @endif>
                                        {{$rubric->name}}
                                    </option>
                                @endforeach
                            </select>
                            <button  type='button' class='btn btn-danger' onclick='remove({{$bookRubrics->id}})'>remove</button>
                        </div>
                    @endforeach
                </div>

            </div>

            <div class="form-group">
                <button id="add_rubric" type="button" class="btn btn-info">Add rubric</button>
            </div>


            <button type="submit" class="btn btn-primary">Submit</button>
            <a class="btn btn-danger" href="{{route('book.index')}}">Back</a>
        </form>
    </div>

    <script>
        function remove(id){
            $("#"+id).remove();
            console.log('remove item' );
            console.log(id);
        }

        $( document ).ready(function() {

            var authors = JSON.parse('{!! json_encode($authors) !!}');
            var rubrics = JSON.parse('{!! json_encode($rubrics) !!}');

            $('#add_author').click(function () {
                id = Math.floor(Math.random() * 10000);
                var select = '<div class="form-group" id="'+id+'"><select name="authors[]" class="custom-select">';
                for(var i = 0; i < authors.length; i ++){
                    select += '<option value="'+authors[i].id+'">'+authors[i].name+' '+authors[i].surname+'</option>';
                }
                select += "</select>" +
                    "<button  type='button' class='btn btn-danger' onclick='remove("+id+")'>remove</button></div>";
                $('#authors').append(select);
            });

            $('#add_rubric').click(function () {
                id = Math.floor(Math.random() * 10000);
                var select = '<div class="form-group" id="'+id+'"><select name="rubrics[]" class="custom-select">';
                for(var i = 0; i < rubrics.length; i ++){
                    console.log(rubrics[i]);
                    select += '<option value="'+rubrics[i].id+'">'+rubrics[i].name+'</option>';
                }
                select += "</select>" +
                    "<button  type='button' class='btn btn-danger' onclick='remove("+id+")'>remove</button></div>";
                $('#rubrics').append(select);

            });

        });
    </script>
@endsection