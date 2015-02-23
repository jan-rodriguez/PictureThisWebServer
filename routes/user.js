/*
USER ROUTES
*/
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
  res.json({hello: "world"});
});

/* GET all users */
router.get('/all', function(req, res, next) {
  res.json({hi: "there"});
});

module.exports = router;