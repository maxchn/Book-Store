const express = require('express');
const router = express.Router();
const path = require('path');
const db = require(path.join("..", 'db'));

router.get('/get_all', async (req, res) => {
    try {
        let result = await db.query('SELECT * FROM `category`', []);

        let categories = [];
        for (let item of result) {
            categories.push({
                id: item.id,
                name: item.name,
                full_name: calcCategoryFullName(item, result)
            });
        }

        res.status(200).send(categories);
    } catch (err) {
        console.log('Error (/category/get_all):');
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
        let result = await db.query('SELECT * FROM `category`', []);

        let categories = [];
        for (let item of result) {
            categories.push({
                id: item.id,
                name: item.name,
                full_name: calcCategoryFullName(item, result)
            });
        }

        res.render('index_category', {
            title: 'Index - Categories',
            categories: categories,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/category/index):');
        console.error(err);

        res.render('index_category', {
            title: 'Index - Categories',
            categories: [],
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
        let result = await db.query('SELECT * FROM `category`', []);

        let categories = [];
        for (let item of result) {
            categories.push({
                id: item.id,
                name: calcCategoryFullName(item, result)
            });
        }

        res.render('create_category', {
            title: 'Create category',
            categories: categories,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/category/create):');
        console.error(err);

        res.render('create_category', {
            title: 'Create category',
            categories: [],
            user: req.user
        });
    }
});

router.post('/create', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let category = {
        name: req.body.name,
        parent: req.body.parent
    };

    if (!validate(category)) {
        showError(res);
        return;
    }

    try {
        await db.query(`INSERT INTO \`category\`(name${category.parent == -1 ? '' : ', `parent_category_id`'}) VALUES(?${category.parent == -1 ? '' : ', ?'});`,
            category.parent == -1 ? [category.name] : [category.name, category.parent]);

        res.status(201).send(null);
    } catch (err) {
        console.log('Error (/category/create):');
        console.error(err);

        res.status(400).send('This entry already exists. Please, enter another entry.');
    }
});

router.get('/update/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let category_id = req.params.id;

    try {
        let result = await db.query('SELECT * FROM `category` WHERE `id`=?', [category_id]);
        let categoriesResults = await db.query('SELECT * FROM `category`', []);

        let categories = [];
        for (let item of categoriesResults) {
            categories.push({
                id: item.id,
                name: calcCategoryFullName(item, categoriesResults)
            });
        }

        res.render('update_category', {
            title: 'Update Category',
            category: result[0],
            categories: categories,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/category/update):');
        console.error(err);

        res.redirect('/category/index');
    }
});

router.post('/update', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let category = {
        id: req.body.id,
        name: req.body.name,
        parent: req.body.parent
    };

    if (!validate(category)) {
        showError(res);
        return;
    }

    try {
        if (category.parent == -1) {
            await db.query(`UPDATE \`category\` SET \`name\`=? WHERE \`id\`=?;`,
                [category.name, category.id]);
        } else {
            await db.query(`UPDATE \`category\` SET \`name\`=?, \`parent_category_id\`=? WHERE \`id\`=?;`,
                [category.name, category.parent, category.id]);
        }

        res.status(200).send(null);
    } catch (err) {
        console.log('Error (/category/update):');
        console.error(err);

        res.status(400).send('This entry already exists. Please, enter another entry.');
    }
});

router.get('/delete/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }
    
    let category_id = req.params.id;

    try {
        await db.query('DELETE FROM `category` WHERE `id`=?;', [category_id]);

        res.redirect(301, '/category/index');
    } catch (err) {
        console.log('Error (/category/delete):');
        console.error(err);

        res.redirect(301, '/category/index');
    }
});

function calcCategoryFullName(currentItem, result) {
    let fullName = '';

    if (currentItem.parent_category_id) {
        let parent_item = result.find(i => i.id == currentItem.parent_category_id);

        if (parent_item) {
            fullName += calcCategoryFullName(parent_item, result) + ' > ';
        }
    }

    fullName += currentItem.name;

    return fullName;
}

function validate(category) {
    if (!category.name || !category.name.trim()) {
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