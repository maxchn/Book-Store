const express = require('express');
const router = express.Router();
const passport = require('passport');
const path = require('path');
const db = require(path.join("..", 'db'));
const md5 = require('md5');

router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Registration',
        user: req.user
    });
});

router.post('/register', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let confirPassword = req.body.confirmpassword;

    if (!username.trim()) {
        showRegisterError('Username must not be empty!!!');
        return;
    }

    if (!password.trim()) {
        showRegisterError('Password must not be empty!!!');
        return;
    }

    if (password != confirPassword) {
        showRegisterError('Passwords do not match!!!');
        return;
    }

    try {
        await db.query('INSERT INTO `user`(`username`, `password`, `role`) VALUES(?,?,?);', [username, md5(password), 'user']);

        res.redirect('/account/login');
    } catch (err) {
        console.log('Error (/register):');
        console.error(err);

        res.render('register', {
            title: 'Registration',
            error: 'A user with the specified name already exists. Enter another name.',
            user: req.user
        });
    }
});

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Log in',
        user: req.user
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/account/login?error=Wrong login or password.'
}), (req, res) => {
    res.locals.user = req.user;
    res.redirect('/');
});

router.get('/logout', function (req, res) {
    req.session.destroy();
    req.logOut();
    res.redirect('/account/login');
});

function showRegisterError(err, res) {
    res.render('register', {
        title: 'Registration',
        error: err,
        user: req.user
    });
}
module.exports = router;