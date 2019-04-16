const express = require('express');
const router = express.Router();
const uuidV1 = require('uuid/v1');
const fs = require('fs');
const path = require('path');
const db = require(path.join("..", 'db'));

router.get('/', async (req, res) => {
    let category_id = req.query.category;
    let author_id = req.query.author;
    let search = req.query.search;

    try {
        let categories = await db.query('SELECT * FROM `category`', []);

        let result = null;
        if (category_id) {
            result = await db.query("SELECT b.id, b.short_description, b.name, b.year_of_publishing, b.pages, b.isbn, b.price, p.name as 'publisher', c.id as 'category_id' FROM `book` as b INNER JOIN `publisher` as p ON b.publisher_id = p.id  INNER JOIN `category` as c ON b.category_id = c.id WHERE `category_id`=?", [category_id]);
        } else if (author_id) {
            result = await db.query("SELECT b.id, b.short_description, b.name, b.year_of_publishing, b.pages, b.isbn, b.price, p.name as 'publisher', c.id as 'category_id' FROM `book` as b INNER JOIN `publisher` as p ON b.publisher_id = p.id INNER JOIN `category` as c ON b.category_id = c.id INNER JOIN `book_author` as ba ON ba.book_id = b.id WHERE ba.author_id = ?", [author_id]);
        } else if (search) {
            result = await db.query(`SELECT DISTINCT b.id, b.short_description, b.description, b.name, b.year_of_publishing, b.pages, b.isbn, b.price, p.name as \`publisher\`, c.id as \`category_id\` 
            FROM \`book\` as b 
            INNER JOIN \`publisher\` as p 
            ON b.publisher_id = p.id 
            INNER JOIN \`category\` as c 
            ON b.category_id = c.id 
            INNER JOIN \`book_author\` as ba 
            ON ba.book_id = b.id 
            WHERE b.name LIKE ? 
            OR b.short_description LIKE ? 
            OR b.description LIKE ? 
            OR b.year_of_publishing=? 
            OR b.pages=?
            OR b.isbn LIKE ?
            OR b.price=? 
            OR p.name LIKE ?`, ['%' + search + '%', '%' + search + '%', '%' + search + '%', search, search, '%' + search + '%', search, '%' + search + '%']);
        } else {
            result = await db.query("SELECT b.id, b.short_description, b.name, b.year_of_publishing, b.pages, b.isbn, b.price, p.name as 'publisher', c.id as 'category_id' FROM `book` as b INNER JOIN `publisher` as p ON b.publisher_id = p.id  INNER JOIN `category` as c ON b.category_id = c.id", []);
        }

        for (let item of result) {
            let current_category = categories.find(i => i.id == item.category_id);

            if (current_category) {
                item.category = calcCategoryFullName(current_category, categories);
            }

            let authors = await db.query(`SELECT a.id, a.full_name FROM \`author\` as a INNER JOIN \`book_author\` as ba ON a.id = ba.author_id WHERE ba.book_id = ${item.id}`);
            item.authors = authors;

            let photos = await db.query('SELECT * FROM `photo` WHERE `book_id`=?', [item.id]);
            item.photos = photos;
        }

        res.status(200).send(result);
    } catch (err) {
        console.log('Error (/book/index):');
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
        let categories = await db.query('SELECT * FROM `category`', []);
        let result = await db.query("SELECT b.id, b.name, b.year_of_publishing, b.pages, b.isbn, b.price, p.name as 'publisher', c.id as 'category_id' FROM `book` as b INNER JOIN `publisher` as p ON b.publisher_id = p.id  INNER JOIN `category` as c ON b.category_id = c.id", []);

        for (let item of result) {
            let current_category = categories.find(i => i.id == item.category_id);

            if (current_category) {
                item.category = calcCategoryFullName(current_category, categories);
            }

            let authors = await db.query(`SELECT a.id, a.full_name FROM \`author\` as a INNER JOIN \`book_author\` as ba ON a.id = ba.author_id WHERE ba.book_id = ${item.id}`);
            item.authors = authors;
        }

        res.render('index_book', {
            title: 'Index - Books',
            books: result,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/book/index):');
        console.error(err);

        res.render('index_book', {
            title: 'Index - Books',
            books: [],
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
        let categories_raw = await db.query('SELECT * FROM `category`', []);
        let authors = await db.query('SELECT * FROM `author`', []);
        let publishers = await db.query('SELECT * FROM `publisher`', []);

        let categories = [];
        for (let item of categories_raw) {
            categories.push({
                id: item.id,
                name: calcCategoryFullName(item, categories_raw)
            });
        }

        res.render('create_book', {
            title: 'Create Book',
            categories: categories,
            authors: authors,
            publishers: publishers,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/book/index):');
        console.error(err);

        res.render('create_book', {
            title: 'Create Book',
            categories: [],
            authors: [],
            publishers: [],
            user: req.user
        });
    }
});

router.post('/create', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let book = {
        name: req.body.name,
        short_description: req.body.short_description,
        book_description: req.body.description,
        year_of_publishing: req.body.year_of_publishing,
        pages: req.body.pages,
        isbn: req.body.isbn,
        price: req.body.price,
        publisher_id: req.body.publisher,
        category_id: req.body.category,
        authors: req.body.authors,
        new_authors: req.body.new_authors
    };

    if (!validate(book)) {
        showError(res);
        return;
    }

    try {
        await db.query('START TRANSACTION;', []);

        let result = await db.query('INSERT INTO \`book\`(`name`, `short_description`, `description`, `year_of_publishing`, `pages`, `isbn`, `price`, `publisher_id`, `category_id`) VALUES(?,?,?,?,?,?,?,?,?);',
            [
                book.name,
                book.short_description,
                book.book_description,
                book.year_of_publishing,
                book.pages,
                book.isbn,
                book.price,
                book.publisher_id,
                book.category_id
            ]);

        if (result && result.insertId > 0) {
            if (book.authors instanceof Array) {
                for (let author of book.authors) {
                    try {
                        createRelationBookAuthor(result.insertId, author);
                    } catch (err) {
                        console.log('Error (/book/create):');
                        console.error(err);
                    }
                }
            } else {
                try {
                    createRelationBookAuthor(result.insertId, book.authors);
                } catch (err) {
                    console.log('Error (/book/create):');
                    console.error(err);
                }
            }

            if (book.new_authors) {
                if (book.new_authors instanceof Array) {
                    for (let author of book.new_authors) {
                        let resultAuthor = await db.query('INSERT INTO `author`(`full_name`) VALUES(?);', [author]);

                        if (resultAuthor && resultAuthor.insertId > 0) {
                            createRelationBookAuthor(result.insertId, resultAuthor.insertId);
                        }
                    }
                } else {
                    let resultAuthor = await db.query('INSERT INTO `author`(`full_name`) VALUES(?);', [book.new_authors]);

                    if (resultAuthor && resultAuthor.insertId > 0) {
                        createRelationBookAuthor(result.insertId, resultAuthor.insertId);
                    }
                }
            }

            if (req.files) {
                if (req.files.files instanceof Array) {
                    for (let file of req.files.files) {
                        createBookPhoto(file, result.insertId);
                    }
                } else {
                    createBookPhoto(req.files.files, result.insertId);
                }
            }
        }

        await db.query('COMMIT;', []);
        res.status(201).send(null);
    } catch (err) {
        await db.query('ROLLBACK;', []);

        console.log('Error (/book/create):');
        console.error(err);

        res.status(400).send('Create book is failed!!!');
    }
});

router.get('/update/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let book_id = req.params.id;

    try {
        let categories_raw = await db.query('SELECT * FROM `category`', []);
        let authors = await db.query('SELECT * FROM `author`', []);
        let publishers = await db.query('SELECT * FROM `publisher`', []);

        let categories = [];
        for (let item of categories_raw) {
            categories.push({
                id: item.id,
                name: calcCategoryFullName(item, categories_raw)
            });
        }

        res.render('update_book', {
            title: 'Update Book',
            id: book_id,
            categories: categories,
            authors: authors,
            publishers: publishers,
            user: req.user
        });
    } catch (err) {
        console.log('Error (/book/update):');
        console.error(err);

        res.redirect('/book/index');
    }
});

router.get('/:id', async (req, res) => {
    let book_id = req.params.id;

    try {
        let result = await db.query('SELECT * FROM `book` WHERE id=?', [book_id]);
        let authors = await db.query(`SELECT a.id, a.full_name FROM \`author\` as a INNER JOIN \`book_author\` as ba ON a.id = ba.author_id WHERE ba.book_id = ${book_id}`);
        result[0].authors = authors;
        let photos = await db.query('SELECT * FROM `photo` WHERE `book_id`=?', [book_id]);
        result[0].photos = photos;

        res.status(200).send(result[0]);
    } catch (err) {
        console.log('Error (/book/get_book):');
        console.error(err);

        res.redirect('/book/index');
    }
});

router.post('/update', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let book = {
        id: req.body.id,
        name: req.body.name,
        short_description: req.body.short_description,
        book_description: req.body.description,
        year_of_publishing: req.body.year_of_publishing,
        pages: req.body.pages,
        isbn: req.body.isbn,
        price: req.body.price,
        publisher_id: req.body.publisher,
        category_id: req.body.category,
        authors: req.body.authors,
        new_authors: req.body.new_authors
    };

    if (!validate(book)) {
        showError(res);
        return;
    }

    try {
        await db.query('START TRANSACTION;', []);

        await db.query('DELETE FROM `book_author` WHERE `book_id`=?;', [book.id]);

        if (book.new_authors) {
            if (book.new_authors instanceof Array) {
                for (let author of book.new_authors) {
                    let result = await db.query('INSERT INTO `author`(`full_name`) VALUES(?);', [author]);

                    if (result && result.insertId > 0) {
                        createRelationBookAuthor(book.id, result.insertId);
                    }
                }
            } else {
                let result = await db.query('INSERT INTO `author`(`full_name`) VALUES(?);', [book.new_authors]);

                if (result && result.insertId > 0) {
                    createRelationBookAuthor(book.id, result.insertId);
                }
            }
        }

        if (book.authors instanceof Array) {
            for (let author of book.authors) {
                createRelationBookAuthor(book.id, author);
            }
        } else {
            createRelationBookAuthor(book.id, book.authors);
        }

        await db.query('UPDATE \`book\` SET `name`=?, `short_description`=?, `description`=?, `year_of_publishing`=?, `pages`=?, `isbn`=?, `price`=?, `publisher_id`=?, `category_id`=? WHERE `id`=?;',
            [
                book.name,
                book.short_description,
                book.book_description,
                book.year_of_publishing,
                book.pages,
                book.isbn,
                book.price,
                book.publisher_id,
                book.category_id,
                book.id
            ]);

        // получаем все фото данной книги
        let files = await db.query('SELECT * FROM `photo` WHERE `book_id`=?', [book.id]);
        // получаем все айдишники фото
        let filesIds = req.body.files_ids;
        if (files && filesIds) {
            for (let file of files) {
                try {
                    if (filesIds instanceof Array) {
                        // если в списке айдишников отсутствует ид данной фотографии
                        // то фотографию необходимо удалить
                        if (!filesIds.find(i => i.id == file.id)) {
                            await db.query('DELETE FROM `photo` WHERE `id`=?;', [file.id]);
                            await removeFile(file);
                        }
                    } else {
                        // если айдишники не совпадают
                        // то фотографию необходимо удалить
                        if (file.id != filesIds) {
                            await db.query('DELETE FROM `photo` WHERE `id`=?;', [file.id]);
                            await removeFile(file);
                        }
                    }
                } catch (error) {
                    console.log('Error (/book/update):');
                    console.error(error);
                }
            }
        }

        if (req.files) {
            if (req.files.files instanceof Array) {
                for (let file of req.files.files) {
                    createBookPhoto(file, book.id);
                }
            } else {
                createBookPhoto(req.files.files, book.id);
            }
        }

        await db.query('COMMIT;', []);
        res.status(200).send(null);
    } catch (err) {
        await db.query('ROLLBACK;', []);

        console.log('Error (/book/update):');
        console.error(err);

        res.status(400).send('Update data is failed!!!');
    }

    try {
        const directory = path.resolve('.', 'tmp');

        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });
    } catch (err) {
        console.log('Error (clear temp folder):');
        console.error(err);
    }
});

