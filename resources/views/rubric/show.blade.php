@extends('layouts.main')
@section('content')
    <div class="row justify-content-md-center">
        <div class="portlet light bordered">
            <div class="portlet-title">
                <div class="caption">
                    <table class="table table-bordered">
                        <tbody>
                        <tr>
                            <td scope="row">name</td>
                            <td>{{$rubric -> name}}</td>
                        </tr>
                        <tr>
                            <td scope="row">books</td>
                            <td>
                                <table class="table table-bordered">
                                    <tbody>
                                    @foreach($rubric -> getBooks as $book)
                                        <tr>
                                            <td>{{$book -> book -> title}}</td>
                                        </tr>
                                    @endforeach
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <a class="btn btn-danger" href="{{route('rubric.index')}}">Back</a>
                </div>
            </div>
        </div>
    </div>
    <style>

        .caption.comments > div {
            display: inline-block;
            vertical-align: top;
        }

        .portlet.light {
            padding: 20px !important;
        }

        @media only all and (max-width: 768px) {
            .portlet.light {
                padding: 10px !important;
            }
        }

        table.table {
            background: white;
        }

        body.basic-main-layout .portlet.light .portlet-body {
            padding: 0 !important;
        }

        .checkboxTd {
            text-align: center;

        }
        td.checkboxTd input {
            zoom: 2;
            margin-top: 2px;
        }

        .quantity {
            width: 80px !important;
        }

        .quantityInput {
            width: 60px !important;
            text-align: center;
        }

        .table-striped > tbody > tr.odd {
            background-color: #fbfcfd;
        }

        .table-striped > tbody > tr.even {
            background-color: white;
        }

        .table-striped > tbody > tr.categoryTitle {
            background-color: #e8e8e8;
        }

        .table-striped > tbody > tr.categoryTitle > td {
            height: 20px !important;
            padding: 3px 10px;
            box-sizing: border-box;
            font-weight: bold;
            font-size: 14px;
        }

        .table-striped > tbody > tr td {
            vertical-align: middle;
        }

        .table-striped tr .counter {
            text-align: center;
        }

        .table-striped > tbody > tr.categoryTitle:hover td {
            background-color: #e8e8e8 !important;
        }

    </style>
@endsection