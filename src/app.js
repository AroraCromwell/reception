/**
 * app
 */

"use strict";

import config       from "./config.json";
import express      from "express";
import path         from "path";
import  bodyParser  from "body-parser";
import nodeSchedule from "node-schedule";
import fs           from "fs";

/* Files */
import {Logger}             from "./lib/logger";
import {VisitorStore}       from "./stores/visitor";
import {Visitors}           from "./routes/visitors";
import {Search}             from "./routes/search";
import {Postgres}           from "./resources/postgres";
import {DbConnect}          from "./resources/dbConnect";
import {EventListener}      from "./services/eventListener";
import {VisitorService}     from "./services/visitor";
import {TemplateManager}    from "./services/templateManager";
import {SendMail}           from "./lib/sendMail";
import {AutoCompleteRoutes} from "./routes/autoComplete";
import {TabletRoutes}       from "./routes/tablet";
import {FireMarshallRoutes} from "./routes/fireMarshall";
import {FirstAidRoutes}     from "./routes/firstAid";
import {StaffRoutes}        from "./routes/staff";
import {LoginRoutes}        from "./routes/login";
import {StatusRoutes}       from "./routes/status";
import {PrintRoutes}        from "./routes/printOut";

var exec                = require("child_process").exec;
var NodeCache           = require( "node-cache" );
var tabletCache         = new NodeCache();
var session             = require("client-sessions");
var expressThumbnail    = require("express-thumbnail");
var exphbs              = require("express-handlebars");
var qt                  = require("quickthumb");
var request             = require("request");

//declare allConnections
var connections = [];

// initiliaze the express
var app = express();
var logger = new Logger();

// Setting  the handlebars templates with express
app.set("views", path.join(__dirname, "templates"));
app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: "main_layout",layoutsDir: path.join(__dirname, "templates/layouts")}
    ));
app.set("view engine", ".hbs");
app.use(expressThumbnail.register(path.join(__dirname , "../public")));
app.use(qt.static(path.join(__dirname, "../public")));

let db = new DbConnect(config.db.postgres.string);

