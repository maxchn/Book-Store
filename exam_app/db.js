const mysql = require('mysql');

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'book_store_db'
};

class Database {
    constructor() {
        this.connection = mysql.createConnection(deployconfig);

        this.connection.connect((err) => {
            if (err) throw err;
            console.log("Connected to DB successfully");
        });
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);

                resolve(rows);
            });
        });
    }    

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);

                resolve();
            });
        });
    }
}

var db = new Database();

module.exports = db;