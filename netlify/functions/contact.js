const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ success: false, message: "Method Not Allowed" }) };
    }

    try {
        const { name, email, subject, message } = JSON.parse(event.body);

        // Namecheap SMTP Configuration
        const transporter = nodemailer.createTransport({
            host: 'mail.privateemail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`, // Must be your authenticated email
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            text: `From: ${name} (${email})\n\nMessage:\n${message}`
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, message: 'Message sent successfully!' }),
        };
    } catch (error) {
        console.error('Namecheap Email Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                message: 'Failed to send message.',
                error: error.message 
            }),
        };
    }
};