db.createConnection()
    .then((connection) => {
        var server;
        //If it is in Production Env., Look for the SSL
       if(config.env.status !== "Production"){
           server = require("https").createServer({
               cert: fs.readFileSync("C:\\Users\\administrator.CROMDOMAIN\\cromwell-cert\\ssl_certificate.crt"),
               key:  fs.readFileSync("C:\\Users\\administrator.CROMDOMAIN\\cromwell-cert\\cromtoolssrv.key")
           },app);
       }else {
           server = require("http").createServer(app);
       }

       //Initiate the objects
        let io = require("socket.io")(server);
        let templateManager     = new TemplateManager();
        let sendMail            = new SendMail();
        let postgres            = new Postgres(connection);
        let eventListener       = new EventListener(connection, logger);
        let visitorStore        = new VisitorStore(postgres, logger, io, tabletCache);
        let visitorService      = new VisitorService(visitorStore, templateManager, logger, tabletCache);
        let visitors            = new Visitors(visitorService, logger, io, tabletCache);
        let autoCompleteRoutes  = new AutoCompleteRoutes(visitorStore, logger, io, tabletCache);
        let tabletRoutes        = new TabletRoutes(visitorStore, logger, io, tabletCache);
        let fireMarshallRoutes  = new FireMarshallRoutes(visitorStore, logger, io, tabletCache);
        let firstAidRoutes      = new FirstAidRoutes(visitorStore, logger, io, tabletCache);
        let staffRoutes         = new StaffRoutes(visitorStore, logger, io, tabletCache);
        let loginRoutes         = new LoginRoutes(visitorStore, logger, io, tabletCache);
        let statusRoutes        = new StatusRoutes(visitorStore, logger, io, tabletCache);
        let printRoutes         = new PrintRoutes(visitorStore, logger, io, tabletCache, sendMail);
        let search              = new Search(visitorService, logger, io);

        app.use( bodyParser.json({limit: "50mb"}) );       // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            limit: "50mb",
            extended: true
        }));

        //MiddelWare
        app.use(session({
            cookieName: "session",
            secret: "random_string_goes_here",
            duration: 30 * 60 * 1000,
            activeDuration: 5 * 60 * 1000,
        }));
    // Every request will go through Middelware and if it is admin request, then set up the Redis Session.
        var middelWare = require("./middelware/middelware")(loginRoutes);
        app.use(middelWare);

        // Specifiy all the Routes Now:
        //Visitors
        app.post("/visitors", visitors.postVisitor());
        app.get("/allSignOut", visitors.allVisitorsSignOut());
        app.get("/allVisitors", visitors.allVisitorsSignIn());
        app.get("/visitors/:id", visitors.getVisitors());
        app.put("/visitors/:id", visitors.updateVisitor());

        //Admin
        app.get("/", loginRoutes.loginView());
        app.post("/adminLogin", loginRoutes.adminLogin());

        //Terms and Conditions
        app.get("/templateTerms", visitors.templateTerms());
        app.get("/terms", visitors.getTerms());
        app.get("/terms/:id", visitors.getTerms());
        app.post("/terms", visitors.postTerms());
        app.put("/terms/:id", visitors.updateTerms());
        app.get("/allTerms", visitors.allTerms());

        //App status and Graph
        app.post("/appStatus", statusRoutes.status());
        app.get("/graph", statusRoutes.graph());
        app.get("/graph/getData", statusRoutes.currentStatus());

        // request for suggestions
        app.get("/autoCompleteAdd", autoCompleteRoutes.autoCompleteAdd());
        app.post("/autoCompletePost", autoCompleteRoutes.autoCompletePost());
        app.get("/autoComplete", autoCompleteRoutes.autoComplete());
        app.get("/autoComplete/:id", autoCompleteRoutes.autoCompleteId());
        app.post("/autoComplete/:id", autoCompleteRoutes.updateAutoComplete());
        app.delete("/autoComplete/:id", autoCompleteRoutes.deleteAutoComplete());

        //request for Tablets
        app.get("/addTablet", tabletRoutes.addTablet());
        app.get("/allTabletLocations", tabletRoutes.allTabletLocations());
        app.post("/tabletPost", tabletRoutes.tabletPost());
        app.get("/getAllTablet", tabletRoutes.allTablet());
        app.get("/fetchDataForTablet", tabletRoutes.fetchDataForTablet());
        app.post("/tablet/:id", tabletRoutes.updateTablet());
        app.delete("/tablet/:id", tabletRoutes.deleteTabletDept());

        // request for staff
        app.get("/allStaff", staffRoutes.allStaff());
        app.get("/staffData/:id", staffRoutes.staffData());
        app.get("/staffSignIn/:id", staffRoutes.staffSignIn());
        app.get("/staffSignOut/:id", staffRoutes.staffSignOut());
        app.get("/staffSignedIn/:id", staffRoutes.staffSignedIn());
        app.get("/staffSignedOut/:id", staffRoutes.staffSignedOut());
        app.post("/captureStaffImage/", staffRoutes.captureStaffImage());

        //Print Outs
        app.get("/allVisitorsPrintOut", printRoutes.allPrintOut());
        app.get("/allPrintOut/:id", printRoutes.allPrintOut());

        //FireMarshall
        app.post("/fireMarshall", fireMarshallRoutes.addFireMarshall());
        app.get("/fireMarshall", fireMarshallRoutes.showFireMarshall());
        app.post("/fireMarshall/:id", fireMarshallRoutes.updateFireMarshall());
        app.get("/allFireMarshall", fireMarshallRoutes.allFireMarshall());
        app.delete("/fireMarshall/:id", fireMarshallRoutes.deleteFireMarshall());

        //First Aid
        app.get("/firstAid", firstAidRoutes.getFirstAid());
        app.post("/firstAid", firstAidRoutes.postFirstAid());
        app.post("/firstAid/:id", firstAidRoutes.updateFirstAid());
        app.get("/allFirstAid", firstAidRoutes.allFirstAid());
        app.delete("/firstAid/:id", firstAidRoutes.deleteFirstAid());


        //Staff Signin and Signout from the NFC card
        app.get("/nfcActivity/:id", staffRoutes.nfcActivity());

        //request for search
        app.get("/searchAllSignIn/:id", search.searchAllSignIn());

        var nodeJob = require("./resources/nodeJobs")(visitors, statusRoutes, logger);


        // Listen for socket watchers
        connection.query('LISTEN "watchers"');

        connection.on("notification", function(data) {
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

        /* Start Listening */
        eventListener.listen();
        eventListener.on("forcelogin", () => {
            console.log("event has occured");
        });

        var socketConnections = require("./resources/socketConnection")(io, statusRoutes);

        // /* Start up the server */
        // var status = 1;
        //
        // io.on("connection", function(socket){
        //     console.log(" new device connected");
        //     var alive;
        //     var down;
        //     socket.emit("connectMessage", { msg : "Connected" });
        //     socket.on("event", function(data){});
        //
        //     socket.once("up", function(data){
        //         console.log("Serivce connected");
        //         socket.room = "appStatus";
        //         socket.join("appStatus");
        //         socket.username = "brc";
        //         status = 1;
        //
        //         //clearInterval(down);
        //
        //     });
        //
        //     socket.once("disconnect", function(){
        //         console.log("Service goes down");
        //         socket.leave("appStatus");
        //         status = 0;
        //       //  clearInterval(alive);
        //     });
        // });
        //
        //
        // if(status != "undefined") {
        //     console.log("inside status interval");
        //     setInterval(function () {
        //         console.log("Status Is" + status);
        //         statusRoutes.deviceStatus(status);
        //     }, 300000);
        // }


        server.listen(config.server.port, () => {
            logger.info("System Listen on port " + config.server.port);
        });

    }).catch((err) => {
        logger.fatal("Database Failure:  " +  err);
        process.exit();
    });
