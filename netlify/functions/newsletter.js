const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ success: false, message: "Method Not Allowed" }) };
    }

    try {
        const { email } = JSON.parse(event.body);

        const transporter = nodemailer.createTransport({
            host: 'mail.privateemail.com',
            port: 465,
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, message: 'Subscribed successfully!' }),
        };
    } catch (error) {
        console.error('Namecheap Newsletter Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                message: 'Subscription failed.',
                error: error.message 
            }),
        };
    }
};
