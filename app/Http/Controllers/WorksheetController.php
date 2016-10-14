<?php

namespace App\Http\Controllers;

use Worksheet;
use Note;

class WorksheetController extends ApiController
{
    /**
    * Display a listing of the resource.
    *
    * @return Response
    */
    public function userWorksheets($userId)
    {
        $worksheets = Worksheet::where('user_id', $userId)->get();

        return $worksheets;
    }

    /**
    * Store a newly created resource in storage.
    *
    * @return Response
    */
    public function storeWorksheet($userId)
    {

    }

    /**
    * Display the specified resource.
    *
    * @param  int  $id
    * @return Response
    */
    public function getWorksheet($worksheetId)
    {
        $worksheet  = Worksheet::find($worksheetId);

        return $worksheet;
    }

    /**
    * Update the specified resource in storage.
    *
    * @param  int  $id
    * @return Response
    */
    public function updateWorksheet($worksheetId)
    {

    }

    /**
    * Remove the specified resource from storage.
    *
    * @param  int  $id
    * @return Response
    */
    public function deleteWorksheet($worksheetId)
    {

    }
}
