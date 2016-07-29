/**
 * app
 */

"use strict";

import config from "./config.json";
import express from "express";
import path from "path";
import  bodyParser from "body-parser";
import nodeSchedule from "node-schedule";
//import CanvasJS from 'canvasjs';
var exec = require('child_process').exec;
var localStorage = require('localStorage');
var nodemailer = require("nodemailer");
import fs from "fs";

var connections = [];

var app = express();
var exphbs  = require('express-handlebars');
var qt = require('quickthumb');

app.set('views', path.join(__dirname, 'templates'));
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main',layoutsDir: path.join(__dirname, 'templates/layouts')}));
app.set('view engine', '.hbs');
app.use(qt.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* Files */
import {Logger} from "./lib/logger";
import {DataCleaner} from "./services/dataCleaner";
import {VisitorStore} from "./stores/visitor";
import {Visitors} from "./routes/visitors";
import {Search} from "./routes/search";
import {Postgres} from "./resources/postgres";
import {DbConnect} from "./resources/dbConnect";
import {EventListener} from "./services/eventListener";
import {VisitorService} from "./services/visitor";
import {TemplateManager} from "./services/templateManager";

let logger = new Logger();
let db = new DbConnect(config.db.postgres.string);

db.createConnection()
    .then((connection) => {

        //var server = require('http').createServer(app);
       if(config.env.status !== "Production"){
           var server = require('https').createServer({
               cert: fs.readFileSync("C:\\Users\\administrator.CROMDOMAIN\\cromwell-cert\\ssl_certificate.crt"),
               key:  fs.readFileSync("C:\\Users\\administrator.CROMDOMAIN\\cromwell-cert\\cromtoolssrv.key")
           },app);
       }else {
           var server = require('http').createServer(app);
       }


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
                to: "shibbi.arora@gmail.com", // list of receivers
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

        let io = require('socket.io')(server);
        let templateManager = new TemplateManager();
        let dataCleaner = new DataCleaner();
        //let emitter = new EventEmitter();
        let postgres = new Postgres(connection);
        let eventListener = new EventListener(connection, logger);
        let visitorStore = new VisitorStore(postgres, logger, io);
        let visitorService = new VisitorService(visitorStore, templateManager, dataCleaner, logger);
        let visitors = new Visitors(visitorService, logger, localStorage, io);
        let search = new Search(visitorService, logger, localStorage, io);



        /* Start Listening */
        eventListener.listen();
        eventListener.on("forcelogin", () => {
            console.log("event has occured");
        })
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
        app.get("/graph", visitors.graph());
        app.get("/graph/getData", visitors.currentStatus());

        // request for suggestions

        app.get("/autoCompleteAdd", visitors.autoCompleteAdd());
        app.post("/autoCompletePost", visitors.autoCompletePost());
        app.get("/autoComplete", visitors.autoComplete());
        app.get("/autoComplete/:id", visitors.autoCompleteId());
        app.post("/autoComplete/:id", visitors.updateAutoComplete());
        app.delete("/autoComplete/:id", visitors.deleteAutoComplete());


        // request for staff
        app.get("/allStaff", visitors.allStaff());
        app.get("/staffData/:id", visitors.staffData());
        app.get("/staffSignIn/:id", visitors.staffSignIn());
        app.get("/staffSignOut/:id", visitors.staffSignOut());
        app.get("/staffSignedIn/:id", visitors.staffSignedIn());
        app.post("/captureStaffImage/", visitors.captureStaffImage());
        app.get("/allVisitorsPrintOut", visitors.allVisitorsPrintOut());

        //request for search

        app.get("/searchAllSignIn/:id", search.searchAllSignIn());



        nodeSchedule.scheduleJob(config.runTime, function () {
            visitors.allSignOut()
                .then(done => {
                    logger.info("All Signed Out");
                })
                .catch(err => {
                    logger.error("Error occurred while Signing Out All using cron job: " + JSON.stringify(err));
                });

            visitors.cleanStatus()
                .then(done => {
                    logger.info("Status Clean");
                })
                .catch(err => {
                    logger.error("Error occurred cleaning status data for last day: " + JSON.stringify(err));
                });

            var cmd = "rm -Rf   build/pdf/*";

            exec(cmd, function(error, stdout, stderr) {
                // command output is in stdout
                console.log(stdout);

                if (error !== null) {
                    console.log('exec error: ' + error);
                }
                //process.exit();
            });
        });


        /* Start up the server */


        var status = 1;

        io.on("connection", function(socket){
            console.log(" new device connected");
            var alive;
            var down;
            socket.emit("connectMessage", { msg : "Connected" });
            socket.on('event', function(data){});

            socket.once('up', function(data){
                console.log("Serivce connected");
                socket.room = 'appStatus';
                socket.join('appStatus');
                socket.username = 'brc';
                status = 1;

                //clearInterval(down);

            });

            socket.once('disconnect', function(){
                console.log("Service goes down");
                socket.leave('appStatus');
                status = 0;
              //  clearInterval(alive);
            });
        });


        if(status != 'undefined') {
            console.log("inside status interval");
            setInterval(function () {
                console.log("Status Is" + status);
                visitors.deviceStatus(status);
            }, 300000);
        }


        server.listen(config.server.port, () => {
            logger.info("System Listen on port " + config.server.port);
        });

        // app.listen(config.server.port, () => {
        //     logger.info("System Listen on port " + config.server.port);
        // });



    }).catch((err) => {
        logger.fatal("Database Failure:  " +  err);
        process.exit();
    });
