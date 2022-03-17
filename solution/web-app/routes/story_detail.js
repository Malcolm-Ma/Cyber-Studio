var express = require('express')
var router = express.Router()

router.get('/', function(req, res, next) {
    res.render('story_detail');
  });
  
  module.exports = router;