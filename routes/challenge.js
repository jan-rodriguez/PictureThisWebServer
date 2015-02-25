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

    var query = "SELECT user.username, challenged_id, pic_path, latitude, longitude \
                  FROM challenges \
                  JOIN user \
                  ON challenges.challenger_id = user.id \
                  WHERE challenges.id="+chall_id;
    var challenged_id;
    var final_result;

    conn.query(query, function (err, result) {
      if(err) {
        console.error("********Failed to get challenge**********");
        console.error(err.code);
        res.json({error: "Failed to get challenge with id "+chall_id});
        return;
      }

      //Assure there's a result
      if(result.length > 0){
        final_result = result[0];
        final_result.challenger_username = final_result.username;
        challenged_id = final_result.challenged_id;

        //Remove unnecessary fields
        delete final_result.username;
        delete final_result.challenged_id;

        //Get the challenged usersname
        query = " SELECT username \
                  FROM user \
                  WHERE user.id="+challenged_id;
        conn.query(query, function(err, result){
          if(err) {
            console.error("********Failed to get challenge**********");
            console.error(err.code);
            res.json({error: "Failed to get challenged for challenge"});
            return;
          }

          if(result.length > 0) {
            final_result.challenged_username = result[0].username;
          }else{
            res.json({error:"Couldn't find challenged from challange's challenged_id."});
            return;
          }
          res.json(final_result);
        });



      }else{
        res.json({error:"Failed to find challenge with id "+chall_id+" beacause it doesn't exist"});
        return;
      }
    });

  });

});

/* POST home page. */
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
      //TODO: GET RID OF THIS
    });


    conn.end();
  });
});




module.exports = router;
