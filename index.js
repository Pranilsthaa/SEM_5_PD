const express = require('express');
const app = express();
const cors = require('cors');
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser');
const upload = require('./middleware/ImageHandler');
const path = require('path');
const { postEvent, getEventByID, getEvents } = require('./controller/eventController');
const { postInquiry } = require('./controller/inquiryController');
const { postArticle, getArticles, getArticleById, searchArticle } = require('./controller/articleController');
const { postFeedback } = require('./controller/feedbackController');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use(express.json());

const port = 5600;

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     secure: true,
//     auth: {
//         user: "pranilstha322@gmail.com",
//         pass: "tjat zgtx tlzb zumy",
//     },
// });

// const sendMail = async (name, email, subject, message) => {
//     const info = await transporter.sendMail({
//         from: email, // sender address
//         to: 'pranilstha322@gmail.com', // list of receivers
//         subject: subject, // Subject line
//         html: `${message} <br><br><p>A mail by ${name}</p>`
//     });
// }

// app.post('/submit', async (req, res) => {
//     try {
//         const { name, email, subject, message } = req.body;
//         if (!name || !email || !subject || !message) {
//             return res.send('All fields are required')
//         }
//         await sendMail(name, email, subject, message)
//         res.send('Form submitted successfully')
//     } catch (err) {
//         res.status(500).send('Internal Server Error')
//         console.log(err)
//     }
// })

// app.post('/verifyOTP', async (req, res) => {
//     try {
//         const { otp } = req.body;
//         if (otp === '000628') {
//             return res.status(200).send('OTP verified successfully')
//         } else {
//             return res.status(400).send('Invalid OTP')
//         }
//     } catch (e) {
//         res.status(500).send('Internal Server Error')
//         console.log(e)
//     }

// })

// const jwt = require('jsonwebtoken');
// const { verifyUser } = require('./verifyUser');
// const { runQuery } = require('./connection');

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const result = await runQuery('SELECT * FROM userdetail where name=?', [username])
//         if (result.length > 0) {
//             const user = result[0]
//             if (user.password === password) {
//                 const token = jwt.sign({ id: user.id, name: user.name }, 'pranil123')
//                 return res.status(200).json({ token: token, message: "login Successful" })
//             } else {
//                 return res.status(401).json({ message: 'Invalid password' });
//             }
//         } else {
//             return res.status(404).json({ message: 'User not found' });
//         }
//     } catch (err) {
//         res.status(500).send('Internal Server Errorr')
//         console.log(err)
//     }
// })

// app.get('/details', verifyUser, (req, res) => {
//     const userdetail = req.user
//     res.status(200).send(userdetail)
// })

app.use(express.static((path.join(__dirname, 'public'))));

app.post('/postevents', upload.fields([{ name: "banner", maxCount: 1 }, { name: "additionalImages", maxCount: 10, }]), postEvent)
app.get('/getevents', getEvents)
app.get('/getevents/:eventID', getEventByID)
app.post('/post_inquiry', postInquiry)
app.post('/post_article', upload.single('photo'), postArticle)
app.get('/getarticles', getArticles)
app.get('/getarticles/:slug', getArticleById)
app.get('/searchArticle', searchArticle)
app.post('/post_feedback', postFeedback)

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
