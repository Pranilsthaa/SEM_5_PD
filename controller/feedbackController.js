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

module.exports = { postFeedback }