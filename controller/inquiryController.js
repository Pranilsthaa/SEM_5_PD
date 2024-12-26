const inquiryModel = require("../model/inquiryModel");
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    auth: {
        user: "shresthapranil8381@gmail.com",
        pass: "dudm bosg oipw dxby",
    },
});

const sendMail = async (name, email, subject, message) => {
    const info = await transporter.sendMail({
        from: 'shresthapranil8381@gmail.com', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: `${message} <br><br><p>Regards, <br> ${name}</p>`
    });
}

async function postInquiry(req, res) {
    const data = req.body;
    try {
        let response = await inquiryModel.postInquiryData(data);
        if (!response) res.send('Inquiry not posted');
        res.status(200).send(response);
    } catch (err) {
        console.log(err);
    }
}

async function getInquiry(req, res) {
    try {
        let response = await inquiryModel.getInquiry();
        if (!response) res.send('Inquiry not posted');
        res.status(200).send(response);
    } catch (err) {
        console.log(err);
    }
}

async function respondToInquiry(req, res) {
    const { subject, message, email, id } = req.body;
    if (!subject || !message || !email) {
        return res.status(400).send('All fields are required')
    }
    try {
        await sendMail('AI Solutions', email, subject, message)
        const response = await inquiryModel.respondToInquiry(id);
        if (response) res.status(200).send('Inquiry responded successfully');
    } catch (err) {
        res.status(500).send('Internal Server Error')
        console.log(err)
    }
}

module.exports = { postInquiry, getInquiry, respondToInquiry };