router.get('/delete/:id', async (req, res) => {

    if (accessDenied(req)) {
        res.redirect('/account/login');
        return;
    }

    let book_id = req.params.id;
    let files = null;

    try {
        await db.query('START TRANSACTION;', []);

        // получаем все фото данной книги и удаляем их и с БД и с файлового хранилища
        files = await db.query('SELECT * FROM `photo` WHERE `book_id`=?', [book_id]);

        for (let file of files) {
            await db.query('DELETE FROM `photo` WHERE `id`=?;', [file.id]);
        }

        await db.query('DELETE FROM `book` WHERE `id`=?;', [book_id]);

        await db.query('COMMIT;', []);
        res.redirect(301, '/book/index');
    } catch (err) {
        await db.query('ROLLBACK;', []);

        console.log('Error (/book/delete):');
        console.error(err);

        res.redirect(301, '/book/index');
    }

    try {
        if (files) {
            for (let file of files) {
                await removeFile(file);
            }
        }
    } catch (err) {
        console.log('Error (/book/delete):');
        console.error(err);
    }
});

router.get('/details/:id', async (req, res) => {
    let book_id = req.params.id;

    try {
        let photos = await db.query('SELECT * FROM `photo` WHERE `book_id`=?', [book_id]);

        res.render('details_book', {
            title: 'Book Details',
            id: book_id,
            photos: photos,
            user: req.user
        });
    } catch (err) {
        res.render('details_book', {
            title: 'Book Details',
            id: book_id,
            photos: [],
            user: req.user
        });
    }
});

