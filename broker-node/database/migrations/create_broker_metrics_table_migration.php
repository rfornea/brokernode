

<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChunkEvents extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */

    public function up()
    {
        Schema::create('chunk_events', function (Blueprint $table) {
            $table->increments('id');
            $table->string('hook_node_id');
            $table->string('session_id');
            $table->string('event_name');
            $table->string('value');
            $table->timestamps();
        });

    /**
     * Reverse the migrations.
     *
     * @return void
     */
        
    public function down()
    {
        Schema::drop('chunk_events');
    }
}




?>

