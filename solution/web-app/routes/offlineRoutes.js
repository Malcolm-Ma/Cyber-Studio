/**
 * @file offline routes
 * @author Mingze Ma
 */

var express = require('express');
var router = express.Router();

router.get('/not_found', (req, res) => {
  res.render('not_found', { title: 'Not Found' });
});

router.get('/check_network', (req, res) => {
  res.json({ online: true });
});

module.exports = router;
