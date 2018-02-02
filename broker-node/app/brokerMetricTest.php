<?php

use App\ChunkEvents;




$hook_node_id = "1";
$session_id = "1";
$event_name = "attached";
$value =  "";


$response  = ChunkEvents::addChunkEvent(event_name, hook_id, sessionid, value);

print(response);



?>