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

    var query = " SELECT user.id AS user_id, user.username, challenged_id, challenger_id, pic_path, latitude, longitude \
                  FROM challenges \
                  JOIN user \
                    ON challenges.challenger_id = user.id \
                    OR challenges.challenged_id = user.id \
                  WHERE challenges.id="+chall_id;

    var final_result = {};

    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get challenge**********");
        console.error(err.code);
        res.json({error: "Failed to get challenge with id "+chall_id});
        return;
      }

      if(result.length !== 2){
        res.json({error: "Failed to find correct number of users for challenge."});
        return;
      }

      final_result.pic_path = result[0].pic_path;
      final_result.latitude = result[0].latitude;
      final_result.longitude = result[0].longitude;

      //Set correct challenger and challenged usernames
      final_result.challenger_username = result[0].user_id === result[0].challenger_id ? result[0].username : result[1].username;
      final_result.challenged_username = result[0].user_id === result[0].challenged_id ? result[0].username : result[1].username;

      res.json(final_result);


    });

  });

});

/* POST create new challenge. */
router.post('/new', function(req, res, next) {

  var challenger_id = req.headers.challenger_id;
  var challenged_id = req.headers.challenged_id;
  var latitude = req.headers.latitude;
  var longitude = req.headers.longitude;
  var pic_path = req.files.fileUpload.path;

  // console.log(req);

  if(!challenger_id || !challenged_id || !latitude || !longitude) {
    res.json({error: "Must specify challenger_id, challenged_id, latitude, and longitude."});
    return;
  }

  //NO SQL INJECTION!!!
  challenger_id = mysql.escape(challenger_id);
  challenged_id = mysql.escape(challenged_id);
  latitude = mysql.escape(latitude);
  longitude = mysql.escape(longitude);
  pic_path = mysql.escape(pic_path.replace("public/", ""));

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

    var query = " SELECT DISTINCT user.id AS user_id, user.username, responses.pic_path, responses.status, challenges.challenged_id, challenges.challenger_id \
                  FROM responses \
                  JOIN challenges \
                    ON responses.challenge_id="+chall_id+" \
                  JOIN user \
                    ON user.id=challenges.challenger_id \
                    OR user.id=challenges.challenged_id \
                  WHERE responses.id="+resp_id;

    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get response**********");
        console.error(err.code);
        res.json({error: "Failed to get response from table."});
        return;
      }
      var final_result = {};

      if(result.length !== 2){
        res.json({error: "Failed to find correct number of users for the challenge."});
        return;
      }

      final_result.pic_path = result[0].pic_path;
      final_result.status = result[0].status;

      //Set correct challenger and challenged usernames
      final_result.challenger_username = result[0].user_id === result[0].challenger_id ? result[0].username : result[1].username;
      final_result.challenged_username = result[0].user_id === result[0].challenged_id ? result[0].username : result[1].username;

      res.json(final_result);

    });
  });
});

module.exports = router;
