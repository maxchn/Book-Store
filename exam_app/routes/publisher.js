const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.join("..", 'db'));

router.get('/index', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    try {
        let result = await db.query('SELECT p.id, p.name, a.street, c.name as `country`, s.name as `state`, ct.name as `city` FROM `publisher` as p INNER JOIN `address` as a ON p.address_id = a.id INNER JOIN `country` as c ON c.id = a.country_id INNER JOIN `state` as s ON s.id = a.state_id INNER JOIN `city` as ct ON ct.id = a.city_id', []);

        for (let item of result) {
            let phones = await db.query('SELECT * FROM `phone` WHERE `publisher_id`=?', [item.id]);
            item.phones = phones;
        }

        res.render('index_publisher', {
            title: 'Index - Publishers',
            publishers: result,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/publisher/index):');
        console.error(err);

        res.render('index_publisher', {
            title: 'Index Publishers',
            publishers: [],
            user: req.user
        });
    }
});

router.get('/create', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    try {
        let countries = await db.query('SELECT * FROM `country`');
        let states = await db.query('SELECT * FROM `state`');
        let cities = await db.query('SELECT * FROM `city`');

        res.render('create_publisher', {
            title: 'Create Publisher',
            countries: countries,
            states: states,
            cities: cities,
            user: req.user
        });
    } catch (err) {
        res.render('create_publisher', {
            title: 'Create Publisher',
            countries: [],
            states: [],
            cities: [],
            user: req.user
        });
    }
});

router.post('/create', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let publisher = {
        name: req.body.name,
        phones: req.body.phones,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        street: req.body.street
    };

    if (!validate(publisher)) {
        showError(res);
        return;
    }

    try {
        await db.query('START TRANSACTION;', []);

        let countryId = await findOrCreate('country', publisher.country);
        let stateId = await findOrCreate('state', publisher.state);
        let cityId = await findOrCreate('city', publisher.city);

        let createAddressResult = await db.query('INSERT INTO `address`(country_id, state_id, city_id, street) VALUES(?,?,?,?);',
            [countryId, stateId, cityId, publisher.street]);

        let result = await db.query('INSERT INTO `publisher`(`name`, `address_id`) VALUES(?,?);',
            [publisher.name, createAddressResult.insertId]);

        if (result && result.insertId > 0) {
            if (publisher.phones) {
                if (publisher.phones instanceof Array) {
                    for (let phone of publisher.phones) {
                        await db.query('INSERT INTO `phone`(`phone_number`, `publisher_id`) VALUES(?,?)', [phone, result.insertId]);
                    }
                } else {
                    await db.query('INSERT INTO `phone`(`phone_number`, `publisher_id`) VALUES(?,?)', [publisher.phones, result.insertId]);
                }
            }
        }

        await db.query('COMMIT;', []);
        res.status(201).send(null);
    } catch (err) {
        await db.query('ROLLBACK;', []);

        console.log('Error (/publisher/create):');
        console.error(err);

        res.status(400).send('This entry already exists. Please, enter another entry.');
    }
});

router.get('/update/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let publisher_id = req.params.id;

    try {
        let countries = await db.query('SELECT * FROM `country`');
        let states = await db.query('SELECT * FROM `state`');
        let cities = await db.query('SELECT * FROM `city`');
        let result = await db.query('SELECT p.id, p.name, a.id as `address_id`, a.street, c.name as `country`, s.name as `state`, ct.name as `city` FROM `publisher` as p INNER JOIN `address` as a ON p.address_id = a.id INNER JOIN `country` as c ON c.id = a.country_id INNER JOIN `state` as s ON s.id = a.state_id INNER JOIN `city` as ct ON ct.id = a.city_id WHERE p.id=?', [publisher_id]);

        res.render('update_publisher', {
            title: 'Update Publisher',
            publisher: result[0],
            countries: countries,
            states: states,
            cities: cities,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/publisher/update):');
        console.error(err);

        res.redirect('/publisher/index');
    }
});

