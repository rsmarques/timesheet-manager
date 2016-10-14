<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Input;
use Validator;
use Log;

use User;
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
    public function storeWorksheet($id = null)
    {
        $validator  = Validator::make(Input::all(), [
            'date'          => 'required|date',
            'hours'         => 'required|integer|min:1',
            'user_id'       => 'required',
            'notes'         => 'array',
        ]);

        if ($validator->fails()) {
            return $this->responseWithErrors($validator->errors()->all(), 422);
        }

        $userId     = Input::get('user_id');
        $user       = User::find($userId);

        if (!$user) {
            return $this->responseWithErrors("User [$userId] not found!", 500);
        }

        Log::info("WorksheetController :: Storing worksheet from user [$userId]");

        $worksheet          = $id ? Worksheet::firstOrNew(array('id' => $id)) : new Worksheet;

        $worksheet->user_id = $user->id;
        $worksheet->date    = Input::get('date');
        $worksheet->hours   = Input::get('hours');
        $worksheet->save();


        // rewriting all notes
        Note::where('worksheet_id', $worksheet->id)->delete();
        $notes              = Input::get('notes', null);

        if (!empty($notes)) {
            foreach ($notes as $content) {
                $note                   = new Note;
                $note->worksheet_id     = $worksheet->id;
                $note->content          = $content;

                $note->save();
            }
        }

        return $worksheet;
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
    * Remove the specified resource from storage.
    *
    * @param  int  $id
    * @return Response
    */
    public function deleteWorksheet($worksheetId)
    {
        $worksheet  = Worksheet::find($worksheetId);

        if (!$worksheet) {
            return $this->responseWithErrors("Worksheet [$worksheetId] not found!", 500);
        }

        // deleting all worksheet notes first
        Note::where('worksheet_id', $worksheet->id)->delete();
        Worksheet::where('id', $worksheet->id)->delete();

        return $this->responseWithNoContent();
    }
}