router.get('/load_full_book/:id', async (req, res) => {
    let book_id = req.params.id;

    try {
        let result = await db.query("SELECT b.id, b.name, b.short_description, b.description, b.year_of_publishing, b.pages, b.isbn, b.price, p.name as 'publisher', c.id as 'category_id' FROM `book` as b INNER JOIN `publisher` as p ON b.publisher_id = p.id  INNER JOIN `category` as c ON b.category_id = c.id WHERE b.id=?", [book_id]);

        let authors = await db.query(`SELECT a.id, a.full_name FROM \`author\` as a INNER JOIN \`book_author\` as ba ON a.id = ba.author_id WHERE ba.book_id = ${book_id}`);
        result[0].authors = authors;

        let photos = await db.query('SELECT * FROM `photo` WHERE `book_id`=?', [book_id]);
        result[0].photos = photos;

        let categories = await db.query('SELECT * FROM `category`', []);

        let current_category = categories.find(i => i.id == result[0].category_id);

        if (current_category) {
            result[0].category = calcCategoryFullName(current_category, categories);
        }

        res.status(200).send(result[0]);
    } catch (err) {
        console.log('Error (/book/details):');
        console.error(err);

        res.status(400).send(null);
    }
});

async function createBookPhoto(file, book_id) {
    if (file.name && file.name != '') {
        let filename = uuidV1() + path.extname(file.name);

        await moveFile(file, path.resolve('.', 'public', 'uploads', filename));

        await db.query(`INSERT INTO \`photo\`(name, book_id) VALUES(?,?);`,
            [filename, book_id]);
    }
}

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

