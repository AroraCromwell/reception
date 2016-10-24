"use strict";

/* Third-party modules */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nodemailer = require("nodemailer");

var SendMail = exports.SendMail = function () {
    function SendMail() {
        _classCallCheck(this, SendMail);

        // create reusable transport method (opens pool of SMTP connections)
        // this._smtpTransport = nodemailer.createTransport("SMTP",{
        //     service: "Gmail",
        //     auth: {
        //         user: "shibi.arora@gmail.com",
        //         pass: "Leicester@195"
        //     }
        // });

        this._smtpTransport = nodemailer.createTransport('smtps://aroras%40cromwell.co.uk:ar0ra@mail.cromwell.co.uk');
    }

    _createClass(SendMail, [{
        key: "mail",
        value: function mail(mailOptions) {
            // send mail with defined transport object

            this._smtpTransport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                console.log('Message sent: ' + info);
            });
        }
    }]);

    return SendMail;
}();