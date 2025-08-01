const mysql = require("mysql2");
const fs = require("fs");

const pool = mysql.createPool({
  host: "mysql-aisolutions-pranilstha322-c378.e.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_QtZK6kUvvfDS2GAyvsJ",
  database: "ai_solution",
  port: 11236,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    ca: fs.readFileSync("./ca.pem"),
  },
});

const runQuery = (query, values = []) => {
  return new Promise((resolve, reject) => {
    pool.query(query, values, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

module.exports = { runQuery };
