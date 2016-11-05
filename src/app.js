/**
 * app
 */

"use strict";

import config from "./config.json";
import express from "express";
import path from "path";
import  bodyParser from "body-parser";
import nodeSchedule from "node-schedule";
import fs from "fs";

var exec = require('child_process').exec;
var localStorage = require('localStorage');
var NodeCache = require( "node-cache" );
var tabletCache = new NodeCache();
var session = require('client-sessions');

var connections = [];

var app = express();
var expressThumbnail = require('express-thumbnail');
var exphbs  = require('express-handlebars');
var qt = require('quickthumb');
var request = require('request');
import when from 'when';

app.set('views', path.join(__dirname, 'templates'));
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main_layout',layoutsDir: path.join(__dirname, 'templates/layouts')}));
app.set('view engine', '.hbs');
app.use(expressThumbnail.register(path.join(__dirname , 'public')));
app.use(qt.static(path.join(__dirname, 'public')));


/* Files */
import {Logger} from "./lib/logger";
import {VisitorStore} from "./stores/visitor";
import {Visitors} from "./routes/visitors";
import {Search} from "./routes/search";
import {Postgres} from "./resources/postgres";
import {DbConnect} from "./resources/dbConnect";
import {EventListener} from "./services/eventListener";
import {VisitorService} from "./services/visitor";
import {TemplateManager} from "./services/templateManager";
import {SendMail} from "./lib/sendMail";
var middelWare = require('./middelware/middelware').authentication;

let logger = new Logger();
let sendMail = new SendMail();
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
            sendMail.mail(mailOptions);
        });

        let io = require('socket.io')(server);
        let templateManager = new TemplateManager();
        //let emitter = new EventEmitter();
        let postgres = new Postgres(connection);
        let eventListener = new EventListener(connection, logger);
        let visitorStore = new VisitorStore(postgres, logger, io, tabletCache);
        let visitorService = new VisitorService(visitorStore, templateManager, logger, tabletCache);
        let visitors = new Visitors(visitorService, logger, localStorage, io, sendMail, tabletCache);
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

        //MiddelWare
        app.use(session({
            cookieName: 'session',
            secret: 'random_string_goes_here',
            duration: 30 * 60 * 1000,
            activeDuration: 5 * 60 * 1000,
        }));

        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            const regex = /^\/api\//g;
            const  str = req.url;
            let m;
            if((m = regex.exec(str)) !== null){
                console.log("This is  an API Request");
            }else{
                if(req.session.key) {
                    console.log("This is Admin Session Data " + req.session.key);
                }else{
                    const adminRegex = /^\/adminLogin/g;
                    let lMatch;
                    if((lMatch = adminRegex.exec(str)) !== null){
                        console.log("Admin login Post request");
                    }else{
                        req.session.destroy();
                        console.log("Show Login Page");
                        app.get("/", visitors.loginView());
                    }
                }
                next();
            }
        });

        //Visitors
        app.post("/visitors", visitors.post());
        app.get("/allSignOut", visitors.allSignOutToday());
        app.get("/allVisitors", visitors.allSignIns());
        app.get("/visitors/:id", visitors.get());
        app.put("/visitors/:id", visitors.put());

        //Admin
        app.get("/", visitors.loginView());
        app.post("/adminLogin", visitors.adminLogin());

        //Terms and Conditions
        app.get("/templateTerms", visitors.templateTerms());
        app.get("/terms", visitors.getTerms());
        app.get("/terms/:id", visitors.getTerms());
        app.post("/terms", visitors.postTerms());
        app.put("/terms/:id", visitors.updateTerms());
        app.get("/allTerms", visitors.allTerms());
        app.get("/test", visitors.test());

        //App status and Graph
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

        app.get("/getPrinters", visitors.getPrinters());
        //request for Tablets

        app.get("/addTablet", visitors.addTablet());
        app.get("/allTabletLocations", visitors.allTabletLocations());

        app.post("/tabletPost", visitors.tabletPost());
        app.get("/getAllTablet", visitors.allTablet());
        app.get("/fetchDataForTablet", visitors.fetchDataForTablet());
        app.post("/tablet/:id", visitors.updateTablet());
        app.delete("/tablet/:id", visitors.deleteTabletDept());

        // request for staff
        app.get("/allStaff", visitors.allStaff());
        app.get("/staffData/:id", visitors.staffData());
        app.get("/staffSignIn/:id", visitors.staffSignIn());
        app.get("/staffSignOut/:id", visitors.staffSignOut());
        app.get("/staffSignedIn/:id", visitors.staffSignedIn());
        app.get("/staffSignedOut/:id", visitors.staffSignedOut());
        app.post("/captureStaffImage/", visitors.captureStaffImage());

        //Print Outs
        app.get("/allVisitorsPrintOut", visitors.allPrintOut());
        app.get("/allPrintOut/:id", visitors.allPrintOut());

        //FireMarshall
        app.post("/fireMarshall", visitors.addFireMarshall());
        app.get("/fireMarshall", visitors.showFireMarshall());
        app.post("/fireMarshall/:id", visitors.updateFireMarshall());
        app.get("/allFireMarshall", visitors.allFireMarshall());
        app.delete("/fireMarshall/:id", visitors.deleteFireMarshall());

        //First Aid
        app.get("/firstAid", visitors.getFirstAid());
        app.post("/firstAid", visitors.postFirstAid());
        app.post("/firstAid/:id", visitors.updateFirstAid());
        app.get("/allFirstAid", visitors.allFirstAid());
        app.delete("/firstAid/:id", visitors.deleteFirstAid());


        //Staff Signin and Signout from the NFC card
        app.get("/nfcActivity/:id", visitors.nfcActivity());

        //request for search

        app.get("/searchAllSignIn/:id", search.searchAllSignIn());

        nodeSchedule.scheduleJob(config.runTime, function () {
            visitors.allSignOut()
                .then(done => {
                    logger.info("All Signed Out");
                    return true;
                })
                .then(res => {
                    logger.info("Removing images and Pdfs");
                    /*
                    *  Remove images for visitors
                    * */

                    var cmd = 'rm  public/images/visitors/*';

                    exec(cmd, function (error, stdout, stderr) {
                        console.log(stdout);

                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });
                })
                .catch(err => {
                    logger.error("Error occurred while running cron job: " + JSON.stringify(err));
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
