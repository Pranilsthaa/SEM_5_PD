const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const nodemailer = require('nodemailer')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    auth: {
        user: "pranilstha322@gmail.com",
        pass: "tjat zgtx tlzb zumy",
    },
});

const sendMail = async (name, email, subject, message) => {
    const info = await transporter.sendMail({
        from: email, // sender address
        to: 'pranilstha322@gmail.com', // list of receivers
        subject: subject, // Subject line
        html: `${message} <br><br><p>A mail by ${name}</p>`
    });
}


app.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.send('All fields are required')
        }
        await sendMail(name, email, subject, message)
        res.send('Form submitted successfully')
    } catch (err) {
        res.status(500).send('Internal Server Error')
        console.log(err)
    }
})


app.listen(5500);
