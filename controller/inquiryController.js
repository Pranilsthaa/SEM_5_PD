const { postInquiryData } = require("../model/inquiryModel");

async function postInquiry(req, res) {
    const data = req.body;
    try {
        let response = await postInquiryData(data);
        if (!response) res.send('Inquiry not posted');
        res.status(200).send(response);
    } catch (err) {
        console.log(err);
    }
}


module.exports = { postInquiry };