async function createRelationBookAuthor(bookId, authorId) {
    await db.query(`INSERT INTO \`book_author\`(book_id, author_id) VALUES(?,?);`,
        [bookId, authorId]);
}

function moveFile(file, filename) {
    return new Promise((resolve, reject) => {
        file.mv(filename, function (err) {
            if (err)
                return reject(err);

            resolve(true);
        });
    });
}

function removeFile(file) {
    return new Promise((resolve, reject) => {
        let filePath = path.resolve('.', 'public', 'uploads', file.name);

        fs.unlink(filePath, function (err) {
            if (err)
                return reject(err);

            resolve(true);
        });
    });
}

function validate(book) {
    if (!book.name || !book.name.trim()) {
        return false;
    }

    if (!book.short_description || !book.short_description.trim()) {
        return false;
    }

    if (!book.book_description || !book.book_description.trim()) {
        return false;
    }

    if (!book.year_of_publishing ||
        book.year_of_publishing < new Date().getFullYear() - 200 ||
        book.year_of_publishing > new Date().getFullYear() + 1) {
        return false;
    }

    if (!book.pages ||
        book.pages <= 0 ||
        book.pages > 100000) {
        return false;
    }

    if (!book.isbn ||
        !book.isbn.trim() ||
        !/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/gm.test(book.isbn)) {
        return false;
    }

    if (!book.price || book.price <= 0) {
        return false;
    }

    if (!book.publisher_id) {
        return false;
    }

    if (!book.category_id) {
        return false;
    }

    if (!book.authors) {
        return false;
    } else {
        if (book.authors instanceof Array) {
            for (let item of book.authors) {
                if (item == -1) {
                    return false;
                }
            }
        } else if (book.authors == -1) {
            return false;
        }
    }

    return true;
}

function showError(res) {
    res.status(400).send('Not all required fields have been completed!!! Or filled incorrectly!!!');
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