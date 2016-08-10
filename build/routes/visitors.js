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

var base64 = require('node-base64-image');
var thumb = require('node-thumbnail').thumb;

var Visitors = exports.Visitors = function () {
    function Visitors(visitorService, logger, localStorage, io, sendMail) {
        _classCallCheck(this, Visitors);

        this._visitorService = visitorService;
        this._logger = logger;
        this._localStorage = localStorage;
        this._io = io;
        this._sendMail = sendMail;
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
                if (req.body.inputEmail == "admin@admin.com" && req.body.inputPassword == "Lewis@3524") {
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
                _this13._visitorService.processStatus(req.body).then(function (result) {
                    res.send({ success: 1, message: "completed", data: {}, retry: 0 });
                }).catch(function (err) {
                    _this13._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "cleanStatus",
        value: function cleanStatus() {
            var _this14 = this;

            return this._visitorService.cleanStatus().then(function (result) {
                return { success: 1, message: "completed", data: {}, retry: 0 };
            }).catch(function (err) {
                _this14._logger.error(err);
                return err;
            });
        }
    }, {
        key: "deviceStatus",
        value: function deviceStatus(data) {
            var _this15 = this;

            console.log("device status");
            this._visitorService.processStatus(data).then(function (result) {
                //res.send({success : 1, message : "completed", data : {}, retry: 0});
            }).catch(function (err) {
                _this15._logger.error(err);
                //res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
            });
        }
    }, {
        key: "graph",
        value: function graph() {
            var _this16 = this;

            return [function (req, res) {
                _this16._visitorService.processGraphData().then(function (result) {
                    res.render('graph_data', { "data": result });
                }).catch(function (err) {
                    _this16._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "currentStatus",
        value: function currentStatus() {
            var _this17 = this;

            return [function (req, res) {
                _this17._visitorService.currentStatus().then(function (result) {
                    res.send({ success: 1, message: "completed", data: { result: result } });
                }).catch(function (err) {
                    _this17._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "autoCompleteAdd",
        value: function autoCompleteAdd() {
            return [function (req, res) {
                res.render('autoComplete_add');
            }];
        }
    }, {
        key: "autoCompletePost",
        value: function autoCompletePost() {
            var _this18 = this;

            return [function (req, res) {

                _this18._visitorService.autoCompletePost(req.body).then(function (result) {

                    if (result.rows[0].location == 'BRC') {
                        _this18._io.emit('brcSuggestionAdd', result.rows[0]);
                    }

                    if (req.body.another != "undefined") {
                        res.redirect("/autoCompleteAdd/?type=" + req.body.type);
                    } else {
                        res.redirect("/autoComplete");
                    }
                }).catch(function (err) {
                    _this18._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "updateAutoComplete",
        value: function updateAutoComplete() {
            var _this19 = this;

            return [function (req, res) {
                _this19._visitorService.updateAutoComplete(req.params.id, req.body).then(function (result) {
                    if (result.rows[0].location == 'BRC') {
                        _this19._io.emit('brcSuggestionUpdate', result.rows[0]);
                    }
                    res.redirect("/autoComplete");
                }).catch(function (err) {
                    _this19._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "deleteAutoComplete",
        value: function deleteAutoComplete() {
            var _this20 = this;

            return [function (req, res) {
                _this20._visitorService.deleteAutoComplete(req.params.id).then(function (result) {
                    //Fire delete message, So Device will delete it from Android App
                    var myString = { "id": req.params.id, "type": req.body.type };
                    _this20._io.emit('brcSuggestionDelete', myString);
                    res.send({ success: 1, message: "completed", data: { result: result } });
                }).catch(function (err) {
                    _this20._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "autoComplete",
        value: function autoComplete() {
            var _this21 = this;

            return [function (req, res) {
                if (_this21._localStorage.getItem('email')) {
                    _this21._visitorService.autoComplete().then(function (result) {
                        var row = result.rows;
                        res.render('auto_Complete', { data: row });
                    }).catch(function (err) {
                        _this21._logger.error(err);
                        res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                    });
                } else {
                    res.redirect("/");
                }
            }];
        }
    }, {
        key: "autoCompleteId",
        value: function autoCompleteId() {
            var _this22 = this;

            return [function (req, res) {
                _this22._visitorService.autoCompleteId(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.render('auto_Complete', { data: row });
                }).catch(function (err) {
                    _this22._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }

        // Staff information

    }, {
        key: "allStaff",
        value: function allStaff() {
            var _this23 = this;

            return [function (req, res) {
                _this23._visitorService.allStaff().then(function (result) {
                    var row = result.rows;
                    res.send({ status: 'ok', count: '20', count_total: result.rowCount, data: row });
                }).catch(function (err) {
                    _this23._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffData",
        value: function staffData() {
            var _this24 = this;

            return [function (req, res) {
                _this24._visitorService.staffData(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.send({ status: 'ok', count: '20', count_total: result.rowCount, data: row });
                }).catch(function (err) {
                    _this24._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffSignIn",
        value: function staffSignIn() {
            var _this25 = this;

            return [function (req, res) {

                _this25._visitorService.staffSignIn(req.params.id).then(function (result) {
                    res.send({ success: 1, message: "completed" });
                }).catch(function (err) {
                    _this25._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffSignedIn",
        value: function staffSignedIn() {
            var _this26 = this;

            return [function (req, res) {

                _this26._visitorService.staffSignedIn(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.render('all_staffsignedin', { data: row });
                }).catch(function (err) {
                    _this26._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffSignOut",
        value: function staffSignOut() {
            var _this27 = this;

            return [function (req, res) {

                _this27._visitorService.staffSignOut(req.params.id).then(function (result) {
                    res.send({ success: 1, message: "completed", data: JSON.stringify(result.rows) });
                }).catch(function (err) {
                    _this27._logger.error(err.message);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err.message), retry: 1 });
                });
            }];
        }
    }, {
        key: "captureStaffImage",
        value: function captureStaffImage() {
            return [function (req, res) {
                console.log("this is staff id" + req.body.paramStaffId);
                console.log("this is staff image path" + req.body.paramLocalImagePath);

                var imageName = req.body.paramStaffId;
                var options = { filename: './public/images/' + imageName };
                //var options = {filename: './src/reception_handler/images/' + imageName};
                var imageData = new Buffer(req.body.paramImagePath, 'base64');

                base64.base64decoder(imageData, options, function (err, saved) {
                    if (err) {
                        console.log(err);
                        res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                    }
                    console.log(saved);

                    res.send({ success: 1, message: "Completed" });
                });
            }];
        }
    }, {
        key: "allPrintOut",
        value: function allPrintOut() {
            var _this28 = this;

            return [function (req, res) {

                var id = req.params.id == null ? 1 : req.params.id;

                _this28._visitorService.allPrintOut(id).then(function (result) {
                    return result;
                }).then(function (response) {
                    var combineData = response;
                    console.log(combineData.rows);
                    _this28._visitorService.fireMarshallMail().then(function (res) {

                        var emailReceiver = [];
                        _lodash._.each(res.rows, function (value, key) {
                            emailReceiver.push(value.email_adds);
                        });

                        var emailR = emailReceiver.toString();

                        var mailOptions = {
                            from: "IT Services<aroras@cromwell.co.uk>", // sender address
                            to: emailR, // list of receivers
                            subject: "Fire: Cromwell Reception", // Subject line
                            text: "There is fire in the building. Please find attached list of all Staff and Visitors in the building.",
                            attachments: [{ // utf-8 string as an attachment
                                filename: "staff.pdf",
                                content: "C:\\reception-handler\\build\\pdf\\allStaff.pdf"
                            }, {
                                filename: "visitors.pdf",
                                content: "C:\\reception-handler\\build\\pdf\\allVisitors.pdf"
                            }]
                        };

                        console.log("Sending Email ");
                        //this._sendMail.mail(mailOptions);
                    });

                    if (id == 1) {
                        res.render('allPrintOut', { data: combineData });
                    } else {
                        res.render('allVisitorsPrintOutWithPrint', { data: combineData });
                    }
                }).catch(function (err) {
                    _this28._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "showFiremarshall",
        value: function showFiremarshall() {
            return [function (req, res) {
                res.render('show_firemarshall');
            }];
        }
    }, {
        key: "addFiremarshall",
        value: function addFiremarshall() {
            var _this29 = this;

            return [function (req, res) {
                _this29._visitorService.addFiremarshall(req.body).then(function (result) {

                    if (req.body.another != "undefined") {
                        res.redirect("/fireMarshall");
                    } else {
                        res.redirect("/allFireMarshall");
                    }
                }).catch(function (err) {
                    _this29._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "updateFiremarshall",
        value: function updateFiremarshall() {
            var _this30 = this;

            return [function (req, res) {
                _this30._visitorService.updateFiremarshall(req.params.id, req.body).then(function (result) {
                    res.redirect("/allFireMarshall");
                }).catch(function (err) {
                    _this30._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "allFireMarshall",
        value: function allFireMarshall() {
            var _this31 = this;

            return [function (req, res) {
                _this31._visitorService.allFireMarshall().then(function (result) {
                    var row = result.rows;
                    //res.render("/allVisitorsPrintOut", {data: row});
                    res.render('all_firemarshall', { data: row });
                }).catch(function (err) {
                    _this31._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "deleteFireMarshall",
        value: function deleteFireMarshall() {
            var _this32 = this;

            return [function (req, res) {
                _this32._visitorService.deleteFireMarshall(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.render('all_firemarshall', { data: row });
                }).catch(function (err) {
                    _this32._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }

        //NFC SignIn And SignOut

    }, {
        key: "nfcActivity",
        value: function nfcActivity() {
            var _this33 = this;

            return [function (req, res) {

                _this33._visitorService.nfcActivity(req.params.id).then(function (result) {
                    var status = result.activity == "UPDATE" ? "sign_out" : "sign_in";
                    res.send({ message: "Success", activity: status, name: result.rows[0].first_name + " " + result.rows[0].surname });
                }).catch(function (err) {
                    _this33._logger.error(err);
                    res.send({ message: "Error", data: JSON.stringify(err) });
                });
            }];
        }
    }]);

    return Visitors;
}();