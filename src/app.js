/**
 * app
 */

"use strict";

import config from "./config.json";
import express from "express";
import path from "path";
import  bodyParser from "body-parser";
import nodeSchedule from "node-schedule";
var localStorage = require('localStorage');
var nodemailer = require("nodemailer");

var app = express();
var exphbs  = require('express-handlebars');

app.set('views', path.join(__dirname, 'templates'));
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main',layoutsDir: path.join(__dirname, 'templates/layouts')}));
app.set('view engine', '.hbs');
app.use(express.static(path.join(__dirname, 'public')));

/* Files */
import {Logger} from "./lib/logger";
import {DataCleaner} from "./services/dataCleaner";
import {VisitorStore} from "./stores/visitor";
import {Visitors} from "./routes/visitors";
import {Postgres} from "./resources/postgres";
import {DbConnect} from "./resources/dbConnect";
import {EventListener} from "./services/eventListener";
import {VisitorService} from "./services/visitor";
import {TemplateManager} from "./services/templateManager";

let logger = new Logger();
let db = new DbConnect(config.db.postgres.string);

db.createConnection()
    .then((connection) => {

        // create reusable transport method (opens pool of SMTP connections)
        var smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Gmail",
            auth: {
                user: "shibbi.arora@gmail.com",
                pass: "Leicester@195"
            }
        });

        connection.query('LISTEN "watchers"');

        connection.on('notification', function(data) {
            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: "shibi arora<shibbi.arora@gmail.com>", // sender address
                to: "shibi.arora@gmail.com", // list of receivers
                subject: "Error: Cromwell Reception", // Subject line
                text: data.payload, // plaintext body
            };

            console.log("sending mail");
            // send mail with defined transport object
            smtpTransport.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }
                console.log('Message sent: ' + info);
            });
        });

        let templateManager = new TemplateManager();
        let dataCleaner = new DataCleaner();
        //let emitter = new EventEmitter();
        let postgres = new Postgres(connection);
        let eventListener = new EventListener(connection, logger);
        let visitorStore = new VisitorStore(postgres, logger);
        let visitorService = new VisitorService(visitorStore, templateManager, dataCleaner, logger);
        let visitors = new Visitors(visitorService, logger, localStorage);

        /* Start Listening */
        eventListener.listen();
        app.use( bodyParser.json({limit: '50mb'}) );       // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            limit: '50mb',
            extended: true
        }));

        app.post("/visitors", visitors.post());
        app.get("/allSignOut", visitors.allSignOutToday());
        app.get("/allVisitors", visitors.allSignIns());
        app.get("/visitors/:id", visitors.get());
        app.put("/visitors/:id", visitors.put());
        app.get("/", visitors.loginView());
        app.post("/adminLogin", visitors.adminLogin());
        app.get("/templateTerms", visitors.templateTerms());
        app.get("/terms", visitors.getTerms());
        app.get("/terms/:id", visitors.getTerms());
        app.post("/terms", visitors.postTerms());
        app.put("/terms/:id", visitors.updateTerms());
        app.get("/allTerms", visitors.allTerms());
        app.get("/test", visitors.test());
        app.post("/appStatus", visitors.status());

        nodeSchedule.scheduleJob(config.runTime, function () {
            visitors.allSignOut()
                .then(done => {
                    logger.info("All Signed Out");
                })
                .catch(err => {
                    logger.error("Error occurred while Signing Out: " + JSON.stringify(err));
                });

        });
        /* Start up the server */
        app.listen(config.server.port, () => {
            logger.info("System Listen on port " + config.server.port);
        });



    }).catch((err) => {
        logger.fatal("Database Failure:  " +  err);
        process.exit();
    });
