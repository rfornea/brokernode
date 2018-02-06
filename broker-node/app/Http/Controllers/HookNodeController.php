<?php

namespace App\Http\Controllers;

use App\HookNode;
use Illuminate\Http\Request;

class HookNodeController extends Controller
{
    
    //for recording chunk events
    public static $ChunkEventsRecord  = null;
    
    private static function initEventRecord()
    {
        if (is_null(self::$ChunkEventsRecord)) {
            self::$ChunkEventsRecord = new ChunkEvents();
        }
    }
    
    

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) {
        $ip_address = $request->input('ip_address');
        HookNode::insertNode($ip_address);

        return response('Success.', 204);
    }
    
    
    /**
     * Reports to the Broker that a chunk is attached.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function reportChunkFinished(Request $request)
    {
        $chunk_id = $request->input('chunk_id');
        $hook_id = $request->input('hook_id');
        
        self::initEventRecord();
        
        self::$ChunkEventsRecord->addHookNodeFinishedChunkEvent($hooknode['ip_address']);
        
        
        
        return response()->json("{\"blah\":\"3\"}");
    }
    
    
    
    
}
