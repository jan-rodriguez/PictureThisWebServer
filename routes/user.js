/*
USER ROUTES
*/
var express = require('express');
var router = express.Router();
var mysql = require('mysql');


/* GET home page. */
router.get('/:id(\\d+)', function(req, res, next) {
  res.json({hello: "world"});
});

/* GET all users */
router.get('/all', function(req, res, next) {
  res.json({hi: "there"});
});

/* POST create user */
router.get('/new', function(req, res, next) {
  res.send("hello");
  var conn = mysql.createConnection({
    host    : "localhost",
    user    : "root",
    password: "root",
    port    : 3306,
    database: "ops_db"

  });

  conn.connect(function(err) {
    if(err) {
      console.error("CONNECTION IS FAILING:" + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
  });

  console.log("Hey bb");
  conn.end()
});

module.exports = router;