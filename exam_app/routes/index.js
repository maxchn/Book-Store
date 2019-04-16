const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.join("..", 'db'));

router.get('/', async (req, res) => {

  try {
    res.render('index', {
      title: 'Home',
      user: req.user
    });
  } catch (err) {
    console.log('Error (/index):');
    console.error(err);

    res.render('index', {
      title: 'Home',
      user: req.user
    });
  }
});

module.exports = router;