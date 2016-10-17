<?php

namespace App\Transformers;

use App\Models\Worksheet;
use League\Fractal;

class WorksheetTransformer extends Fractal\TransformerAbstract
{
    public function transform(Worksheet $worksheet)
    {
        return [
            'id'            => $worksheet->id,
            'created_at'    => $worksheet->created_at,
            'updated_at'    => $worksheet->updated_at,
            'user_id'       => $worksheet->user_id,
            'date'          => $worksheet->date,
            'hours'         => $worksheet->hours,
            'notes'         => $worksheet->getNotes(),
        ];
    }
}
