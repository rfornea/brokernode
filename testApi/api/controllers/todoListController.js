
//'use strict';

//refactor later
var mysql = require('mysql');

//add peer id
exports.add_peer_id = function(req, res) {

  //get peer id
  var peer_id = req.query.peerid;

  //move into DB object
  var con = connect();

  //the way the table is set up we are required to manually add the timestamps.
  //laravel adds them automatically.  Currently not using.
  var date1 = new Date().toISOString().slice(0, 19).replace('T', ' ');
  var date2 = new Date().toISOString().slice(0, 19).replace('T', ' ');
  //add peer sql
  var sql = "INSERT INTO default.PeerIds (peer_id, createdAt, updatedAt) VALUES (\"" + peer_id + "\",\"" +
  		date1 + "\",\""+ date2 + "\");";
  con.query( sql, function(err, result){
	  console.log(err);
    console.log("Added new peer id.");
    res.send("accepted");
  });
};

var tid = -1;


exports.start_transaction = function(req, res) {
  var need = req.query.need;
  //FOR NOW WE JUST DO WEBNODES, SO WE GET THE LIST OF PEER IDS HERE.
  var date1 = new Date().toISOString().slice(0, 19).replace('T', ' ');
  var date2 = new Date().toISOString().slice(0, 19).replace('T', ' ');
  var con = connect();

  //add transaction and get txid
  var sql = "INSERT INTO default.Transactions (need_requested, createdAt, updatedAt) VALUES (\"" + need + "\",\"" +
  		date1 + "\",\""+ date2 + "\");";
  con.query( sql, function(err, result){
    //get txid


    tid = result.insertId;

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
    con2.query( sql, function(err, result){
      //get txid
      console.log("listing webnodes " );

      console.log(result);
      result.forEach(function(element) {
         webnode_array.push(element.peer_id);
      });

      //console.log(result);
      console.log(webnode_array);
    //  console.log(result.insertId.toString());

      res.send({ txid: tid, items: webnode_array});
      //return webnode_array;
    });
    console.log("possibleWebnodes");

    //console.log(possibleWebnodes);

  });


};


exports.need_selected = function(req, res) {

  //look up user in row
  var txid = req.query.txid;
  var ind = req.query.itemIndex;

  var con = connect();

  var sql = "SELECT * FROM default.Transactions WHERE id =\""+ txid + "\";";

  var webnodes = getWebnodeAddresses();

  console.log(webnodes);
  console.log("here");

  con.query( sql, function(err, result){
    //get txid
    console.log("Need has been selected");

    console.log(sql);
    
    //we were dealing with the index of the need.  I want to change it so the web node passes the hash rather than
    //index though that also requires additional cpu cycles.
 
    console.log(result[0].need_requested);

    //get webnode addresses
    var con2 = connect();

    var sql = "SELECT * FROM default.PeerIds;";
    var webnode_array = [];
    con2.query( sql, function(err, result){
      //get txid
      console.log("listing webnodes " );

      console.log(result);
      result.forEach(function(element) {
         webnode_array.push(element.peer_id);
      });

      //console.log(result);
      console.log(webnode_array);
    //  console.log(result.insertId.toString());

      res.send(webnode_array[ind]);
      //return webnode_array;
    });


  });

};


function connect(){
  var con = mysql.createConnection({
      host: "127.0.0.1",
      port:  3306,
      user: "root",
      password: "root",
      db: "default"

  });
  return con;
}

//use this in the functions above
function getWebnodeAddresses(){
  var con2 = connect();

  //add transaction and get txid
  var sql = "SELECT * FROM default.PeerIds;";
  var webnode_array = [];
  con2.query( sql, function(err, result){
    //get txid
    console.log("listing webnodes " );

    console.log(result);
    result.forEach(function(element) {
       webnode_array.push(element.peer_id);
    });

    //console.log(result);
    console.log(webnode_array);
  //  console.log(result.insertId.toString());

    return(webnode_array);
    //return webnode_array;
  });
}
