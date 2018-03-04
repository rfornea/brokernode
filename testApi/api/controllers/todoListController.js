
'use strict';

//refactor later
var mysql = require('mysql');

//create table of ids
exports.add_peer_id = function(req, res) {

  //get peer id
  var peer_id = req.query.peerid;

  //console.log(req);
  console.log(req.query.peerid);

  //until we refactor I will just make and dispose of connections
  var con = mysql.createConnection({
      host: "18.221.203.101:3306",
      user: "default",
      password: "secret"

  });

  var sql = "INSERT INTO testdb.peer_ids (peer_id) VALUES (\"" + peer_id + "\");";
  con.query( sql, function(err, result){
    //if(err) throw err;
    console.log(err);
    console.log("Added new peer id.");
    res.send("back");
  });
};

exports.start_transaction = function(req, res) {
  var need = req.params.need;
  res.send(need);
};


exports.need_selected = function(req, res) {
  Task.findById(req.params.taskId, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  })
};
