<?php


namespace App;



use App\Clients\BrokerNode;

use Illuminate\Database\Eloquent\Model;

use Webpatser\Uuid\Uuid;



class ChunkEvents extends Model

{


    public static function boot()
    {

        parent::boot();

        self::creating(function ($model) {

            $model->id = (string)Uuid::generate(4);

        });

    }
	
	public static function addChunkEvent(timestamp, event_name, hook_id, sessionid, value=""){
	
		self::create([

			'genesis_hash' => $genesis_hash,

			'hash' => $curr_hash,

			'chunk_idx' => $curr_chunk_idx

		]);
		
		$this->save();

	}

}

//manually test

?>