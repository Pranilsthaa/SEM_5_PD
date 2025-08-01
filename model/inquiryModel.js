const { connection, runQuery } = require("../connection");

async function postInquiryData(data) {
  const {
    source_of_discovery,
    budget_range,
    industry,
    job_detail,
    job_title,
    country,
    company_name,
    phone,
    email,
    name,
  } = data;

  const eventQuery =
    "INSERT INTO customer_inquiries (name, email, phone, company_name, country, job_title, job_detail, industry, budget_range, source_of_discovery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  try {
    const result = await runQuery(eventQuery, [
      name,
      email,
      phone,
      company_name,
      country,
      job_title,
      job_detail,
      industry,
      budget_range,
      source_of_discovery,
    ]);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getInquiry() {
  const eventQuery = "SELECT * FROM customer_inquiries";
  try {
    const result = await runQuery(eventQuery);
    return result;
  } catch (err) {
    throw err;
  }
}

async function respondToInquiry(id) {
  const eventQuery = "UPDATE customer_inquiries SET status=? where id=?";
  try {
    const result = await runQuery(eventQuery, ["responded", id]);
    return result;
  } catch (err) {
    throw err;
  }
}

async function countInquiry(status = "pending") {
  const eventQuery = "SELECT COUNT(*) AS total FROM customer_inquiries";
  const pendingInquiry =
    "SELECT COUNT(*) AS count FROM customer_inquiries WHERE status = ?";

  try {
    const totalResult = await runQuery(eventQuery);
    const pendingResult = await runQuery(pendingInquiry, [status]);

    return {
      total: totalResult[0].total,
      pendingCount: pendingResult[0].count,
    };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  postInquiryData,
  getInquiry,
  respondToInquiry,
  countInquiry,
};
