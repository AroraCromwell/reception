/**
 * index
 */

"use strict";

/* Node modules */

/* Third-party modules */

/* Files */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Visitors = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Visitors = exports.Visitors = function () {
    function Visitors(visitorService, logger, localStorage) {
        _classCallCheck(this, Visitors);

        this._visitorService = visitorService;
        this._logger = logger;
        this._localStorage = localStorage;
    }

    _createClass(Visitors, [{
        key: "get",
        value: function get() {
            var _this = this;

            return [function (req, res) {

                _this._visitorService.processGetRequest(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.send({ success: 1, message: "completed", data: { row: row }, retry: 0 });
                }).catch(function (err) {
                    _this._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "allSignIns",
        value: function allSignIns() {
            var _this2 = this;

            return [function (req, res) {
                if (_this2._localStorage.getItem('email')) {
                    _this2._visitorService.allSignIns().then(function (result) {
                        var row = result.rows;
                        res.render('all_visitors', { data: row });
                        // res.send({success : 1, message : "completed", row, retry: 0});
                    }).catch(function (err) {
                        _this2._logger.error(err);
                        res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                    });
                } else {
                    res.redirect("/");
                }
            }];
        }
    }, {
        key: "post",
        value: function post() {
            var _this3 = this;

            return [function (req, res) {

                console.log("Node service data" + req.body);
                _this3._visitorService.processRequest(req.body).then(function (result) {
                    res.send({ success: 1, message: "completed", id: result, retry: 0 });
                }).catch(function (err) {
                    _this3._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "allSignOut",
        value: function allSignOut() {
            var _this4 = this;

            return this._visitorService.allSignOut().then(function (result) {
                return { success: 1, message: "completed", data: {}, retry: 0 };
            }).catch(function (err) {
                _this4._logger.error(err);
                return err;
            });
        }
    }, {
        key: "allSignOutToday",
        value: function allSignOutToday() {
            var _this5 = this;

            return [function (req, res) {
                if (_this5._localStorage.getItem('email')) {
                    _this5._visitorService.allSignOutToday().then(function (result) {
                        var row = result.rows;
                        res.render('all_signed_out', { data: row });
                        //res.send({success : 1, message : "completed", data : {}, retry: 0});
                    }).catch(function (err) {
                        _this5._logger.error(err);
                        res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                    });
                } else {
                    res.redirect('/');
                }
            }];
        }
    }, {
        key: "put",
        value: function put() {
            var _this6 = this;

            return [function (req, res) {

                if (req.params.id == 0) {
                    console.log("No value given");
                    res.send({ success: 0, message: "Error", data: "", retry: 1 });
                } else {

                    _this6._visitorService.processPutRequest(req.params.id, req.body).then(function (result) {

                        res.send({ success: 1, message: "completed", data: {}, retry: 0 });
                    }).catch(function (err) {
                        _this6._logger.error(err);
                        res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                    });
                }
            }];
        }
    }, {
        key: "loginView",
        value: function loginView() {
            var _this7 = this;

            var error = "";
            return [function (req, res) {
                if (_this7._localStorage.getItem("email")) {
                    _this7._localStorage.removeItem("email");
                }

                if (_this7._localStorage.getItem("error")) {
                    error = _this7._localStorage.getItem("error");

                    res.render("admin_login", { data: error });
                    _this7._localStorage.removeItem("error");
                } else {
                    res.render("admin_login", { data: "" });
                }
            }];
        }
    }, {
        key: "adminLogin",
        value: function adminLogin() {
            var _this8 = this;

            return [function (req, res) {
                if (req.body.inputEmail == "admin@admin.com" && req.body.inputPassword == "1234") {
                    _this8._localStorage.setItem("email", req.body.inputEmail);
                    res.redirect("allVisitors");
                } else {
                    _this8._localStorage.setItem("error", "Please Check Username and Password");
                    res.redirect("/");
                }
            }];
        }
    }, {
        key: "getTerms",
        value: function getTerms() {
            var _this9 = this;

            return [function (req, res) {
                var id = req.params.id;

                _this9._visitorService.getTermsRequest(id).then(function (result) {

                    res.render(result, { title: 'my other page', layout: '' });
                }).catch(function (err) {
                    _this9._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "postTerms",
        value: function postTerms() {
            var _this10 = this;

            return [function (req, res) {

                _this10._visitorService.postTermsRequest(req.body).then(function (result) {
                    res.redirect('allTerms');
                }).catch(function (err) {
                    _this10._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "updateTerms",
        value: function updateTerms() {
            var _this11 = this;

            return [function (req, res) {

                _this11._visitorService.updateTermsRequest(req.params.id).then(function (result) {
                    //res.render("allTerms",{"data": result.rows});
                    res.send({ success: 1, message: "Success!", data: " ", retry: 0 });
                }).catch(function (err) {
                    _this11._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "allTerms",
        value: function allTerms() {
            var _this12 = this;

            return [function (req, res) {

                _this12._visitorService.allTermsRequest().then(function (result) {

                    // console.log(result.rows);
                    // process.exit();

                    res.render("allTerms", { "data": result.rows, helpers: {
                            checkStatus: function checkStatus(status) {
                                if (status == 1) {
                                    return 'checked';
                                }
                            }
                        } });
                }).catch(function (err) {
                    _this12._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "templateTerms",
        value: function templateTerms() {

            return [function (req, res) {
                res.render('addTerms');
            }];
        }
    }, {
        key: "test",
        value: function test() {

            return [function (req, res) {
                res.render('crom_visitor');
            }];
        }
    }, {
        key: "status",
        value: function status() {
            var _this13 = this;

            return [function (req, res) {
                //
                // console.log(req.body);
                // process.exit();
                _this13._visitorService.processStatus(req.body).then(function (result) {

                    //console.log(result);
                    //process.exit();
                    res.send({ success: 1, message: "completed", data: {}, retry: 0 });
                }).catch(function (err) {
                    _this13._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "graph",
        value: function graph() {
            var _this14 = this;

            return [function (req, res) {
                _this14._visitorService.processGraphData().then(function (result) {
                    res.render('graph_data', { "data": result });
                }).catch(function (err) {
                    _this14._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "currentStatus",
        value: function currentStatus() {
            var _this15 = this;

            return [function (req, res) {
                _this15._visitorService.currentStatus().then(function (result) {
                    res.send({ success: 1, message: "completed", data: { result: result } });
                }).catch(function (err) {
                    _this15._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "timeConverter",
        value: function timeConverter(UNIX_timestamp) {
            var a = new Date(UNIX_timestamp * 1000);
            var hour = a.getHours();
            // if(hour < 10) {
            //     hour = '0' + hour;
            // }

            var min = a.getMinutes();
            if (min < 10) {
                min = '0' + min;
            }

            var sec = a.getSeconds();
            if (sec < 10) {
                sec = '0' + sec;
            }

            var time = hour + '.' + min;
            return time;
        }
    }]);

    return Visitors;
}();