router.post('/update', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let publisher = {
        id: req.body.id,
        name: req.body.name,
        phones: req.body.phones,
        address_id: req.body.address_id,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        street: req.body.street
    };

    if (!validate(publisher)) {
        showError(res);
        return;
    }

    try {
        await db.query('START TRANSACTION;', []);

        await db.query('UPDATE `publisher` SET `name`=? WHERE `id`=?;',
            [publisher.name, publisher.id]);

        let countryId = await findOrCreate('country', publisher.country);
        let stateId = await findOrCreate('state', publisher.state);
        let cityId = await findOrCreate('city', publisher.city);

        await db.query('UPDATE `address` SET `country_id`=?, `state_id`=?, `city_id`=?, `street`=? WHERE `id`=?;',
            [countryId, stateId, cityId, publisher.street, publisher.address_id]);

        await db.query('DELETE FROM `phone` WHERE publisher_id=?;', [publisher.id]);

        if (publisher.phones instanceof Array) {
            for (let phone of publisher.phones) {
                await db.query('INSERT INTO `phone`(`phone_number`, `publisher_id`) VALUES(?,?)', [phone, publisher.id]);
            }
        } else {
            await db.query('INSERT INTO `phone`(`phone_number`, `publisher_id`) VALUES(?,?)', [publisher.phones, publisher.id]);
        }

        await db.query('COMMIT;', []);
        res.status(200).send(null);
    } catch (err) {
        await db.query('ROLLBACK;', []);

        console.log('Error (/publisher/update):');
        console.error(err);

        res.status(400).send('This entry already exists. Please, enter another entry!!!');
    }
});

router.get('/delete/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let publisher_id = req.params.id;

    try {
        await db.query('START TRANSACTION;', []);

        await db.query('DELETE FROM `phone` WHERE `publisher_id`=?;', [publisher_id]);
        await db.query('DELETE FROM `publisher` WHERE `id`=?;', [publisher_id]);

        await db.query('COMMIT;', []);
        res.redirect(301, '/publisher/index');
    } catch (err) {
        await db.query('ROLLBACK;', []);

        console.log('Error (/publisher/delete):');
        console.error(err);

        res.redirect(301, '/publisher/index');
    }
});

router.get('/get_phones/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let publisher_id = req.params.id;

    try {
        let result = await db.query('SELECT * FROM `phone` WHERE `publisher_id`=?', [publisher_id]);

        res.status(200).send(result);
    } catch (err) {
        console.log('Error (/publisher/update):');
        console.error(err);

        res.status(400).send(null);
    }
});

function validate(publisher) {
    if (!publisher.name || !publisher.name.trim()) {
        return false;
    }

    if (!publisher.country || !publisher.country.trim()) {
        return false;
    }

    if (!publisher.state || !publisher.state.trim()) {
        return false;
    }

    if (!publisher.city || !publisher.city.trim()) {
        return false;
    }

    if (!publisher.street || !publisher.street.trim()) {
        return false;
    }

    if (publisher.phones) {
        if (publisher.phones instanceof Array) {
            for (let phone of publisher.phones) {
                if (!phone || !phone.trim()) {
                    return false;
                }
            }
        } else {
            if (!publisher.phones || !publisher.phones.trim()) {
                return false;
            }
        }
    }

    return true;
}

function showError(res) {
    res.status(400).send('Not all required fields have been completed!!!');
}

async function findOrCreate(tableName, value) {
    try {
        let sql = `SELECT * FROM \`${tableName}\` WHERE \`name\` LIKE ?`;
        let result = await db.query(sql, ['%' + value + '%']);

        if (result && result.length > 0) {
            return result[0].id;
        } else {
            throw Error('Not Found!!!');
        }
    } catch (err) {
        try {
            let result = await db.query(`INSERT INTO \`${tableName}\`(name) VALUES(?);`, [value]);

            if (result && result.insertId > 0) {
                return result.insertId;
            }
        } catch (e) {
            return -1;
        }
    }
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