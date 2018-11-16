@extends('layouts.main')
@section('content')
<style>
    .error{
        color: red;
    }

    /*the container must be positioned relative:*/
    .custom-select {
        position: relative;
        font-family: Arial;
    }
    .custom-select select {
        display: none; /*hide original SELECT element:*/
    }
    .select-selected {
        background-color: DodgerBlue;
    }
    /*style the arrow inside the select element:*/
    .select-selected:after {
        position: absolute;
        content: "";
        top: 14px;
        right: 10px;
        width: 0;
        height: 0;
        border: 6px solid transparent;
        border-color: #fff transparent transparent transparent;
    }
    /*point the arrow upwards when the select box is open (active):*/
    .select-selected.select-arrow-active:after {
        border-color: transparent transparent #fff transparent;
        top: 7px;
    }
    /*style the items (options), including the selected item:*/
    .select-items div,.select-selected {
        color: #ffffff;
        padding: 8px 16px;
        border: 1px solid transparent;
        border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
        cursor: pointer;
    }
    /*style items (options):*/
    .select-items {
        position: absolute;
        background-color: DodgerBlue;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 99;
    }
    /*hide the items when the select box is closed:*/
    .select-hide {
        display: none;
    }
    .select-items div:hover, .same-as-selected {
        background-color: rgba(0, 0, 0, 0.1);
    }
</style>

<div class="row justify-content-md-center">
<form action="{{route('book.add')}}" method="post" enctype="multipart/form-data">
    <div class="form-group">
        <label for="exampleInputTitle">Title</label>
        <input type="text" class="form-control" name="title" aria-describedby="titleHelp" placeholder="Enter title">
        @if ($errors->has('title'))
            <div class="error">{{ $errors->first('title') }}</div>
        @endif
    </div>
    {!! csrf_field() !!}

    <div class="form-group">
        <label for="exampleFormControlPhoto">Photo</label>
        <input type="file" name="photo" class="form-control-file" >
        @if ($errors->has('photo'))
            <div class="error">{{ $errors->first('photo') }}</div>
        @endif
    </div>

    <div class="form-group">
        <label>Authors</label>
        <div id="authors">

        </div>

    </div>

    <div class="form-group">
        <button id="add_author" type="button" class="btn btn-info">Add author</button>
    </div>

    <div class="form-group">
        <label>Rubrics</label>
        <div id="rubrics">

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

