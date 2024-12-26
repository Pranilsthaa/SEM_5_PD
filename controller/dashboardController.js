const eventModel = require('../model/eventModel')
const inquiryModel = require("../model/inquiryModel");
const articleModel = require("../model/articleModel");
const feedbackModel = require('../model/feedbackModel')

async function getDashboardData(_, res) {

    try {

        let event = await eventModel.getEvents();

        let Totalinquiry = await inquiryModel.countInquiry();
        const Totalarticle = await articleModel.getTotalArticle();
        const totalEvents = event.length;
        const upcomingEvent = event.filter(event => new Date(event.date) > new Date()).length;
        const totalFeedback = await feedbackModel.getFeedbacksCount();

        Promise.all([Totalinquiry, Totalarticle, totalFeedback])
            .then((values) => {
                const metrics = [
                    { title: "Total Inquiries", value: values[0].total },
                    { title: "Pending Inquiries", value: values[0].pendingCount },
                    { title: "Total Events", value: totalEvents },
                    { title: "Upcoming Events", value: upcomingEvent },
                    { title: "Article Published", value: values[1][0].total },
                    { title: "Client Feedback", value: values[2][0].total },
                ];
                res.status(200).send(metrics);
            })

    } catch (err) {
        console.log(err);
    }
}

module.exports = { getDashboardData }