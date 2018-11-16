<!DOCTYPE html>
<html lang="en" dir="{{config('app.direction')}}">
<head>
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css"
          crossorigin="anonymous">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Font Awesome JS -->
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/solid.js" integrity="sha384-tzzSw1/Vo+0N5UhStP3bvwWPq+uvzCMfrN1fEFe+xBmv1C/AtVX5K0uZtmcHitFZ" crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/fontawesome.js" integrity="sha384-6OIrr52G08NpOFSZdxxz1xdNSndlD4vdcf/q2myIUVO0VsqaGHJsB0RaBE01VTOY" crossorigin="anonymous"></script>


</head>

<body class="page-header-fixed page-sidebar-closed-hide-logo page-container-bg-solid basic-main-layout">

<!-- jQuery CDN - Slim version (=without AJAX) -->
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<!-- Popper.JS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js" integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ" crossorigin="anonymous"></script>
<!-- Bootstrap JS -->
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js" integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm" crossorigin="anonymous"></script>

{{--<body class="page-header-fixed page-sidebar-closed-hide-logo page-container-bg-solid page-sidebar-closed basic-main-layout">--}}
{{--@include('partials.header')--}}
<nav class="navbar navbar-light bg-light">
    <a class="navbar-brand">Navbar</a>
    <form class="form-inline">
        <a class="navbar-brand btn btn-primary" href="{{route('book.index')}}" role="button">Books</a>
        <a class="navbar-brand btn btn-primary" href="{{route('author.index')}}" role="button">Authors</a>
        <a class="navbar-brand btn btn-primary" href="{{route('rubric.index')}}" role="button">Rubrics</a>
        <a class="navbar-brand btn btn-danger" href="{{route('home')}}"  role="button">Home</a>
    </form>
</nav>
<div class="clearfix"></div>
<div class="page-container">
    {{--@include('partials.side_bar')--}}

    <div class="page-content-wrapper">
        <div class="page-content basic_page-content">
            @yield('content')
        </div>
    </div>
</div>


</body>
</html>