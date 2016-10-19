<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateUsersTable extends Migration {

	public function up()
	{
		Schema::create('users', function(Blueprint $table) {
			$table->increments('id');
			$table->timestamps();
			$table->string('email')->unique();
			$table->string('password');
			$table->string('first_name');
			$table->string('last_name');
			$table->string('username')->unique();
			$table->string('profile_image')->nullable();
			$table->enum('role', ['regular', 'manager', 'admin']);
			$table->integer('working_hours')->unsigned();
		});
	}

	public function down()
	{
		Schema::drop('users');
	}
}