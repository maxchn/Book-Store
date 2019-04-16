const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.join("..", 'db'));

router.get('/get_all', async (req, res) => {
    try {
        let result = await db.query('SELECT * FROM `author`', []);

        res.status(200).send(result);
    } catch (err) {
        console.log('Error (/author/get_all):');
        console.error(err);

        res.status(400).send(null);
    }
});

router.get('/index', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    try {
        let results = await db.query('SELECT * FROM `author`', []);

        res.render('index_author', {
            title: 'Index - Authors',
            authors: results,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/author/index):');
        console.error(err);

        res.render('index_author', {
            title: 'Index - Authors',
            authors: [],
            user: req.user
        });
    }
});

router.get('/create', function (req, res) {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    res.render('create_author', {
        title: 'Create Author',
        user: req.user
    });
});

router.post('/create', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let user = {
        name: req.body.fullname
    };

    if (!validate(user)) {
        showError(res);
        return;
    }

    try {
        await db.query('INSERT INTO `author`(`full_name`) VALUES(?);', [user.name]);

        res.status(201).send(null);
    } catch (err) {
        console.log('Error (/author/create):');
        console.error(err);

        res.status(400).send('This entry already exists. Please, enter another entry.');
    }
});

router.get('/update/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let author_id = req.params.id;

    try {
        let result = await db.query('SELECT * FROM `author` WHERE `id`=?', [author_id]);

        res.render('update_author', {
            title: 'Update Author',
            author: result[0],
            user: req.user
        });
    } catch (err) {
        console.log('Error (/author/update):');
        console.error(err);

        res.redirect('/author/index');
    }
});

router.post('/update', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let user = {
        id: req.body.id,
        name: req.body.fullname
    };

    if (!validate(user)) {
        showError(res);
        return;
    }

    try {
        await db.query('UPDATE `author` SET `full_name`=? WHERE `id`=?;', [user.name, user.id]);

        res.status(200).send(null);
    } catch (err) {
        console.log('Error (/author/update):');
        console.error(err);

        res.status(400).send('This entry already exists. Please, enter another entry!!!');
    }
});

router.get('/delete/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let author_id = req.params.id;

    try {
        await db.query('DELETE FROM `author` WHERE `id`=?;', [author_id]);

        res.redirect(301, '/author/index');
    } catch (err) {
        console.log('Error (/author/delete):');
        console.error(err);

        res.redirect(301, '/author/index');
    }
});

function validate(user) {
    if (!user.name || !user.name.trim()) {
        return false;
    }

    return true;
}

function showError(res) {
    res.status(400).send('Not all required fields have been completed!!!');
}

function accessDenied(req) {
    if (!req.user) {
        return true;
    } else {
        if (req.user.role != 'admin') {
            return true;
        }
    }

    return false;
}

module.exports = router;