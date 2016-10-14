<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateWorksheetsTable extends Migration {

	public function up()
	{
		Schema::create('worksheets', function(Blueprint $table) {
			$table->increments('id');
			$table->timestamps();
			$table->integer('user_id')->unsigned();
			$table->date('date');
			$table->integer('hours')->unsigned();
		});
	}

	public function down()
	{
		Schema::drop('worksheets');
	}
}