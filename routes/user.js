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
  var conn = mysql.createConnection({
    host    : "localhost",
    user    : "root",
    password: "root",
    port    : 3306,
    database: "picture_this",
    connectTimeout : 30000
  });

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.send("Failed to connect");
      return;
    }
    console.log('connected as id ' + conn.threadId);
    res.send("Connected");
  });

  console.log("Hey bb");
  conn.end()
});

module.exports = router;