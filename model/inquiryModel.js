const { connection } = require("../connection");

function postInquiryData(data) {
    const { source_of_discovery, budget_range, industry, job_detail, job_title, country, company_name, phone, email, name } = data;

    return new Promise((resolve, reject) => {
        const eventQuery = 'INSERT INTO customer_inquiries (name, email, phone, company_name, country, job_title, job_detail, industry, budget_range, source_of_discovery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(eventQuery, [name, email, phone, company_name, country, job_title, job_detail, industry, budget_range, source_of_discovery], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    }

    );
}

function getInquiry() {
    return new Promise((resolve, reject) => {
        const eventQuery = 'SELECT * FROM customer_inquiries';
        connection.query(eventQuery, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    }

    );
}

function respondToInquiry(id) {
    return new Promise((resolve, reject) => {
        const eventQuery = 'UPDATE customer_inquiries SET status=? where id=? ';
        connection.query(eventQuery, ['responded', id], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    }

    );
}
function countInquiry(status = 'pending') {
    return new Promise((resolve, reject) => {
        // Query to count all inquiries
        const eventQuery = 'SELECT COUNT(*) AS total FROM customer_inquiries';
        // Query to count inquiries by status
        const pendingInquiry = 'SELECT COUNT(*) AS count FROM customer_inquiries WHERE status = ?';

        // Execute the total count query
        connection.query(eventQuery, (err, totalResult) => {
            if (err) {
                return reject(err);
            }

            // Execute the pending inquiry count query
            connection.query(pendingInquiry, [status], (err, pendingResult) => {
                if (err) {
                    return reject(err);
                }

                // Resolve the promise with both results
                resolve({
                    total: totalResult[0].total,
                    pendingCount: pendingResult[0].count
                });
            });
        });
    });
}


module.exports = { postInquiryData, getInquiry, respondToInquiry, countInquiry };