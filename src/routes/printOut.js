"use strict";

import {_} from "lodash";
var base64 = require("node-base64-image");
var allTablets = "";

export class PrintRoutes {

    constructor(visitorService, logger, io, tabletCache, sendMail) {
        this._visitorService = visitorService;
        this._logger = logger;
        this._io = io;
        this._sendMail = sendMail;
        allTablets = tabletCache.get("allTabs");
    }

    allPrintOut(){
        return [
            (req, res) => {

                var id = req.params.id == null ? 1 : req.params.id;

                this._visitorService.allPrintOut(id)
                    .then(result => {
                        return result;
                    })
                    .then(response => {
                        var combineData = response;
                        this._visitorService.fireMarshallMail()
                            .then( res => {
                                var emailReceiver = [];
                                _.each(res.rows , function (value, key) {
                                    emailReceiver.push(value.email_adds);
                                });

                                var emailR = emailReceiver.toString();
                                console.log(emailR);
                                var mailOptions = {
                                    from: "IT Services<aroras@cromwell.co.uk>", // sender address
                                    to: emailR, // list of receivers
                                    subject: "Fire: Cromwell Reception", // Subject line
                                    text: "There is fire in the building. " +
                                    "Please find attached list of all Staff and Visitors in the building.",
                                    attachments: [
                                        {   // utf-8 string as an attachment
                                            filename: "staff.pdf",
                                            content: "C:\\reception-handler\\build\\pdf\\allStaff.pdf"
                                        },
                                        {
                                            filename: "visitors.pdf",
                                            content: "C:\\reception-handler\\build\\pdf\\allVisitors.pdf"
                                        }
                                    ]
                                };

                                console.log("Sending Email ");
                                //this._sendMail.mail(mailOptions);
                            });

                        if(id == 1 ){
                            res.render("allPrintOut", {data: combineData});
                        }else {
                            res.render("allVisitorsPrintOutWithPrint", {data: combineData});
                        }
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }
}
