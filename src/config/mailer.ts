import nodemailer = require('nodemailer');

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'hoova.mx@gmail.com',
        pass: 'waevancysfsnselt'
    },
});

transporter.verify().then(() => {
    console.log('Ready for send emails');
});