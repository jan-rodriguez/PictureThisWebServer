var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var conn_params = {
    host    : "ec2-52-1-159-248.compute-1.amazonaws.com",
    user    : "root",
    password: "root",
    port    : 3306,
    database: "picture_this",
  };

/* POST home page. */
router.post('/new', function(req, res, next) {

  var challenger_id = req.headers.challenger_id;
  var challenged_id = req.headers.challenged_id;
  var latitude = req.headers.latitude;
  var longitude = req.headers.longitude;
  var pic_path = req.files.fileUpload.path;

  if(!challenger_id || !challenged_id || !latitude || !longitude) {
    res.json({error: "Must specify challenger_id, challenged_id, latitude, and longitude."});
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
      //TODO: GET RID OF THIS
      console.log(result);
    });


    conn.end();
  });
});

module.exports = router;
