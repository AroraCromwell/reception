"use strict";

/* Third-party modules */
var nodemailer = require("nodemailer");

export class SendMail {

    constructor() {
        // create reusable transport method (opens pool of SMTP connections)
        this._smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Gmail",
            auth: {
                user: "shibi.arora@gmail.com",
                pass: "Leicester@195"
            }   
        });
    }

    mail(mailOptions) {
        // send mail with defined transport object

        this._smtpTransport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            console.log('Message sent: ' + info);
        });
    }

}
