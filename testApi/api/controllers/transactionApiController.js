//refactor later
const IOTA = require('iota.lib.js');
const mysql = require('mysql2');
const uuidv4 = require('uuid/v4');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('default', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: true
    },
});

const iota = new IOTA({
    'provider': 'http://localhost:14265'
});

const Transactions = require('../../../peer-db/models/transactions.js')(sequelize, Sequelize);

//API CALL 1:  ADD A PEER ID.
exports.add_peer_id = function (req, res) {

    //get peer id
    var peer_id = req.body.peerid;

    //move into DB object
    var con = connect();

    //the way the table is set up we are required to manually add the timestamps.
    //laravel adds them automatically.  Currently not using.
    var date1 = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var date2 = new Date().toISOString().slice(0, 19).replace('T', ' ');

    var id = uuidv4();

    //add peer sql
    var sql = "INSERT INTO default.PeerIds (id, peer_id, createdAt, updatedAt) VALUES (\"" + id + "\",\"" + peer_id + "\",\"" +
        date1 + "\",\"" + date2 + "\");";
    con.query(sql, function (err, result) {
        console.log(err);
        console.log("Added new peer id.");
        res.send("accepted");
    });
};

var tid = -1;

//API CALL 2:  REQUEST TO START A TRANSACTION
exports.start_transaction = function (req, res) {
    var need = req.body.need_requested;

    //FOR NOW WE JUST DO WEBNODES, SO WE GET THE LIST OF PEER IDS HERE.
    var date1 = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var date2 = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var con = connect();

    var id = uuidv4();
    //add transaction and get txid
    var sql = "INSERT INTO default.Transactions (transaction_id, need_requested, createdAt, updatedAt, item_selected_index) VALUES (\"" + id + "\",\"" + need + "\",\"" +
        date1 + "\",\"" + date2 + "\",\"-1\");";
    con.query(sql, function (err, result) {
        //get txid


        console.log(err);
        console.log(result);
        tid = id;

        console.log("Created transaction with id ", tid);

        //get items
        var con2 = connect();

        //get list of peers to send  We are not hashing yet.
        //move this into the function outlined below
        //though we might move this all to go in which case we would want '
        //to go through it again real fast after defining the parameters and return values for different api
        //calls

        var sql = "SELECT * FROM default.PeerIds;";
        var webnode_array = [];
        con2.query(sql, function (err, result) {
            //get txid
            console.log("listing webnodes ");

            console.log(result);
            result.forEach(function (element) {
                webnode_array.push(element.peer_id);
            });

            //console.log(result);
            console.log(webnode_array);
            //  console.log(result.insertId.toString());

            res.send({txid: tid, items: webnode_array});
            //return webnode_array;
        });
        console.log("possibleWebnodes");

        //console.log(possibleWebnodes);

    });


};


//API CALL 3:  TELL SELLER WHICH ITEM AND GET WORK
exports.item_selected = function (req, res) {

    //look up user in row
    var txid = req.body.txid;
    var ind = req.body.itemIndex;

    var con = connect();

    var sql = "SELECT * FROM default.Transactions WHERE id =\"" + txid + "\";";

    //var webnodes = getWebnodeAddresses();

    //console.log(webnodes);
    console.log("here");

    con.query(sql, function (err, result) {

        var update_transaction_sql = "UPDATE default.Transactions SET item_selected_index = \"" + ind + "\" WHERE transaction_id = \"" + txid + "\";";

        var another_connection = connect();

        another_connection.query(update_transaction_sql, function (err, result) {

            console.log("Purchaser has selected an item.  The transaction has been updated.");

            iota.api.getTransactionsToApprove(4, undefined, function (error, result) {
                if (error === undefined) {
                	
                	//GET WORK
                	
                	
                	//SELECT HOOKS
                	var hook_nodes = getHookNodeList();
                		
                		
                	
                    //TODO: GET SOME WORK FROM THE DATA MAP.
                    res.send({
                        message: 'THISCANSAYANYTHING',
                        address: 'SEWOZSDXOVIURQRBTBDLQXWIXOLEUXHYBGAVASVPZ9HBTYJJEWBR9PDTGMXZGKPTGSUDW9QLFPJHTIEQ',
                        trunkTransaction: result.trunkTransaction,
                        branchTransaction: result.branchTransaction,
                        broadcastingNodes: ['This is not done yet']

                        //Return the broadcasting nodes as well ^
                    });
                }
            });
        });

    });

};

function getHookNodeList(){
	var query = "Select * from default.hook_nodes LIMIT 5;";
	var connection = connect();
	
	connection.query(query, function (err, result){
			console.log(result);
		}
	);
}

exports.report_work_finished = function (req, res) {

    //TODO Confirm work is done.

    var txid = req.body.txid;
//	  
    var con = connect();
//
    var sql = "SELECT * FROM default.Transactions WHERE transaction_id =\"" + txid + "\";";
//	  
//	
    con.query(sql, function (err, result) {

        //we were dealing with the index of the need.  I want to change it so the web node passes the hash rather than
        //index though that also requires additional cpu cycles.

        //this is the need requested  LATER WE WILL SWITCH TO GET THE CUSTOMER'S LIST BASED ON ITEM TYPE.
        var need_type = result[0].need_requested;
        var item_selected_index = result[0].item_selected_index;
        var webnode_array = [];
//		    items = null;
//		    
//		    //TODO:  Add other item types, for now we can sell other webnode addresses
//		    //this means that each time someone logs in everyone else can purchase their items.
        //switch(need_type){
        //case "webnode_address":
        var connection = connect();

        var sql = "SELECT * FROM default.PeerIds;";

        var webnode_array = [];

        connection.query(sql, function (err, result) {

            result.forEach(function (element) {
                webnode_array.push(element.peer_id);
            });

            //return(webnode_array);
            var item = webnode_array[item_selected_index];
            res.send(item);

        });
        //}
//		      

//		    
//		    
//		    var update_transaction_sql = "UPDATE default.Transactions SET transaction_status  = \"TRANSACTION_COMPLETE\" WHERE transaction_id = "+txid+";"
//		    
//		    var another_connection = connect();
//		    
//		    //clunky programming,refactor into some sort of await thing.
//		    another_connection.query(update_transaction_sql, function(err, result){
//		    	
//		    	console.log("Purchaser has finished work.  The item is being sent.");
//		    	
//		    	//Send item
//		    	res.send(item);
//		    	});
//		      
//		    });


    });
}


function connect() {
    var con = mysql.createConnection({
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "root",
        db: "default"

    });
    return con;
}

function getWebnodeAddresses() {
    var connection = connect();

    var sql = "SELECT * FROM default.PeerIds;";

    var webnode_array = [];

    connection.query(sql, function (err, result) {

        result.forEach(function (element) {
            webnode_array.push(element.peer_id);
        });

        return (webnode_array);

    });
}

//function getWorkFromDatamap(){
//	
//	return { address: "SEWOZSDXOVIURQRBTBDLQXWIXOLEUXHYBGAVASVPZ9HBTYJJEWBR9PDTGMXZGKPTGSUDW9QLFPJHTIEQ", message: "THISCANSAYANYTHING" }
//}
