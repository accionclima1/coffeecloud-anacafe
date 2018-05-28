var nodemailer = require('nodemailer')
var smtpTransport =  require('nodemailer-smtp-transport');
/**/
var configuration = {
    smtp_host: "smtp.gmail.com",
    smtp_user: "centroclimaorg@gmail.com", // your gmail id
    smtp_password: "Clima3!$", // your gmail password
    mailadmin: 'centroclimaorg@gmail.com',
    display_name: 'Coffe Cloud Team'
  };
var config = configuration

var smtpConfig = {
  host: config.smtp_host,
  port: config.smtp_port,
  port: 465,
  secure: true, // use SSL
  auth: {
    user: config.smtp_user,
    pass: config.smtp_password
  }
};

var transporter = nodemailer.createTransport(smtpConfig);

exports.sendEmail = function (mailRequest, cb) {
	"use strict";
    let mailOptions = {
        from: configuration.display_name + '<' + configuration.smtp_user + '>', // sender address
        to: mailRequest.TO, // list of receivers
        subject: mailRequest.SUBJECT, // Subject line
        text: mailRequest.TEXT, // plain text body
        html: mailRequest.HTML // html body
    };
    if(mailRequest.FROM)
    mailOptions.from = mailRequest.FROM;
    
    return transporter.sendMail(mailOptions, function (error, info) {
        console.log("in mal request answer");
        if (error) {
            console.log(error);
            var response = { status: 202, success: false, data: -1 };

        }
        var response = { status: 202, success: true, data: 1 };
        cb(response);
    });

}

