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

//GET specific challenge
router.get('/:chall_id(\\d+)', function(req, res, next) {
 var conn = mysql.createConnection(conn_params);

 var chall_id = mysql.escape(req.params.chall_id);

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " SELECT challenged.username AS challenged_username, challenger.username AS challenger_username,  pic_path, latitude, longitude \
                  FROM challenges \
                  JOIN user AS challenger \
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  WHERE challenges.id="+chall_id;

    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get challenge**********");
        console.error(err.code);
        res.json({error: "Failed to get challenge with id "+chall_id});
        return;
      }

      res.json(result);

    });

    conn.end();
  });

});

/* POST create new challenge. */
router.post('/new', function(req, res, next) {

  var challenger_id = req.body.challenger_id;
  var challenged_id = req.body.challenged_id;
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  var pic_path = req.body.pic_path;

  if(!challenger_id || !challenged_id || !latitude || !longitude || !pic_path) {
    res.json({error: "Must specify challenger_id, challenged_id, pic_path, latitude, and longitude."});
    return;
  }

  //NO SQL INJECTION!!!
  challenger_id = mysql.escape(challenger_id);
  challenged_id = mysql.escape(challenged_id);
  latitude = mysql.escape(latitude);
  longitude = mysql.escape(longitude);
  pic_path = mysql.escape(pic_path);

  var conn = mysql.createConnection(conn_params);

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " INSERT INTO challenges \
                    (challenger_id, challenged_id, active, latitude, longitude, pic_path) \
                  VALUES \
                    ("+challenger_id+", "+challenged_id+", '1', "+latitude+", "+longitude+", "+pic_path+")";
    conn.query(query, function (err, result) {
      if(err) {
          console.error("********Failed to insert challenge**********");
          console.error(err.code);
          res.json({error: "Failed to insert challenge to table"});
          return;
        }

      res.json({challange_id: result.insertId});
    });

    conn.end();
  });
});

/**************RESPONSES*************/

//GET all responses to a challenge
router.get('/:chall_id(\\d+)/response/all', function(req, res, next){

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

    var query = " SELECT challenger.username AS challenger_username, challenged.username AS challenged_username, responses.pic_path, responses.status \
                  FROM challenges \
                  JOIN responses \
                    ON  responses.challenge_id=challenges.id \
                  JOIN user AS challenger \
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  WHERE challenges.id="+chall_id;
    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get response**********");
        console.error(err.code);
        res.json({error: "Failed to get response from table."});
        return;
      }

      res.json({
        total_hits: result.length,
        result:     result
      });
    });

    conn.end();
  });
});

//GET specific response
router.get('/:chall_id(\\d+)/response/:resp_id(\\d+)', function(req, res, next){

  var chall_id = mysql.escape(req.params.chall_id);
  var resp_id = mysql.escape(req.params.resp_id);

  var conn = mysql.createConnection(conn_params);

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " SELECT challenger.username AS challenger_username, challenged.username AS challenged_username, responses.pic_path, responses.status \
                  FROM responses \
                  JOIN challenges \
                    ON responses.challenge_id="+chall_id+" \
                  JOIN user AS challenger \
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  WHERE responses.id="+resp_id+" \
                  LIMIT 1";

    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get response**********");
        console.error(err.code);
        res.json({error: "Failed to get response from table."});
        return;
      }

      if(result.length === 0){
        res.json({error: "Failed to find response."});
        return;
      }

      res.json(result[0]);

    });

    conn.end();
  });
});

//GET most recent response to a challenge
router.get('/:chall_id(\\d+)/response/recent', function(req, res, next){

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

    var query = " SELECT responses.id AS response_id, challenger.username AS challenger_username, challenged.username AS challenged_username, responses.pic_path, responses.status \
                  FROM responses \
                  JOIN challenges \
                    ON responses.challenge_id=challenges.id \
                  JOIN user AS challenger \
                    ON challenger.id=challenges.challenger_id \
                  JOIN user AS challenged \
                    ON challenged.id=challenges.challenged_id \
                  WHERE responses.challenge_id="+chall_id+" \
                  ORDER BY responses.id DESC \
                  LIMIT 1";

    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get response**********");
        console.error(err.code);
        res.json({error: "Failed to get response from table."});
        return;
      }

      if(result.length === 0){
        res.json({error: "Failed to find response."});
        return;
      }

      res.json(result[0]);
    });

    conn.end();
  });
});

//POST accept or decline a specific response
router.post('/:chall_id(\\d+)/response/:resp_id(\\d+)', function(req, res, next){

  var decision = req.body.decision;
  var resp_id = mysql.escape(req.params.resp_id);
  var chall_id = mysql.escape(req.params.chall_id);

  if(!decision){
    res.json({error: "Must specify response decision."});
    return;
  }

  if(!(decision === 'accepted' || decision === 'declined')) {
    res.json({error: "Decision must be either 'accepted' or 'declined'"});
    return;
  }

  decision = mysql.escape(decision);

  var conn = mysql.createConnection(conn_params);

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " UPDATE responses \
                  SET status="+decision+" \
                  WHERE id="+resp_id;
    if(decision === 'accepted') {
      query += ";  UPDATE challenges \
                    SET active = '0' \
                  WHERE id="+chall_id;
    }

    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to update response**********");
        console.error(err.code);
        res.json({error: "Failed to update response."});
        return;
      }
      res.sendStatus(200);
    });

    conn.end();
  });
});


//POST create a new response for a given challenge
router.post('/:chall_id(\\d+)/response/new', function(req, res, next){

  var chall_id = mysql.escape(req.params.chall_id);
  var pic_path = req.body.pic_path;

  if(!pic_path) {
    res.json({erro: "You must specify a pic_path."});
    return;
  }

  //Sql-ize me captain!
  pic_path = mysql.escape(pic_path);

  var conn = mysql.createConnection(conn_params);

  //Open connection to database
  conn.connect(function(err) {
    if(err) {
      console.error(err.stack);
      res.json({error: "Failed to connect to database"})
      conn.end();
      return;
    }

    var query = " INSERT INTO responses \
                    (challenge_id, pic_path, status) \
                  VALUES ("+chall_id+", "+pic_path+", 'pending')";

    conn.query(query, function(err, result){
      if(err) {
        console.error("********Failed to create response**********");
        console.error(err.code);
        res.json({error: "Failed to create response."});
        return;
      }
      res.json({response_id: result.insertId});
    });

    conn.end();
  });

});

module.exports = router;
