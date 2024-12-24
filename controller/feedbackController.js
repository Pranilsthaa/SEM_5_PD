const feedbackModel = require('../model/feedbackModel')

async function postFeedback(req, res) {
    const data = req.body;
    try {
        let response = await feedbackModel.postFeedback(data);
        if (response) {
            res.status(200).send('Feedback received successfully');
        } else {
            res.status(404).send('Something went wrong');
        }
    } catch (err) {
        console.log(err);
    }
}
async function getFeedbacks(req, res) {
    try {
        let response = await feedbackModel.getFeedbacks();
        if (response) {
            res.status(200).send(response)
        } else {
            res.status(404).send('Error fetching feedbacks');
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = { postFeedback, getFeedbacks }