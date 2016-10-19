<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker          = Faker\Factory::create('en_US');
        $roles          = ['regular', 'manager', 'admin'];

        foreach (range(1, 5) as $key => $value) {

            $firstName              = $faker->firstName;
            $lastName               = $faker->lastName;

            $user                   = new User;
            $user->first_name       = $firstName;
            $user->last_name        = $lastName;
            $user->username         = $user->calcUserName();
            $user->email            = strtolower($firstName) . '.' . strtolower($lastName) . '@' . $faker->freeEmailDomain;
            $user->working_hours    = rand(1, 8);
            $user->role             = $roles[array_rand($roles)];
            $user->password         = '123456';

            $user->save();
        }

        foreach (range(1, 20) as $key => $value) {

            $worksheet          = new Worksheet;

            $worksheet->user_id = User::orderByRaw('RAND()')->first()->id;
            $worksheet->date    = $faker->dateTimeThisYear();
            $worksheet->hours   = rand(1, 8);

            $worksheet->save();
        }

        foreach (range(1, 20) as $key => $value) {

            $note               = new Note;
            $note->worksheet_id = Worksheet::orderByRaw('RAND()')->first()->id;
            $note->content      = $faker->realText(30);

            $note->save();
        }

        return true;
    }
}
