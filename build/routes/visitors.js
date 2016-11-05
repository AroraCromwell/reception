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
var Print = require('pliigo-cups-agent');
var PrintManager = new Print();
var exec = require('child_process').exec;

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
                    if (typeof req.query.tabId == 'undefined' || req.query.tabId == 0) {
                        var err = "Tablet Id cannot be null or 0";
                        _this2._logger.error(err);
                        res.send({ success: 0, message: "Error!", data: err });
                        return;
                    }

                    _this2._visitorService.allTabletLocations().then(function (locations) {
                        _this2._visitorService.allSignIns(req.query.tabId).then(function (result) {
                            result.locations = locations.rows;
                            res.render('all_visitors', { data: result });
                        });
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
                _this3._logger.info("Visitor for Tab Id" + req.query.tabId);

                if (typeof req.query.tabId == 'undefined' || req.query.tabId == 0) {
                    var err = "Tablet Id cannot be null or 0";
                    _this3._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: err });
                    return;
                }

                _this3._visitorService.processRequest(req.query.tabId, req.body).then(function (result) {
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

                    if (typeof req.query.tabId == 'undefined' || req.query.tabId == 0) {
                        var err = "Tablet Id cannot be null or 0";
                        _this5._logger.error(err);
                        res.send({ success: 0, message: "Error!", data: err });
                        return;
                    }

                    _this5._visitorService.allTabletLocations().then(function (locations) {
                        _this5._visitorService.allSignOutToday().then(function (result) {
                            result.locations = locations.rows;
                            res.render('all_signed_out', { data: result });
                        });
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
                    res.redirect("allVisitors?tabId=1");
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
                _this9._visitorService.allTabletLocations().then(function (locations) {
                    _this9._visitorService.getTermsRequest(id).then(function (result) {
                        result.locations = locations.rows;
                        res.render(result, { title: 'my other page', layout: '' });
                    });
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
                _this12._visitorService.allTabletLocations().then(function (locations) {
                    _this12._visitorService.allTermsRequest().then(function (result) {
                        result.lcoations = locations.rows;
                        res.render("allTerms", {
                            "data": result, helpers: {
                                checkStatus: function checkStatus(status) {
                                    if (status == 1) {
                                        return 'checked';
                                    }
                                }
                            }
                        });
                    });
                }).catch(function (err) {
                    _this12._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "templateTerms",
        value: function templateTerms() {
            var _this13 = this;

            return [function (req, res) {
                _this13._visitorService.allTabletLocations().then(function (locations) {
                    res.render('addTerms', { data: locations.rows });
                });
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
            var _this14 = this;

            return [function (req, res) {
                _this14._visitorService.processStatus(req.body).then(function (result) {
                    res.send({ success: 1, message: "completed", data: {}, retry: 0 });
                }).catch(function (err) {
                    _this14._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "cleanStatus",
        value: function cleanStatus() {
            var _this15 = this;

            return this._visitorService.cleanStatus().then(function (result) {
                return { success: 1, message: "completed", data: {}, retry: 0 };
            }).catch(function (err) {
                _this15._logger.error(err);
                return err;
            });
        }
    }, {
        key: "deviceStatus",
        value: function deviceStatus(data) {
            var _this16 = this;

            console.log("device status");
            this._visitorService.processStatus(data).then(function (result) {
                //res.send({success : 1, message : "completed", data : {}, retry: 0});
            }).catch(function (err) {
                _this16._logger.error(err);
                //res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
            });
        }
    }, {
        key: "graph",
        value: function graph() {
            var _this17 = this;

            return [function (req, res) {
                _this17._visitorService.allTabletLocations().then(function (locations) {
                    _this17._visitorService.processGraphData().then(function (result) {
                        result.locations = locations.rows;
                        res.render('graph_data', { "data": result });
                    });
                }).catch(function (err) {
                    _this17._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "currentStatus",
        value: function currentStatus() {
            var _this18 = this;

            return [function (req, res) {
                _this18._visitorService.currentStatus().then(function (result) {
                    res.send({ success: 1, message: "completed", data: { result: result } });
                }).catch(function (err) {
                    _this18._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "autoCompleteAdd",
        value: function autoCompleteAdd() {
            var _this19 = this;

            return [function (req, res) {
                //res.render('autoComplete_add');
                //We actually need all the tablets to be listed while adding suggestion.
                _this19._visitorService.allTabletLocations().then(function (result) {
                    res.render('autoComplete_add', { "data": result.rows });
                }).catch(function (err) {
                    _this19._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "allTabletLocations",
        value: function allTabletLocations() {
            var _this20 = this;

            return [function (req, res) {
                //res.render('autoComplete_add');
                //We actually need all the tablets to be listed while adding suggestion.
                _this20._visitorService.allTabletLocations().then(function (result) {
                    res.send(result.rows);
                }).catch(function (err) {
                    _this20._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "autoCompletePost",
        value: function autoCompletePost() {
            var _this21 = this;

            return [function (req, res) {

                _this21._visitorService.autoCompletePost(req.body).then(function (result) {
                    // set up json data to emit which includes location Id and data
                    // check how to receive this data on android side
                    _this21._io.emit('AddSuggestion-' + result.rows[0].tablet_id, result.rows[0]);

                    if (req.body.another != "undefined") {
                        res.redirect("/autoCompleteAdd/?type=" + req.body.type);
                    } else {
                        res.redirect("/autoComplete");
                    }
                }).catch(function (err) {
                    _this21._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "updateAutoComplete",
        value: function updateAutoComplete() {
            var _this22 = this;

            return [function (req, res) {
                _this22._visitorService.updateAutoComplete(req.params.id, req.body).then(function (result) {
                    if (result.rows[0].location == 'BRC') {
                        console.log("Suggestion will be updated on TabletID" + result.rows[0].tablet_id);
                        _this22._io.emit("UpdateSuggestion-" + result.rows[0].tablet_id, result.rows[0]);
                    }
                    res.redirect("/autoComplete");
                }).catch(function (err) {
                    _this22._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "deleteAutoComplete",
        value: function deleteAutoComplete() {
            var _this23 = this;

            return [function (req, res) {
                _this23._visitorService.deleteAutoComplete(req.params.id).then(function (result) {
                    //Fire delete message, So Device will delete it from Android App
                    var myString = { "id": req.params.id, "type": req.body.type };
                    //this._io.emit('brcSuggestionDelete', myString);
                    _this23._io.emit('DeleteSuggestion-' + result.rows[0].tablet_id, myString);
                    res.send({ success: 1, message: "completed", data: { result: result } });
                }).catch(function (err) {
                    _this23._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "autoComplete",
        value: function autoComplete() {
            var _this24 = this;

            return [function (req, res) {
                if (_this24._localStorage.getItem('email')) {
                    _this24._visitorService.allTabletLocations().then(function (locations) {
                        _this24._visitorService.autoComplete().then(function (result) {
                            result.locations = locations.rows;
                            res.render('auto_Complete', { data: result });
                        });
                    }).catch(function (err) {
                        _this24._logger.error(err);
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
            var _this25 = this;

            return [function (req, res) {
                _this25._visitorService.autoCompleteId(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.render('auto_Complete', { data: row });
                }).catch(function (err) {
                    _this25._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }

        // Staff information

    }, {
        key: "allStaff",
        value: function allStaff() {
            var _this26 = this;

            return [function (req, res) {
                _this26._logger.info("Staff for Tab Id" + req.query.tabId);
                _this26._visitorService.allStaff(req.query.tabId).then(function (result) {
                    var row = result.rows;
                    res.send({ status: 'ok', count: '20', count_total: result.rowCount, data: row });
                }).catch(function (err) {
                    _this26._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffData",
        value: function staffData() {
            var _this27 = this;

            return [function (req, res) {
                _this27._visitorService.staffData(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.send({ status: 'ok', count: '20', count_total: result.rowCount, data: row });
                }).catch(function (err) {
                    _this27._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffSignIn",
        value: function staffSignIn() {
            var _this28 = this;

            return [function (req, res) {

                _this28._visitorService.staffSignIn(req.params.id).then(function (result) {
                    res.send({ success: 1, message: "completed" });
                }).catch(function (err) {
                    _this28._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffSignedIn",
        value: function staffSignedIn() {
            var _this29 = this;

            return [function (req, res) {

                _this29._visitorService.staffSignedIn(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.render('all_staffsignedin', { data: row });
                }).catch(function (err) {
                    _this29._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffSignedOut",
        value: function staffSignedOut() {
            var _this30 = this;

            return [function (req, res) {

                _this30._visitorService.allTabletLocations().then(function (locations) {
                    _this30._visitorService.staffSignedOut(req.params.id).then(function (result) {
                        result.locations = locations.rows;
                        //console.log(locations.rows);
                        //result.locations = JSON.parse(req.locations);
                        res.render('all_staffsignedout', { data: result });
                    });
                }).catch(function (err) {
                    _this30._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "staffSignOut",
        value: function staffSignOut() {
            var _this31 = this;

            return [function (req, res) {

                _this31._visitorService.staffSignOut(req.params.id).then(function (result) {
                    res.send({ success: 1, message: "completed", data: JSON.stringify(result.rows) });
                }).catch(function (err) {
                    _this31._logger.error(err.message);
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

                var dir = "./public/images/staff/";

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                var imageName = req.body.paramStaffId;
                var options = { filename: dir + imageName };
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
            var _this32 = this;

            return [function (req, res) {

                var id = req.params.id == null ? 1 : req.params.id;

                _this32._visitorService.allPrintOut(id).then(function (result) {
                    return result;
                }).then(function (response) {
                    var combineData = response;
                    _this32._visitorService.fireMarshallMail().then(function (res) {
                        var emailReceiver = [];
                        _lodash._.each(res.rows, function (value, key) {
                            emailReceiver.push(value.email_adds);
                        });

                        var emailR = emailReceiver.toString();
                        console.log(emailR);
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
                    _this32._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "showFiremarshall",
        value: function showFiremarshall() {
            var _this33 = this;

            return [function (req, res) {
                //We actually need all the tablets to be listed while adding suggestion.
                _this33._visitorService.allTabletLocations().then(function (result) {
                    res.render('show_firemarshall', { "data": result.rows });
                }).catch(function (err) {
                    _this33._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "addFiremarshall",
        value: function addFiremarshall() {
            var _this34 = this;

            return [function (req, res) {
                _this34._visitorService.addFiremarshall(req.body).then(function (result) {

                    if (req.body.another != "undefined") {
                        res.redirect("/fireMarshall");
                    } else {
                        res.redirect("/allFireMarshall");
                    }
                }).catch(function (err) {
                    _this34._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "updateFiremarshall",
        value: function updateFiremarshall() {
            var _this35 = this;

            return [function (req, res) {
                _this35._visitorService.updateFiremarshall(req.params.id, req.body).then(function (result) {
                    res.redirect("/allFireMarshall");
                }).catch(function (err) {
                    _this35._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "allFireMarshall",
        value: function allFireMarshall() {
            var _this36 = this;

            return [function (req, res) {
                _this36._visitorService.allFireMarshall().then(function (result) {
                    var row = result.rows;
                    //res.render("/allVisitorsPrintOut", {data: row});
                    res.render('all_firemarshall', { data: row });
                }).catch(function (err) {
                    _this36._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "deleteFireMarshall",
        value: function deleteFireMarshall() {
            var _this37 = this;

            return [function (req, res) {
                _this37._visitorService.deleteFireMarshall(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.render('all_firemarshall', { data: row });
                }).catch(function (err) {
                    _this37._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }

        //NFC SignIn And SignOut

    }, {
        key: "nfcActivity",
        value: function nfcActivity() {
            var _this38 = this;

            return [function (req, res) {

                _this38._visitorService.nfcActivity(req.params.id).then(function (result) {
                    var status = result.activity == "UPDATE" ? "sign_out" : "sign_in";
                    res.send({ message: "Success", activity: status, name: result.rows[0].first_name + " " + result.rows[0].surname });
                }).catch(function (err) {
                    _this38._logger.error(err);
                    res.send({ message: "Error", data: JSON.stringify(err) });
                });
            }];
        }

        //Functionality for Tablets

    }, {
        key: "addTablet",
        value: function addTablet() {
            var _this39 = this;

            return [function (req, res) {
                _this39.getAllPrinters().then(function (printerResult) {
                    _this39._visitorService.addTablet().then(function (result) {
                        result.allPrinters = printerResult.printersArray;
                        res.render('add_tablet', { data: result });
                    });
                }).catch(function (err) {
                    _this39._logger.error(err);
                    res.send({ message: "Error", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "tabletPost",
        value: function tabletPost() {
            var _this40 = this;

            return [function (req, res) {
                _this40._visitorService.tabletPost(req.body).then(function (result) {
                    if (req.body.another != "undefined") {
                        res.redirect("/addTablet/?location=" + req.body.location);
                    } else {
                        res.redirect("/allTablet");
                    }
                }).catch(function (err) {
                    _this40._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: err.toString() });
                });
            }];
        }
    }, {
        key: "allTablet",
        value: function allTablet() {
            var _this41 = this;

            return [function (req, res) {
                _this41._visitorService.allTablet().then(function (result) {
                    var row = result.rows;
                    res.render('all_tablet', { data: row });
                }).catch(function (err) {
                    _this41._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }, {
        key: "fetchDataForTablet",
        value: function fetchDataForTablet() {
            var _this42 = this;

            return [function (req, res) {
                _this42._visitorService.addTablet().then(function (result) {

                    var allOptions = '';
                    var allDept = '';
                    _lodash._.each(result.locations, function (value) {
                        allOptions += '<option value="' + value.location_id + '_' + value.location_name + '">' + value.location_name + '</option>';
                    });
                    _lodash._.each(result.departments, function (val) {
                        allDept += '<input type="checkbox" name="department" ' + 'id="' + val.department_id + '" value="' + val.department_id + '_' + val.department + '_' + val.id + '" >' + val.department + '<br>';
                    });
                    result.options = allOptions;
                    result.depts = allDept;
                    res.send({ message: "success", data: result });
                }).catch(function (err) {
                    _this42._logger.error(err);
                    res.send({ message: "Error", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "updateTablet",
        value: function updateTablet() {
            var _this43 = this;

            return [function (req, res) {
                _this43._visitorService.updateTablet(req.params.id, req.body).then(function (result) {
                    res.redirect("/allTablet");
                }).catch(function (err) {
                    _this43._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "deleteTabletDept",
        value: function deleteTabletDept() {
            var _this44 = this;

            return [function (req, res) {
                _this44._visitorService.deleteTabletDept(req.params.id).then(function (result) {
                    res.send({ success: 1, message: "completed", data: { result: result } });
                }).catch(function (err) {
                    _this44._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err) });
                });
            }];
        }
    }, {
        key: "getPrinters",
        value: function getPrinters() {
            return [function (req, res) {
                var printersArray = PrintManager.getPrinters();
                var finalArray = [];
                _lodash._.each(printersArray, function (value, key) {
                    console.log(value.name);
                    finalArray[key] = value.name;
                });
                res.send({ success: 1, message: "completed", data: { finalArray: finalArray } });
            }];
        }
    }, {
        key: "getAllPrinters",
        value: function getAllPrinters() {
            return new Promise(function (resolve, reject) {
                try {
                    var printersArray = PrintManager.getPrinters();
                    resolve({ printersArray: printersArray });
                } catch (e) {
                    reject(e);
                }
            });
        }
    }]);

    return Visitors;
}();