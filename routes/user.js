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
    host    : "ec2-52-1-159-248.compute-1.amazonaws.com",
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
      conn.end();
      return;
    }
    console.log('connected as id ' + conn.threadId);
    conn.query("INSERT INTO user (username, password) VALUES ('testing', 'test')", function (err, result) {
      if(err) {
        console.error("********Failed to insert user**********");
        console.error(err);
      }
      console.log(result);
    });
    conn.end();
  });

  console.log("Hey bb");

});

module.exports = router;