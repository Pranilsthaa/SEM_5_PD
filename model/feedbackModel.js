const { connection, runQuery } = require("../connection");

async function postFeedback(data) {
  const { name, email, service, feedback, url, rating } = data;

  const eventQuery =
    "INSERT INTO feedback (name, email, service, message, image, rating) VALUES (?, ?, ?, ?, ?, ?)";
  try {
    const result = await runQuery(eventQuery, [
      name,
      email,
      service,
      feedback,
      url,
      rating,
    ]);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getFeedbacks() {
  const query = "SELECT * FROM feedback";
  try {
    const result = await runQuery(query);
    return result;
  } catch (err) {
    throw err;
  }
}

async function getFeedbacksCount() {
  const query = "SELECT COUNT(*) as total FROM feedback";
  try {
    const result = await runQuery(query);
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = { postFeedback, getFeedbacks, getFeedbacksCount };
