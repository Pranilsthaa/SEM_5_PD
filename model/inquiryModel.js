const { connection } = require("../connection");

function postInquiryData(data, file) {
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

module.exports = { postInquiryData };