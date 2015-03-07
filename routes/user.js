/*
USER ROUTES
*/
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var conn_params = {
    host    : "ec2-52-1-159-248.compute-1.amazonaws.com",
    user    : "root",
    password: "picturethis123",
    port    : 3306,
    database: "picture_this",
  };


/* GET all the challenges the user created*/
router.get('/:user_id(\\d+)/challenge/challenger', function(req, res, next) {

  var user_id = mysql.escape(req.params.user_id);

  var conn = mysql.createConnection(conn_params);

  //Variables keeping track of what fields of the response have been populated
  var got_done, got_action_required, got_waiting = false;

  var final_result = {};

  conn.connect(function(err){
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    //Get all DISTINCT challenges with pending responses
    var action_required_query = " SELECT DISTINCT challenges.id AS challenge_id, challenger.username AS challenger_username, challenged.username AS challenged_username, challenges.pic_path, challenges.latitude, challenges.longitude, challenges.start_date, challenges.title \
                  FROM challenges \
                  JOIN user AS challenger\
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  JOIN responses \
                    ON (responses.challenge_id=challenges.id \
                    AND responses.status='pending') \
                  WHERE challenges.active='1' \
                    AND challenges.challenger_id="+user_id+" \
                    AND responses.id = \
                      (SELECT MAX(id) FROM responses WHERE responses.challenge_id=challenges.id)";

    conn.query(action_required_query, function(err, result){
      if(err){
        console.log("*************Failed to get user challenger with action required**********");
        console.log(err);
        res.json({error: "Failed to get user created challenges"});
        return;
      }

      result.forEach(function(elt, index){
        //Nicely format the start dates for challenges
        elt.start_date = new Date(elt.start_date).toDateString();
      });

      //Set the list of action required
      final_result.action_required = {
        total_hits: result.length,
        result:     result
      };

      got_action_required = true;

      sendFinalResult();

    });

    //Select all active challenges with either declined responses or no responses
    var waiting_query = " SELECT DISTINCT challenges.id AS challenge_id, challenger.username AS challenger_username, challenged.username AS challenged_username, challenges.pic_path, challenges.latitude, challenges.longitude, challenges.start_date, challenges.title \
                  FROM challenges \
                  JOIN user AS challenger\
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  LEFT OUTER JOIN responses \
                    ON responses.status='declined' \
                  WHERE challenges.active='1' \
                    AND challenges.challenger_id="+user_id+" \
                    AND (responses.id = \
                      (SELECT MAX(id) FROM responses WHERE responses.challenge_id=challenges.id) \
                      OR (SELECT MAX(id) FROM responses WHERE responses.challenge_id=challenges.id) IS NULL)";

    conn.query(waiting_query, function(err, result){
      if(err){
        console.log("*************Failed to get user challenger with waiting required**********");
        console.log(err);
        res.json({error: "Failed to get user created challenges"});
        return;
      }

      result.forEach(function(elt, index){
        //Nicely format the start dates for challenges
        elt.start_date = new Date(elt.start_date).toDateString();
      });

      //Set the list of waiting challenges
      final_result.waiting = {
        total_hits: result.length,
        result:     result
      };

      got_waiting = true;

      sendFinalResult();

    });

    //Select all challenges with an accepted response and is not dismissed by challenger
    var done_query = " SELECT DISTINCT challenges.id AS challenge_id, challenger.username AS challenger_username, challenged.username AS challenged_username, challenges.pic_path, challenges.latitude, challenges.longitude, challenges.start_date, challenges.title \
                  FROM challenges \
                  JOIN user AS challenger\
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  JOIN responses \
                    ON (responses.challenge_id=challenges.id \
                    AND responses.status='accepted') \
                  WHERE challenges.challenger_id="+user_id+" \
                    AND challenges.active='0' \
                    AND challenges.challenger_dismissed='0'" ;

    conn.query(done_query, function(err, result){
      if(err){
        console.log("*************Failed to get user challenger that are done**********");
        console.log(err);
        res.json({error: "Failed to get user created challenges"});
        return;
      }

      result.forEach(function(elt, index){
        //Nicely format the start dates for challenges
        elt.start_date = new Date(elt.start_date).toDateString();
      });

      //Set the list of waiting challenges
      final_result.done = {
        total_hits: result.length,
        result:     result
      };

      got_done = true;

      sendFinalResult();
    });


    //Call back to send final result
    function sendFinalResult() {
      //Only send once all the results have been set
      if(got_done && got_waiting && got_action_required) {
        res.json(final_result);
      }
    }

    conn.end();
  });
});

