const { connection } = require("../connection");

function postFeedback(data) {
    const { name, email, service, feedback, url, rating } = data;

    return new Promise((resolve, reject) => {
        const eventQuery = 'INSERT INTO feedback (name, email, service, message, image, rating) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(eventQuery, [name, email, service, feedback, url, rating], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    }

    );
}

function getFeedbacks() {

    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM feedback';
        connection.query(query, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    }

    );
}

module.exports = { postFeedback, getFeedbacks };