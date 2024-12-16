const { connection } = require("../connection");

function postArticle(data, file) {
    const { author, title, description, slug } = data;
    const { filename } = file

    return new Promise((resolve, reject) => {
        const eventQuery = 'INSERT INTO article (title, description, article_image, author, slug) VALUES (?, ?, ?, ?, ?)';
        connection.query(eventQuery, [title, description, filename, author, slug],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
    }

    );
}

function getArticles(data, file) {

    return new Promise((resolve, reject) => {
        const eventQuery = 'SELECT * FROM article';
        connection.query(eventQuery,
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
    }

    );
}

function getArticleById(slug) {

    return new Promise((resolve, reject) => {
        const eventQuery = 'SELECT * FROM article where slug = ?';
        connection.query(eventQuery, [slug],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
    }

    );
}
function searchArticle(key) {
    const searchKey = `%${key}%`;
    return new Promise((resolve, reject) => {
        const eventQuery = 'SELECT title, slug FROM article WHERE slug LIKE ?';
        connection.query(eventQuery, [searchKey],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
    }
    );
}

module.exports = { postArticle, getArticles, getArticleById, searchArticle };