/* GET all the challenges the user received*/
router.get('/:user_id(\\d+)/challenge/challenged', function(req, res, next) {

  var user_id = mysql.escape(req.params.user_id);

  var conn = mysql.createConnection(conn_params);

  //Variables keeping track of what fields of the response have been populated
  var got_done, got_action_required, got_waiting = false;

  var final_result = {};

  conn.connect(function(err){
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    //Get all DISTINCT challenges with declined responses or no responses
    var action_required_query = " SELECT DISTINCT challenges.id AS challenge_id, challenger.username AS challenger_username, challenged.username AS challenged_username, challenges.pic_path, challenges.latitude, challenges.longitude, challenges.start_date, challenges.title \
                  FROM challenges \
                  JOIN user AS challenger\
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  LEFT JOIN responses \
                    ON (responses.challenge_id=challenges.id \
                    AND responses.status='declined') \
                  WHERE challenges.active='1' \
                    AND challenges.challenged_id="+user_id+" \
                    AND (responses.id = \
                      (SELECT MAX(id) FROM responses WHERE responses.challenge_id=challenges.id) \
                      OR (SELECT MAX(id) FROM responses WHERE responses.challenge_id=challenges.id) IS NULL)";

    conn.query(action_required_query, function(err, result){
      if(err){
        console.log("*************Failed to get user challenger with action required**********");
        console.log(err);
        res.json({error: "Failed to get user created challenges"});
        return;
      }

      result.forEach(function(elt, index){
        //Nicely format the start dates for challenges
        elt.start_date = new Date(elt.start_date).toDateString();
      });

      //Set the list of action required
      final_result.action_required = {
        total_hits: result.length,
        result:     result
      };

      got_action_required = true;

      sendFinalResult();

    });

    //Select all active challenges with pending reponses
    var waiting_query = " SELECT DISTINCT challenges.id AS challenge_id, challenger.username AS challenger_username, challenged.username AS challenged_username, challenges.pic_path, challenges.latitude, challenges.longitude, challenges.start_date, challenges.title \
                  FROM challenges \
                  JOIN user AS challenger\
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  JOIN responses \
                    ON (responses.challenge_id=challenges.id \
                    AND responses.status='pending') \
                  WHERE challenges.active='1' \
                    AND challenges.challenged_id="+user_id+" \
                    AND responses.id = \
                      (SELECT MAX(id) FROM responses WHERE responses.challenge_id=challenges.id)";

    conn.query(waiting_query, function(err, result){
      if(err){
        console.log("*************Failed to get user challenger with waiting required**********");
        console.log(err);
        res.json({error: "Failed to get user created challenges"});
        return;
      }

      result.forEach(function(elt, index){
        //Nicely format the start dates for challenges
        elt.start_date = new Date(elt.start_date).toDateString();
      });

      //Set the list of waiting challenges
      final_result.waiting = {
        total_hits: result.length,
        result:     result
      };

      got_waiting = true;

      sendFinalResult();

    });

    //Select all challenges with an accepted response and is not dismissed by challenged
    var done_query = " SELECT DISTINCT challenges.id AS challenge_id, challenger.username AS challenger_username, challenged.username AS challenged_username, challenges.pic_path, challenges.latitude, challenges.longitude, challenges.start_date, challenges.title \
                  FROM challenges \
                  JOIN user AS challenger\
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  JOIN responses \
                    ON (responses.challenge_id=challenges.id \
                    AND responses.status='accepted') \
                  WHERE challenges.challenged_id="+user_id+" \
                    AND challenges.active='0' \
                    AND challenges.challenged_dismissed='0'" ;

    conn.query(done_query, function(err, result){
      if(err){
        console.log("*************Failed to get user challenger that are done**********");
        console.log(err);
        res.json({error: "Failed to get user created challenges"});
        return;
      }

      result.forEach(function(elt, index){
        //Nicely format the start dates for challenges
        elt.start_date = new Date(elt.start_date).toDateString();
      });

      //Set the list of waiting challenges
      final_result.done = {
        total_hits: result.length,
        result:     result
      };

      got_done = true;

      sendFinalResult();
    });


    //Call back to send final result
    function sendFinalResult() {
      //Only send once all the results have been set
      if(got_done && got_waiting && got_action_required) {
        res.json(final_result);
      }
    }

    conn.end();
  });
});

/* GET all users */
router.get('/all', function(req, res, next) {

  var user_id = req.headers.user_id;

  if(!user_id){
    res.json({error: "User id must be specified."});
    return;
  }

  //Sql-me-not
  user_id = mysql.escape(user_id);

  var conn = mysql.createConnection(conn_params);

  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " SELECT id, username \
                    FROM user \
                  WHERE id!="+user_id;

    conn.query(query, function(err, result) {
      if(err) {
        console.error("********Failed to get all users**********");
        console.log(err.code);
        res.json({error: "Failed to get all users"});
        return;
      }

      //Return result to user
      res.json({
        total_hits:  result.length,
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


router.post('/:user_id(\\d+)/challenge/:chall_id(\\d+)/hide', function(req, res, next) {

  var user_id = mysql.escape(req.params.user_id);
  var chall_id = mysql.escape(req.params.chall_id);

  var conn = mysql.createConnection(conn_params);

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    //Update appropriate challenger field ONLY WORKS ON INACTIVE OR COMPLETED CHALLENGES
    var query = " UPDATE challenges \
                    SET challenged_dismissed = CASE WHEN (challenged_id="+user_id+") THEN '1' ELSE challenged_dismissed END, \
                        challenger_dismissed = CASE WHEN (challenger_id="+user_id+") THEN '1' ELSE challenger_dismissed END \
                  WHERE id="+chall_id+" \
                    AND active='0'";

    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get user**********");
        console.error(err);
        res.json({error: "Failed to dismiss challenge"});
        return;
      }

      res.sendStatus(200);
    });
    conn.end();
  });
});

module.exports = router;
