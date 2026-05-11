const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
        };
    }

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Environment variables EMAIL_USER or EMAIL_PASS are missing.');
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Server configuration error: Missing credentials.' }),
            };
        }

        const { email } = JSON.parse(event.body);

        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Email is required.' }),
            };
        }

        if (!email.toLowerCase().endsWith('@gmail.com')) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Only Gmail addresses are accepted.' }),
            };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'mail.privateemail.com',
            port: parseInt(process.env.EMAIL_PORT || '465'),
            secure: (process.env.EMAIL_PORT === '465' || !process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
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

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, message: 'Subscribed successfully!' }),
        };
    } catch (error) {
        console.error('Detailed Newsletter Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                message: 'Subscription failed.',
                debug: error.message
            }),
        };
    }
};
