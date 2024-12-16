const mysql = require('mysql')
// const connection = mysql.createConnection({
//     host: 'sql12.freesqldatabase.com',
//     user: 'sql12751939',
//     password: 'zMnTdviMyC',
//     database: 'sql12751939',
// })
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ai_solution'
})

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

const runQuery = (query, value) => {
    return new Promise((resolve, reject) => {
        connection.query(query, value, (err, results) => {
            if (err) {
                return reject(err)
            }
            else {
                return resolve(results)
            }
        })
    })
}

module.exports = { runQuery, connection }