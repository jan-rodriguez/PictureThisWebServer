/*
USER ROUTES
*/
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


/* GET all the challenges the user created*/
router.get('/:user_id(\\d+)/challenge/challenger', function(req, res, next) {

  var user_id = mysql.escape(req.params.user_id);

  var conn = mysql.createConnection(conn_params);

  conn.connect(function(err){
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " SELECT challenger.username AS challenger_username, challenged.username AS challenged_username, challenges.id AS challenge_id, challenges.pic_path, challenges.latitude, challenges.longitude \
                  FROM challenges \
                  JOIN user AS challenger\
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  WHERE challenges.active='1' \
                    AND challenges.challenger_id="+user_id;

    conn.query(query, function(err, result) {
      if(err){
        console.log("*************Failed to get user challenger**********");
        console.log(err.code);
        res.json({error: "Failed to get user created challenges"});
        return;
      }
      res.json({
        total_hits:  result.length,
        result:      result
      });
    });

    conn.end();
  });
});

/* GET all the challenges the user received*/
router.get('/:user_id(\\d+)/challenge/challenged', function(req, res, next) {

  var user_id = mysql.escape(req.params.user_id);

  var conn = mysql.createConnection(conn_params);

  conn.connect(function(err){
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " SELECT challenger.username AS challenger_username, challenged.username AS challenged_username, challenges.id AS challenge_id, challenges.pic_path, challenges.latitude, challenges.longitude \
                  FROM challenges \
                  JOIN user AS challenger\
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  WHERE challenges.active='1' \
                    AND challenges.challenged_id="+user_id;

    conn.query(query, function(err, result) {
      if(err){
        console.log("*************Failed to get user challenger**********");
        console.log(err.code);
        res.json({error: "Failed to get user created challenges"});
        return;
      }
      res.json({
        total_hits:  result.length,
        result:      result
      });
    });

    conn.end();
  });
});

/* GET all users */
router.get('/all', function(req, res, next) {

  var conn = mysql.createConnection(conn_params);

  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = "SELECT id, username FROM user";

    conn.query(query, function(err, result) {
      if(err) {
        console.error("********Failed to get all users**********");
        console.log(err.code);
        res.json({error: "Failed to get all users"});
        return;
      }

      //Return result to user
      res.json({
        total_hits:  results.length,
        result:      result
      });
    });

    conn.end();
  });
});

/* POST create user */
router.post('/new', function(req, res, next) {

  var username = req.body.username;
  var password = req.body.password;

  //Make sure both username and password are specified
  if(!username || !password) {
    res.json ({error: "Please specify both username and password"});
    return;
  }

  //SQL INJECTION SHALL NOT PASS!!!
  var username = mysql.escape(username);
  var password = mysql.escape(password);

  var conn = mysql.createConnection(conn_params);

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = "INSERT INTO user (username, password) VALUES ("+username+", "+password+")";
    conn.query(query, function (err, result) {
      if(err) {
        //Duplicate code
        if(err.code === "ER_DUP_ENTRY") {
          res.json({error: "Username already exists."});
        }else{
          console.error("********Failed to insert user**********");
          console.error(err.code);
          res.json({error: "Failed to insert user to table"});
        }
        return;
      }
      res.json({user_id: result.insertId});
    });

    conn.end();
  });

});


/* POST get user id given password and username */
router.post('/login', function(req, res, next) {

  var username = req.body.username;
  var password = req.body.password;

  //Make sure both username and password are specified
  if(!username || !password) {
    res.json ({error: "Please specify both username and password"});
    return;
  }

  //SQL INJECTION SHALL NOT PASS!!!
  var username = mysql.escape(username);
  var password = mysql.escape(password);

  var conn = mysql.createConnection(conn_params);

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " SELECT id \
                  FROM user \
                  WHERE username ="+username+" \
                  AND password="+password;
    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get user**********");
        console.error(err.code);
        res.json({error: "Failed to insert user to table"});
        return;
      }
      //User found
      if(result.length > 0) {
        res.json(result[0]);
      }else{
        res.json({error: "No user found matching given username and password."});
      }
    });

    conn.end();
  });

});

module.exports = router;
