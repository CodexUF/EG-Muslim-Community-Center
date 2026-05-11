const serverless = require('serverless-http');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve static assets from 'src'
app.use(express.static(path.join(__dirname, '../src')));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));
app.get('/events', (req, res) => res.render('events'));
app.get('/contact', (req, res) => res.render('contact'));

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'mail.privateemail.com',
            port: process.env.EMAIL_PORT || 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            text: `You have a new message from ${name} (${email}):\n\n${message}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

// Newsletter Subscription Endpoint
app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'mail.privateemail.com',
            port: process.env.EMAIL_PORT || 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const adminMailOptions = {
            from: `"Newsletter System" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New Newsletter Subscriber: ${email}`,
            text: `You have a new newsletter subscriber: ${email}`
        };

        const userMailOptions = {
            from: `"E G Community Centre" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Welcome to our Newsletter!`,
            text: `Thank you for subscribing to the E G Muslim Community Centre newsletter.`
        };

        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(userMailOptions)
        ]);

        res.status(200).json({ success: true, message: 'Subscribed successfully!' });
    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({ success: false, message: 'Subscription failed.' });
    }
});

// Export the app wrapped in serverless
module.exports.handler = serverless(app);
