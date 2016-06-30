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

var _logger = require("./lib/logger");

var _dataCleaner = require("./services/dataCleaner");

var _visitor = require("./stores/visitor");

var _visitors = require("./routes/visitors");

var _postgres = require("./resources/postgres");

var _dbConnect = require("./resources/dbConnect");

var _eventListener = require("./services/eventListener");

var _visitor2 = require("./services/visitor");

var _templateManager = require("./services/templateManager");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import CanvasJS from 'canvasjs';

var localStorage = require('localStorage');
var nodemailer = require("nodemailer");

var app = (0, _express2.default)();
var exphbs = require('express-handlebars');

app.set('views', _path2.default.join(__dirname, 'templates'));
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main', layoutsDir: _path2.default.join(__dirname, 'templates/layouts') }));
app.set('view engine', '.hbs');
app.use(_express2.default.static(_path2.default.join(__dirname, 'public')));

/* Files */


var logger = new _logger.Logger();
var db = new _dbConnect.DbConnect(_config2.default.db.postgres.string);

db.createConnection().then(function (connection) {

    // create reusable transport method (opens pool of SMTP connections)
    var smtpTransport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: "shibbi.arora@gmail.com",
            pass: "Leicester@195"
        }
    });

    connection.query('LISTEN "watchers"');

    connection.on('notification', function (data) {
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: "shibi arora<aroras@cromwell.co.uk>", // sender address
            to: "shibi.arora@gmail.com", // list of receivers
            subject: "Error: Cromwell Reception", // Subject line
            text: data.payload };

        console.log("sending mail");
        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            console.log('Message sent: ' + info);
        });
    });

    var templateManager = new _templateManager.TemplateManager();
    var dataCleaner = new _dataCleaner.DataCleaner();
    //let emitter = new EventEmitter();
    var postgres = new _postgres.Postgres(connection);
    var eventListener = new _eventListener.EventListener(connection, logger);
    var visitorStore = new _visitor.VisitorStore(postgres, logger);
    var visitorService = new _visitor2.VisitorService(visitorStore, templateManager, dataCleaner, logger);
    var visitors = new _visitors.Visitors(visitorService, logger, localStorage);

    /* Start Listening */
    eventListener.listen();
    app.use(_bodyParser2.default.json({ limit: '50mb' })); // to support JSON-encoded bodies
    app.use(_bodyParser2.default.urlencoded({ // to support URL-encoded bodies
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

    _nodeSchedule2.default.scheduleJob(_config2.default.runTime, function () {
        visitors.allSignOut().then(function (done) {
            logger.info("All Signed Out");
        }).catch(function (err) {
            logger.error("Error occurred while Signing Out: " + JSON.stringify(err));
        });
    });

    /* Start up the server */
    app.listen(_config2.default.server.port, function () {
        logger.info("System Listen on port " + _config2.default.server.port);
    });
}).catch(function (err) {
    logger.fatal("Database Failure:  " + err);
    process.exit();
});