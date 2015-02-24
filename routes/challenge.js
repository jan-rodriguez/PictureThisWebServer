var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var conn_params = {
    host    : "ec2-52-1-159-248.compute-1.amazonaws.com",
    user    : "root",
    password: "root",
    port    : 3306,
    database: "picture_this",
  };

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({hello: "world"});
});

module.exports = router;
