'use strict'
exports.sendMail = (mailOptions) => {
    return new Promise((resolve, reject) => {
        const nodemailer = require('nodemailer');
        const smtpTransport = require('nodemailer-smtp-transport');
        nodemailer.createTestAccount(() => {
            let transporter;

            transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587, //587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "ohmytennisjulien@gmail.com", //"kavinkarnan@gmail.com",
                    pass: "qlhsblbnlagxmfns" //"nxmpvsszzeuvdcyn"
                },
                tls: {
                    rejectUnauthorized: false
                }
            });


            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {  
                if (error) {
                    reject(error);
                }
                else {
                    resolve(info);
                }
            });
        })
    })
}; 