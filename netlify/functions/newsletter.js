const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
        };
    }

    try {
        const { email } = JSON.parse(event.body);

        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Email is required.' }),
            };
        }

        // Validate Gmail domain
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Only Gmail addresses are accepted.' }),
            };
        }

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

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ success: true, message: 'Subscribed successfully!' }),
        };
    } catch (error) {
        console.error('Newsletter error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Subscription failed.' }),
        };
    }
};
