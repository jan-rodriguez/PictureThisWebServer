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
router.post('/new', function(req, res, next) {
  console.log(req.body);  

  var username = req.body.username;
  var password = req.body.password;

  //Make sure both username and password are specified
  if(!username || !password) {
    res.json ({error: "Please specify both username and password"});
    return;
  }

  var conn = mysql.createConnection({
    host    : "localhost",
    user    : "root",
    password: "root",
    port    : 3306,
    database: "picture_this",
  });

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }
    conn.query("INSERT INTO user (username, password) VALUES ('"+username+"', '"+password+"')", function (err, result) {
      if(err) {
        //Duplicate code
        if(err.code === "ER_DUP_UNIQUE") {
          res.json({error: "Username already exists."});
        }else{
          console.error("********Failed to insert user**********");
          console.error(err.code);
          res.json({error: "Failed to insert user to table"});
        }
        return;
      }
      res.json({user_id: result.insertId});
      console.log(result);
    });
    conn.end();
  });


});

module.exports = router;
