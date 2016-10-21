/**
 * app
 */

"use strict";

var _config = require("./config.json");

var _config2 = _interopRequireDefault(_config);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _nodeSchedule = require("node-schedule");

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _when = require("when");

var _when2 = _interopRequireDefault(_when);

var _logger = require("./lib/logger");

var _dataCleaner = require("./services/dataCleaner");

var _visitor = require("./stores/visitor");

var _visitors = require("./routes/visitors");

var _search = require("./routes/search");

var _postgres = require("./resources/postgres");

var _dbConnect = require("./resources/dbConnect");

var _eventListener = require("./services/eventListener");

var _visitor2 = require("./services/visitor");

var _templateManager = require("./services/templateManager");

var _sendMail = require("./lib/sendMail");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import CanvasJS from 'canvasjs';
var exec = require('child_process').exec;
var localStorage = require('localStorage');


var connections = [];

var app = (0, _express2.default)();
var expressThumbnail = require('express-thumbnail');
var exphbs = require('express-handlebars');
var qt = require('quickthumb');
var request = require('request');


app.set('views', _path2.default.join(__dirname, 'templates'));
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main_layout', layoutsDir: _path2.default.join(__dirname, 'templates/layouts') }));
app.set('view engine', '.hbs');
app.use(expressThumbnail.register(_path2.default.join(__dirname, 'public')));
app.use(qt.static(_path2.default.join(__dirname, 'public')));

/* Files */

//var middelWare = require('./middelware/middelware').authentication;

var logger = new _logger.Logger();
var sendMail = new _sendMail.SendMail();
var db = new _dbConnect.DbConnect(_config2.default.db.postgres.string);

db.createConnection().then(function (connection) {

    //var server = require('http').createServer(app);
    if (_config2.default.env.status !== "Production") {
        var server = require('https').createServer({
            cert: _fs2.default.readFileSync("C:\\Users\\administrator.CROMDOMAIN\\cromwell-cert\\ssl_certificate.crt"),
            key: _fs2.default.readFileSync("C:\\Users\\administrator.CROMDOMAIN\\cromwell-cert\\cromtoolssrv.key")
        }, app);
    } else {
        var server = require('http').createServer(app);
    }

    connection.query('LISTEN "watchers"');

    connection.on('notification', function (data) {
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: "shibi arora<shibbi.arora@gmail.com>", // sender address
            to: "shibbi.arora@gmail.com", // list of receivers
            subject: "Error: Cromwell Reception", // Subject line
            text: data.payload };

        console.log("sending mail");
        sendMail.mail(mailOptions);
    });

    var io = require('socket.io')(server);
    var templateManager = new _templateManager.TemplateManager();
    var dataCleaner = new _dataCleaner.DataCleaner();
    //let emitter = new EventEmitter();
    var postgres = new _postgres.Postgres(connection);
    var eventListener = new _eventListener.EventListener(connection, logger);
    var visitorStore = new _visitor.VisitorStore(postgres, logger, io);
    var visitorService = new _visitor2.VisitorService(visitorStore, templateManager, dataCleaner, logger);
    var visitors = new _visitors.Visitors(visitorService, logger, localStorage, io, sendMail);
    var search = new _search.Search(visitorService, logger, localStorage, io);

    /* Start Listening */
    eventListener.listen();
    eventListener.on("forcelogin", function () {
        console.log("event has occured");
    });
    app.use(_bodyParser2.default.json({ limit: '50mb' })); // to support JSON-encoded bodies
    app.use(_bodyParser2.default.urlencoded({ // to support URL-encoded bodies
        limit: '50mb',
        extended: true
    }));

    //MiddelWare
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
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
    app.post("/fireMarshall", visitors.addFiremarshall());
    app.get("/fireMarshall", visitors.showFiremarshall());
    app.post("/fireMarshall/:id", visitors.updateFiremarshall());
    app.get("/allFireMarshall", visitors.allFireMarshall());
    app.delete("/fireMarshall/:id", visitors.deleteFireMarshall());

    //Staff Signin and Signout from the NFC card
    app.get("/nfcActivity/:id", visitors.nfcActivity());

    //request for search

    app.get("/searchAllSignIn/:id", search.searchAllSignIn());

    _nodeSchedule2.default.scheduleJob(_config2.default.runTime, function () {
        visitors.allSignOut().then(function (done) {
            logger.info("All Signed Out");
            return true;
        }).then(function (res) {
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
        }).catch(function (err) {
            logger.error("Error occurred while running cron job: " + JSON.stringify(err));
        });

        visitors.cleanStatus().then(function (done) {
            logger.info("Status Clean");
        }).catch(function (err) {
            logger.error("Error occurred cleaning status data for last day: " + JSON.stringify(err));
        });

        var cmd = "rm -Rf   build/pdf/*";

        exec(cmd, function (error, stdout, stderr) {
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

    io.on("connection", function (socket) {
        console.log(" new device connected");
        var alive;
        var down;
        socket.emit("connectMessage", { msg: "Connected" });
        socket.on('event', function (data) {});

        socket.once('up', function (data) {
            console.log("Serivce connected");
            socket.room = 'appStatus';
            socket.join('appStatus');
            socket.username = 'brc';
            status = 1;

            //clearInterval(down);
        });

        socket.once('disconnect', function () {
            console.log("Service goes down");
            socket.leave('appStatus');
            status = 0;
            //  clearInterval(alive);
        });
    });

    if (status != 'undefined') {
        console.log("inside status interval");
        setInterval(function () {
            console.log("Status Is" + status);
            visitors.deviceStatus(status);
        }, 300000);
    }

    server.listen(_config2.default.server.port, function () {
        logger.info("System Listen on port " + _config2.default.server.port);
    });

    // app.listen(config.server.port, () => {
    //     logger.info("System Listen on port " + config.server.port);
    // });

}).catch(function (err) {
    logger.fatal("Database Failure:  " + err);
    process.exit();
});