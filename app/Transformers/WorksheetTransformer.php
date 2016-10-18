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
            'user_id'       => $worksheet->user_id,
            'date'          => $worksheet->date,
            'hours'         => $worksheet->hours,
            'notes'         => $worksheet->getNotes(),
        ];
    }
}
