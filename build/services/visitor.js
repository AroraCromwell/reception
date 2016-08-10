
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VisitorService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require("../config.json");

var _config2 = _interopRequireDefault(_config);

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");
var pdf = require("html-pdf");
var exec = require('child_process').exec;

var dateFormat = require('dateformat');

var VisitorService = exports.VisitorService = function () {
    function VisitorService(visitorStore, templateManager, dataCleaner, logger) {
        _classCallCheck(this, VisitorService);

        this._visitorStore = visitorStore;
        // this._emitter = emitter;
        this._templateManager = templateManager;
        this._dataCleaner = dataCleaner;
        this._logger = logger;
    }

    _createClass(VisitorService, [{
        key: "processRequest",
        value: function processRequest(data) {
            var _this = this;

            this._logger.info("New Customer!");
            this._logger.info(JSON.stringify(data));
            this._logger.info("Saving Data");

            return this._visitorStore.saveCustomer(data).then(function (res) {
                return res;
            }).then(function (result) {
                //render the template
                var visitorId = result.id;
                var html = _this._templateManager.render('crom_visitor', result);

                var options = {
                    format: 'A5',
                    orientation: 'landscape'
                };

                pdf.create(html, options).toFile('./pdf/' + visitorId + '.pdf', function (err, pdfRes) {
                    if (err) return console.log(err);

                    //var cmd ="lp -o landscape -o scaling=97  -d" + config.printer.set + " "+ pdfRes.filename;

                    var cmd = '"C:\\Program Files (x86)\\Foxit Software\\Foxit Reader\\FoxitReader.exe" /t "C:\\reception-handler\\build\\pdf\\' + visitorId + '.pdf" "BrotherHL-3150CDWseries" “IP_10.100.16.193"';

                    exec(cmd, function (error, stdout, stderr) {
                        // command output is in stdout
                        console.log(stdout);

                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                        //process.exit();
                    });
                });

                return visitorId;
            });
        }
    }, {
        key: "processGetRequest",
        value: function processGetRequest(id) {

            this._logger.info("Existing Customer!");
            this._logger.info("Getting Data");

            return this._visitorStore.getCustomer(id).then(function (data) {
                return data;
            });
        }
    }, {
        key: "allSignIns",
        value: function allSignIns() {

            this._logger.info("Getting All Visitors!");
            this._logger.info("Getting Data");
            return this._visitorStore.getAllSignIns().then(function (data) {
                return data;
            });
        }
    }, {
        key: "processPutRequest",
        value: function processPutRequest(id, data) {

            this._logger.info("Existing Customer!");
            this._logger.info("Signing out");

            return this._visitorStore.updateCustomer(id, data).then(function (data) {
                return data;
            });
        }
    }, {
        key: "allSignOut",
        value: function allSignOut() {

            this._logger.info("Signing Out All Visitors!");

            return this._visitorStore.allSignOut().then(function () {
                return true;
            });
        }
    }, {
        key: "allSignOutToday",
        value: function allSignOutToday() {

            this._logger.info("All Signed Out Today!");

            return this._visitorStore.allSignOutToday().then(function (result) {

                _lodash._.each(result.rows, function (value, key) {
                    value.signout = dateFormat(value.signout, "dd-mm-yyyy HH:MM:ss");
                });

                return result;
            });
        }
    }, {
        key: "getTermsRequest",
        value: function getTermsRequest(id) {
            return this._visitorStore.getTermsRequest(id).then(function (result) {
                var row = result.rows;

                if (row[0].id != _config2.default.terms.version) {
                    fs = require('fs');
                    fs.writeFile('./src/templates/terms_' + row[0].id + '.hbs', row[0].terms_file, function (err) {
                        if (err) return console.log(err);
                        console.log('Terms file created');
                    });
                }

                return 'terms_' + row[0].id;
            });
        }
    }, {
        key: "postTermsRequest",
        value: function postTermsRequest(data) {
            return this._visitorStore.postTermsRequest(data).then(function (result) {
                var row = result.rows;
                if (row[0].id != _config2.default.terms.version) {
                    fs = require('fs');
                    fs.writeFile('./src/templates/terms_' + row[0].id + '.hbs', row[0].terms_file, function (err) {
                        if (err) return console.log(err);
                        console.log('Terms file created');
                    });
                }

                return 'terms_' + row[0].id;
            });
        }
    }, {
        key: "allTermsRequest",
        value: function allTermsRequest() {
            this._logger.info(" Getting All Terms!");

            return this._visitorStore.allTermsRequest().then(function (result) {
                return result;
            });
        }
    }, {
        key: "updateTermsRequest",
        value: function updateTermsRequest(id) {
            this._logger.info(" Updating Term!");

            return this._visitorStore.updateTermsRequest(id).then(function (result) {
                return result;
            });
        }
    }, {
        key: "processStatus",
        value: function processStatus(data) {
            //this._logger.info(JSON.stringify(data));
            return this._visitorStore.saveStatus(data).then(function (res) {
                return res;
            });
        }
    }, {
        key: "cleanStatus",
        value: function cleanStatus() {
            //this._logger.info(JSON.stringify(data));
            return this._visitorStore.cleanStatus().then(function (res) {
                return res;
            });
        }
    }, {
        key: "processGraphData",
        value: function processGraphData() {
            var _this2 = this;

            this._logger.info("getting graph data!");

            return this._visitorStore.processGraphData().then(function (result) {

                var setData = [];

                _lodash._.forEach(result.rows, function (value, key) {
                    var setkey = _this2.timeConverter(value.date_part);
                    var setVal = value.status;
                    setData.push(JSON.stringify({ setkey: setkey, setVal: setVal }));
                });

                return setData;
            });
        }
    }, {
        key: "currentStatus",
        value: function currentStatus() {
            var _this3 = this;

            this._logger.info("Current Device Status!");

            return this._visitorStore.currentStatus().then(function (data) {

                var setData = [];
                _lodash._.forEach(data.rows, function (value, key) {

                    var setkey = _this3.timeConverter(value.date_part);
                    var setVal = value.status;
                    setData.push(JSON.stringify({ setkey: setkey, setVal: setVal }));
                });
                return setData;
            });
        }
    }, {
        key: "timeConverter",
        value: function timeConverter(UNIX_timestamp) {
            var a = new Date(UNIX_timestamp * 1000);
            var time = dateFormat(a, "yyyy-mm-dd HH:MM:ss");
            return time;
        }

        // Auto Complete functionality

    }, {
        key: "autoComplete",
        value: function autoComplete() {
            return this._visitorStore.autoComplete().then(function (res) {
                _lodash._.forEach(res.rows, function (value, key) {
                    if (value.type == 'visitor_name') {
                        value.type = "Visitor Name";
                    }
                });
                return res;
            });
        }
    }, {
        key: "autoCompletePost",
        value: function autoCompletePost(data) {
            var _this4 = this;

            //this._logger.info(JSON.stringify(data));
            return this._visitorStore.autoCompletePost(data).then(function (res) {
                return res;
            }).then(function (result) {
                return _this4._visitorStore.autoCompleteId(result.rows[0].id);
            });
        }
    }, {
        key: "updateAutoComplete",
        value: function updateAutoComplete(id, data) {
            var _this5 = this;

            return this._visitorStore.updateAutoComplete(id, data).then(function (res) {
                return res;
            }).then(function (result) {
                return _this5._visitorStore.autoCompleteId(id);
            });
        }
    }, {
        key: "deleteAutoComplete",
        value: function deleteAutoComplete(id) {
            return this._visitorStore.deleteAutoComplete(id).then(function (res) {
                return res;
            });
        }

        //Staff information

    }, {
        key: "allStaff",
        value: function allStaff() {
            return this._visitorStore.allStaff().then(function (res) {
                return res;
            });
        }
    }, {
        key: "staffData",
        value: function staffData(id) {
            return this._visitorStore.staffData(id).then(function (res) {
                return res;
            });
        }
    }, {
        key: "staffSignIn",
        value: function staffSignIn(id) {
            return this._visitorStore.staffSignIn(id).then(function (res) {
                return res;
            });
        }
    }, {
        key: "staffSignOut",
        value: function staffSignOut(id) {
            return this._visitorStore.staffSignOut(id).then(function (res) {
                return res;
            });
        }

        // All staff signed In

    }, {
        key: "staffSignedIn",
        value: function staffSignedIn(id) {
            return this._visitorStore.staffSignedIn(id).then(function (res) {
                _lodash._.each(res.rows, function (value, key) {
                    value.signin_time = dateFormat(value.signin_time, "dd-mm-yyyy HH:MM:ss");
                });
                return res;
            });
        }

        // All staff signed Out

    }, {
        key: "staffSignedOut",
        value: function staffSignedOut(id) {
            return this._visitorStore.staffSignedOut(id).then(function (res) {

                _lodash._.each(res.rows, function (value, key) {
                    value.signout_time = dateFormat(value.signout_time, "dd-mm-yyyy HH:MM:ss");
                    value.signin_time = dateFormat(value.signin_time, "dd-mm-yyyy HH:MM:ss");
                });

                return res;
            });
        }

        // All Visitors print out

    }, {
        key: "allPrintOut",
        value: function allPrintOut(id) {
            var _this6 = this;

            return this._visitorStore.allPrintOut().then(function (res) {

                _lodash._.each(res.rows, function (value, key) {
                    if (value.signin_time != "undefined") {
                        value.signin_time = dateFormat(value.signin_time, "dd-mm-yyyy HH:MM:ss");
                    }
                });

                return res;
            }).then(function (result) {

                if (id == 1) {

                    //render the Staff
                    var html = _this6._templateManager.render('allStaffPrintOut', { data: result.rows });

                    var options = {
                        format: 'A5',
                        orientation: 'landscape',
                        header: {
                            "height": "15mm",
                            "contents": '<div style="text-align: center;">BRC Staff</div>'
                        },
                        footer: {
                            "height": "10mm",
                            "contents": '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
                        }
                    };

                    pdf.create(html, options).toFile('./pdf/allStaff.pdf', function (err, pdfRes) {

                        var cmd = '"C:\\Program Files (x86)\\Foxit Software\\Foxit Reader\\FoxitReader.exe" /t "C:\\reception-handler\\build\\pdf\\allStaff.pdf" "BrotherHL-3150CDWseries" “IP_10.100.16.193"';

                        exec(cmd, function (error, stdout, stderr) {
                            // command output is in stdout
                            console.log(stdout);

                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                            //process.exit();
                        });
                    });

                    if (result.visitors != null) {
                        //render the Visitors
                        var html = _this6._templateManager.render('allVisitorsPrintOut', { data: result.visitors });

                        var options = {
                            format: 'A5',
                            orientation: 'landscape',
                            header: {
                                "height": "15mm",
                                "contents": '<div style="text-align: center;">BRC Site Visitors</div>'
                            },
                            footer: {
                                "height": "10mm",
                                "contents": '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
                            }

                        };

                        pdf.create(html, options).toFile('./pdf/allVisitors.pdf', function (err, pdfRes) {

                            var cmd = '"C:\\Program Files (x86)\\Foxit Software\\Foxit Reader\\FoxitReader.exe" /t "C:\\reception-handler\\build\\pdf\\allVisitors.pdf" "BrotherHL-3150CDWseries" “IP_10.100.16.193"';

                            exec(cmd, function (error, stdout, stderr) {
                                // command output is in stdout
                                console.log(stdout);

                                if (error !== null) {
                                    console.log('exec error: ' + error);
                                }
                                //process.exit();
                            });
                        });
                    }
                }

                return result;
            });
        }
    }, {
        key: "addFiremarshall",
        value: function addFiremarshall(data) {
            return this._visitorStore.addFiremarshall(data).then(function (res) {
                return res;
            });
        }
    }, {
        key: "updateFiremarshall",
        value: function updateFiremarshall(id, data) {
            return this._visitorStore.updateFiremarshall(id, data).then(function (res) {
                return res;
            });
        }
    }, {
        key: "allFireMarshall",
        value: function allFireMarshall() {
            return this._visitorStore.allFiremarshall().then(function (res) {
                return res;
            });
        }
    }, {
        key: "deleteFireMarshall",
        value: function deleteFireMarshall(id) {
            return this._visitorStore.deleteFiremarshall(id).then(function (res) {
                return res;
            });
        }
    }, {
        key: "fireMarshallMail",
        value: function fireMarshallMail() {
            return this._visitorStore.fireMarshallMail().then(function (res) {
                return res;
            });
        }

        //Search

    }, {
        key: "searchAllSignIns",
        value: function searchAllSignIns(id) {

            this._logger.info("Getting All Visitors!");
            this._logger.info("Getting Data");
            return this._visitorStore.searchAllSignIns(id).then(function (data) {
                return data;
            });
        }

        //NFC Activity

    }, {
        key: "nfcActivity",
        value: function nfcActivity(id) {
            return this._visitorStore.nfcActivity(id).then(function (res) {
                return res;
            });
        }
    }]);

    return VisitorService;
}();