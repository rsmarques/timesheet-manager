<?php

namespace App\Http\Controllers;

use Note;

class NoteController extends Controller
{

    public function worksheetNotes($worksheetId)
    {
        $notes  = Note::where('worksheet_id', $worksheetId)->get();

        return $notes;
    }

    /**
    * Store a newly created resource in storage.
    *
    * @return Response
    */
    public function storeNote($worksheetId)
    {

    }

    /**
    * Display the specified resource.
    *
    * @param  int  $id
    * @return Response
    */
    public function getNote($noteId)
    {
        $note   = Note::find($noteId);

        return $note;
    }

    /**
    * Update the specified resource in storage.
    *
    * @param  int  $id
    * @return Response
    */
    public function updateNote($noteId)
    {

    }

    /**
    * Remove the specified resource from storage.
    *
    * @param  int  $id
    * @return Response
    */
    public function deleteNote($noteId)
    {

    }
}
