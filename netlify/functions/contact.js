const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ success: false, message: "Method Not Allowed" }) };
    }

    try {
        const { name, email, subject, message } = JSON.parse(event.body);
        if (!name || !email || !subject || !message) {
            return { statusCode: 400, body: JSON.stringify({ success: false, message: 'All fields are required.' }) };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'mail.privateemail.com',
            port: parseInt(process.env.EMAIL_PORT || '465'),
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
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Failed to send message.' })
        };
    }
};
