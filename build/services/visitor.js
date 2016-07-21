
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

                var options = { format: 'A5', orientation: 'landscape' };

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
            }).catch(function (err) {
                _this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "processGetRequest",
        value: function processGetRequest(id) {
            var _this2 = this;

            this._logger.info("Existing Customer!");
            this._logger.info("Getting Data");

            return this._visitorStore.getCustomer(id).then(function (data) {
                return data;
            }).catch(function (err) {
                _this2._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "allSignIns",
        value: function allSignIns() {
            var _this3 = this;

            this._logger.info("Getting All Visitors!");
            this._logger.info("Getting Data");
            return this._visitorStore.getAllSignIns().then(function (data) {
                return data;
            }).catch(function (err) {
                _this3._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "processPutRequest",
        value: function processPutRequest(id, data) {
            var _this4 = this;

            this._logger.info("Existing Customer!");
            this._logger.info("Signing out");

            return this._visitorStore.updateCustomer(id, data).then(function (data) {
                return data;
            }).catch(function (err) {
                _this4._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "allSignOut",
        value: function allSignOut() {
            var _this5 = this;

            this._logger.info("Signing Out All Visitors!");

            return this._visitorStore.allSignOut().then(function () {
                return true;
            }).catch(function (err) {
                _this5._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "allSignOutToday",
        value: function allSignOutToday() {
            var _this6 = this;

            this._logger.info("All Signed Out Today!");

            return this._visitorStore.allSignOutToday().then(function (result) {

                _lodash._.each(result.rows, function (value, key) {
                    value.signout = dateFormat(value.signout, "dd-mm-yyyy HH:MM:ss");
                });

                return result;
            }).catch(function (err) {
                _this6._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "getTermsRequest",
        value: function getTermsRequest(id) {
            var _this7 = this;

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
            }).catch(function (err) {
                _this7._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "postTermsRequest",
        value: function postTermsRequest(data) {
            var _this8 = this;

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
            }).catch(function (err) {
                _this8._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "allTermsRequest",
        value: function allTermsRequest() {
            var _this9 = this;

            this._logger.info(" Getting All Terms!");

            return this._visitorStore.allTermsRequest().then(function (result) {
                return result;
            }).catch(function (err) {
                _this9._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "updateTermsRequest",
        value: function updateTermsRequest(id) {
            var _this10 = this;

            this._logger.info(" Updating Term!");

            return this._visitorStore.updateTermsRequest(id).then(function (result) {
                return result;
            }).catch(function (err) {
                _this10._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "processStatus",
        value: function processStatus(data) {
            var _this11 = this;

            //this._logger.info(JSON.stringify(data));
            return this._visitorStore.saveStatus(data).then(function (res) {
                return res;
            }).catch(function (err) {
                _this11._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "cleanStatus",
        value: function cleanStatus() {
            var _this12 = this;

            //this._logger.info(JSON.stringify(data));
            return this._visitorStore.cleanStatus().then(function (res) {
                return res;
            }).catch(function (err) {
                _this12._logger.error("Problem while cleaning status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "processGraphData",
        value: function processGraphData() {
            var _this13 = this;

            this._logger.info("getting graph data!");

            return this._visitorStore.processGraphData().then(function (result) {

                var setData = [];

                _lodash._.forEach(result.rows, function (value, key) {
                    var setkey = _this13.timeConverter(value.date_part);
                    var setVal = value.status;
                    setData.push(JSON.stringify({ setkey: setkey, setVal: setVal }));
                });

                return setData;
            }).catch(function (err) {
                _this13._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "currentStatus",
        value: function currentStatus() {
            var _this14 = this;

            this._logger.info("Current Device Status!");

            return this._visitorStore.currentStatus().then(function (data) {

                var setData = [];
                _lodash._.forEach(data.rows, function (value, key) {

                    var setkey = _this14.timeConverter(value.date_part);
                    var setVal = value.status;
                    setData.push(JSON.stringify({ setkey: setkey, setVal: setVal }));
                });
                return setData;
            }).catch(function (err) {
                _this14._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
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
            var _this15 = this;

            return this._visitorStore.autoComplete().then(function (res) {
                _lodash._.forEach(res.rows, function (value, key) {
                    if (value.type == 'visitor_name') {
                        value.type = "Visitor Name";
                    }
                });
                return res;
            }).catch(function (err) {
                _this15._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "autoCompletePost",
        value: function autoCompletePost(data) {
            var _this16 = this;

            //this._logger.info(JSON.stringify(data));
            return this._visitorStore.autoCompletePost(data).then(function (res) {
                return res;
            }).then(function (result) {
                return _this16._visitorStore.autoCompleteId(result.rows[0].id);
            }).catch(function (err) {
                _this16._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "updateAutoComplete",
        value: function updateAutoComplete(id, data) {
            var _this17 = this;

            return this._visitorStore.updateAutoComplete(id, data).then(function (res) {
                return res;
            }).then(function (result) {
                return _this17._visitorStore.autoCompleteId(id);
            }).catch(function (err) {
                _this17._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "deleteAutoComplete",
        value: function deleteAutoComplete(id) {
            var _this18 = this;

            return this._visitorStore.deleteAutoComplete(id).then(function (res) {
                return res;
            }).catch(function (err) {
                _this18._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }

        //Staff information

    }, {
        key: "allStaff",
        value: function allStaff() {
            var _this19 = this;

            return this._visitorStore.allStaff().then(function (res) {
                return res;
            }).catch(function (err) {
                _this19._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "staffSignIn",
        value: function staffSignIn(id) {
            var _this20 = this;

            return this._visitorStore.staffSignIn(id).then(function (res) {
                return res;
            }).catch(function (err) {
                _this20._logger.error("Problem while Staff Sign In: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }, {
        key: "staffSignOut",
        value: function staffSignOut(id) {
            var _this21 = this;

            return this._visitorStore.staffSignOut(id).then(function (res) {
                return res;
            }).catch(function (err) {
                _this21._logger.error("Problem while Staff Sign Out: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }

        // All staff signed In

    }, {
        key: "staffSignedIn",
        value: function staffSignedIn(id) {
            var _this22 = this;

            return this._visitorStore.staffSignedIn(id).then(function (res) {
                return res;
            }).catch(function (err) {
                _this22._logger.error("Problem while Staff Sign In: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }

        //Search

    }, {
        key: "searchAllSignIns",
        value: function searchAllSignIns(id) {
            var _this23 = this;

            this._logger.info("Getting All Visitors!");
            this._logger.info("Getting Data");
            return this._visitorStore.searchAllSignIns(id).then(function (data) {
                return data;
            }).catch(function (err) {
                _this23._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
        }
    }]);

    return VisitorService;
}();