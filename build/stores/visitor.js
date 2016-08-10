/**
 * customerRequest
 */

"use strict";

/* Third-party modules */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VisitorStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");
var fileName = '../config.json';
var file = require(fileName);
var dateFormat = require('dateformat');
var base64 = require('node-base64-image');

var VisitorStore = exports.VisitorStore = function () {
    function VisitorStore(resource, logger, io) {
        _classCallCheck(this, VisitorStore);

        this._resource = resource;
        this._logger = logger;
        this._io = io;
    }

    _createClass(VisitorStore, [{
        key: "getCustomer",
        value: function getCustomer(id) {

            var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE id = $1 LIMIT 1";
            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "saveCustomer",
        value: function saveCustomer(customer) {
            var _this = this;

            // if(customer.paramImagePath != ''){
            var unix = Math.round(+new Date() / 1000);
            var imageName = customer.paramAccountName + '_' + unix;
            var options = { filename: './public/images/' + imageName };
            //var options = {filename: './src/reception_handler/images/' + imageName};
            var imageData = new Buffer(customer.paramImagePath, 'base64');

            base64.base64decoder(imageData, options, function (err, saved) {
                if (err) {
                    console.log(err);
                }
                console.log(saved);
            });
            //}

            var insertQuery = "\n                    INSERT INTO\n                    reception_handler.cromwell_recp (\n                        type,\n                        accountid,\n                        accountname,\n                        contactid,\n                        contactname,\n                        employeeid,\n                        employeename,\n                        vehiclereg,\n                        settime,\n                        reclogid,\n                        logid,\n                        pendingid,\n                        imagepath\n                    )\n                    VALUES (\n                        $1,\n                        $2,\n                        $3,\n                        $4,\n                        $5,\n                        $6,\n                        $7,\n                        $8,\n                        $9,\n                        $10,\n                        $11,\n                        $12,\n                        $13\n                    )\n                    RETURNING id\n                ";

            var args = [customer.paramType, customer.paramAccountId, customer.paramAccountName, customer.paramContactId, customer.paramContactName, customer.paramEmployeeId, customer.paramEmployeeName, customer.paramvehicleReg, customer.paramTime, customer.paramRecLogId, customer.paramLogId, customer.paramPendingId, imageName + '.jpg'];
            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            }).then(function (res) {

                var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE id = $1 LIMIT 1";
                var args = [res.rows[0]["id"]];

                return _this._resource.query(selectQuery, args).then(function (data) {
                    return data.rows[0];
                });
            });
        }
    }, {
        key: "updateCustomer",
        value: function updateCustomer(id, customer) {

            console.log(id);
            console.log(customer.signout);

            var updateQuery = "\n                    UPDATE\n                    reception_handler.cromwell_recp SET \n                        signout = $1\n                       WHERE logid = $2 \n                ";

            var args = [customer.signout, id];
            return this._resource.query(updateQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "allSignOut",
        value: function allSignOut() {

            var time = this.getTime();
            var updateQuery = " UPDATE reception_handler.cromwell_recp SET signout= $1 WHERE signout IS NULL";
            var args = [time];

            return this._resource.query(updateQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "allSignOutToday",
        value: function allSignOutToday() {
            var time = this.getTime();
            var selectQuery = " SELECT * FROM  reception_handler.cromwell_recp  WHERE signout > $1 ORDER BY id DESC";
            var args = [time];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "getAllSignIns",
        value: function getAllSignIns() {

            var data = new Date();
            var month = data.getMonth() + 1;
            var myDate = [data.getDate() < 10 ? '0' + data.getDate() : data.getDate(), month < 10 ? '0' + month : month, data.getFullYear()].join('-');

            var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE   settime > $1 and signout IS NULL ";
            var args = [myDate + " 00:00:00"];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "getTermsRequest",
        value: function getTermsRequest(id) {
            var selectQuery = "";
            var args = "";

            if (id != null) {
                selectQuery = "SELECT * FROM reception_handler.terms WHERE status = $1 and id = $2";
                args = [1, id];
            } else {
                selectQuery = "SELECT * FROM reception_handler.terms WHERE status = $1";
                args = [1];
            }

            return this._resource.query(selectQuery, args).then(function (response) {

                //console.log(response);
                //process.exit();
                return response;
            });
        }
    }, {
        key: "postTermsRequest",
        value: function postTermsRequest(data) {

            var insertQuery = 'INSERT INTO reception_handler.terms (terms_file) VALUES ( $1 ) RETURNING id';
            var args = [data.terms_data];

            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "allTermsRequest",
        value: function allTermsRequest() {
            var selectQuery = 'SELECT * FROM reception_handler.terms';
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "updateTermsRequest",
        value: function updateTermsRequest(id) {

            var updateQuery = 'UPDATE reception_handler.terms SET status = CASE WHEN (id = $1) THEN $2 ELSE $3 END';

            var args = [id, 1, 0];

            return this._resource.query(updateQuery, args).then(function (response) {

                //file.terms.version = id;

                // fs.writeFile('./src/config.json', JSON.stringify(file, null, 2), function (err) {
                //     if (err) return console.log(err);
                //     console.log(JSON.stringify(file));
                //     console.log('writing to ' + fileName);
                // });

                return response;
            });
        }
    }, {
        key: "saveStatus",
        value: function saveStatus(status) {
            var insertQuery = "\n                    INSERT INTO\n                    reception_handler.app_status (\n                        location,\n                        status\n                    )\n                    VALUES (\n                        $1,\n                        $2\n                    )\n                    RETURNING id\n                ";

            var args = ['brc', status];
            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "cleanStatus",
        value: function cleanStatus() {

            var deleteQuery = 'DELETE from reception_handler.app_status where settime < now()::date';
            var args = [];

            return this._resource.query(deleteQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "processGraphData",
        value: function processGraphData() {
            var selectQuery = "SELECT EXTRACT(EPOCH FROM settime),status FROM reception_handler.app_status  where settime > now()::date ORDER BY id DESC ;";
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "currentStatus",
        value: function currentStatus() {
            var selectQuery = 'SELECT EXTRACT(EPOCH FROM settime),status FROM reception_handler.app_status  where settime > now()::date ORDER BY id DESC;';
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "getTime",
        value: function getTime() {
            var from = arguments.length <= 0 || arguments[0] === undefined ? "midnight" : arguments[0];

            var data = new Date();
            var month = data.getMonth() + 1;
            var myDate = [data.getFullYear(), month < 10 ? '0' + month : month, data.getDate() < 10 ? '0' + data.getDate() : data.getDate()].join('-');
            var myTime = "";
            if (from == "midnight") {
                myTime = "00:00:00";
            } else {
                myTime = data.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
            }

            var setTime = myDate + " " + myTime;
            return setTime;
        }
    }, {
        key: "getTimeforsettime",
        value: function getTimeforsettime() {
            var from = arguments.length <= 0 || arguments[0] === undefined ? "midnight" : arguments[0];

            var data = new Date();
            var month = data.getMonth() + 1;
            var myDate = [data.getDate() < 10 ? '0' + data.getDate() : data.getDate(), month < 10 ? '0' + month : month, data.getFullYear()].join('-');
            var myTime = "";
            if (from == "midnight") {
                myTime = "00:00:00";
            } else {
                myTime = data.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
            }

            var setTime = myDate + " " + myTime;
            return setTime;
        }
    }, {
        key: "timeConverter",
        value: function timeConverter(UNIX_timestamp) {
            var a = new Date(UNIX_timestamp * 1000);
            var time = dateFormat(a, "yyyy-mm-dd HH:MM:ss");
            return time;
        }
    }, {
        key: "autoCompletePost",
        value: function autoCompletePost(data) {

            var insertQuery = 'INSERT INTO reception_handler.autoComplete (location, type, suggestion) VALUES ( $1, $2, $3 ) RETURNING id';
            var args = [data.location, data.type, data.suggestion];

            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "autoCompleteId",
        value: function autoCompleteId(id) {
            var selectQuery = 'SELECT * FROM reception_handler.autoComplete WHERE id = $1 ';
            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "autoComplete",
        value: function autoComplete() {
            var selectQuery = 'SELECT * FROM reception_handler.autoComplete ORDER BY location DESC;';
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "updateAutoComplete",
        value: function updateAutoComplete(id, data) {
            var selectQuery = 'UPDATE reception_handler.autoComplete SET  type = $1, location= $2, suggestion = $3  WHERE id = $4 ';
            var args = [data.type, data.location, data.suggestion, id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "deleteAutoComplete",
        value: function deleteAutoComplete(id) {
            var selectQuery = 'DELETE from reception_handler.autoComplete WHERE id = $1 ';
            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "allStaff",
        value: function allStaff() {
            var _this2 = this;

            var selectQuery = "select * from reception_handler.buildings b\n                           inner join reception_handler.building_departments bd using(building_id)\n                           inner join human_resource.employees e on bd.department_id = e.department_id\n                           where b.building_name = $1\n                           and b.building_active is true\n                           and bd.active is true";

            var args = ['BRC'];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            }).then(function (result) {

                var result = result;
                var staffSelectQuery = "select EXTRACT(EPOCH FROM signin_time) as signin_time, EXTRACT(EPOCH FROM signout_time) as signout_time, staff_id, id \n                from reception_handler.building_signin \n                where id in\n                        (\n                            SELECT max(id)\n                              FROM reception_handler.building_signin\n                              where signin_time > now()::date OR \n                              signout_time > now()::date\n                              group by\n                              staff_id\n                      )\n                    ";
                var args = [];

                return _this2._resource.query(staffSelectQuery, args).then(function (staffResponse) {
                    _lodash._.forEach(result.rows, function (value, key) {

                        result.rows[key]['signinTime'] = '';
                        result.rows[key]['signoutTime'] = '';
                        result.rows[key]['lastActivity'] = 'No Activity Today';
                        result.rows[key]['status'] = 'Outside of Building';
                        result.rows[key]['primaryId'] = 0;

                        _lodash._.forEach(staffResponse.rows, function (staffValue, staffKey) {
                            if (staffValue.staff_id == value.employee_number) {

                                console.log("ID matched" + staffValue.staff_id);

                                if (staffValue.signin_time != null) {
                                    result.rows[key]['status'] = 'Inside Building';
                                    result.rows[key]['lastActivity'] = 'Signed In';
                                    result.rows[key]['signinTime'] = _this2.timeConverter(staffValue.signin_time);
                                }

                                if (staffValue.signout_time != null) {
                                    result.rows[key]['status'] = 'Outside of Building';
                                    result.rows[key]['lastActivity'] = 'Signed Out';
                                    result.rows[key]['signoutTime'] = _this2.timeConverter(staffValue.signout_time);
                                }
                                result.rows[key]['primaryId'] = staffValue.id;
                            }
                        });
                    });
                    return result;
                });
            });
        }
    }, {
        key: "customizer",
        value: function customizer(objValue, srcValue) {
            return objValue.concat(srcValue);
        }
    }, {
        key: "staffData",
        value: function staffData(id) {
            var selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 and signin_time > now()::date ORDER BY signin_time DESC LIMIT 1';

            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "staffSignIn",
        value: function staffSignIn(id) {
            var _this3 = this;

            console.log("User ID going to sign in" + id);
            var selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 and signin_time > now()::date and signout_time IS NULL ORDER BY signin_time DESC LIMIT 1';

            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            }).then(function (result) {
                if (result.rowCount == 1) {
                    var updateQuery = "UPDATE reception_handler.building_signin SET signout_time = $1 WHERE id = $2";

                    var _args = [_this3.getTime(""), result.rows[0].id];

                    return _this3._resource.query(updateQuery, _args).then(function (response) {
                        return response;
                    }).then(function (updateResult) {
                        var insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, department_code) VALUES ( $1, $2 )';
                        var args = [id, 'P103'];

                        return _this3._resource.query(insertQuery, args).then(function (response) {
                            console.log("emitting new event");
                            _this3._io.emit("forceLogin");
                            return response;
                        });
                    });
                } else {
                    var insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, department_code) VALUES ( $1, $2 )';
                    var _args2 = [id, 'P103'];

                    return _this3._resource.query(insertQuery, _args2).then(function (response) {
                        return response;
                    });
                }
            });
        }
    }, {
        key: "addFiremarshall",
        value: function addFiremarshall(data) {

            var insertQuery = 'INSERT INTO reception_handler.fire_marshall (name, email_adds, location) VALUES ( $1, $2, $3 ) RETURNING id';
            var args = [data.marshall_name, data.marshall_email, data.location];

            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "updateFiremarshall",
        value: function updateFiremarshall(id, data) {

            var insertQuery = 'UPDATE reception_handler.fire_marshall SET name = $1, email_adds = $2, location = $3 WHERE id= $4';
            var args = [data.name, data.email_adds, data.location, id];

            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "deleteFiremarshall",
        value: function deleteFiremarshall(id) {

            var insertQuery = 'DELETE FROM reception_handler.fire_marshall  WHERE id= $1';
            var args = [id];

            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "fireMarshallMail",
        value: function fireMarshallMail() {

            var selectQuery = "SELECT * FROM reception_handler.fire_marshall";
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "staffSignOut",
        value: function staffSignOut(id) {
            var _this4 = this;

            var selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 and signin_time > now()::date  and signout_time IS NULL ORDER BY signin_time DESC LIMIT 1';

            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            }).then(function (result) {
                if (result.rowCount == 1) {
                    var updateQuery = "UPDATE reception_handler.building_signin SET signout_time = $1 WHERE id = $2";

                    var _args3 = [_this4.getTime(""), result.rows[0].id];

                    return _this4._resource.query(updateQuery, _args3).then(function (response) {
                        return response;
                    });
                } else {
                    var insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, signin_time, department_code, signout_time ) VALUES ( $1, $2 , $3, $4)';
                    var _args4 = [id, null, 'P103', _this4.getTime("")];

                    return _this4._resource.query(insertQuery, _args4).then(function (response) {
                        return response;
                    });
                }

                //throw new Error("Sorry! I am unable to find you was Signed In today, Can you please Sign In first");
            });
        }
    }, {
        key: "staffSignedIn",
        value: function staffSignedIn(id) {
            var _this5 = this;

            var selectQuery = "SELECT  EXTRACT(EPOCH FROM a.signin_time) as signin_time , EXTRACT(EPOCH FROM a.signout_time) as signout_time, a.staff_id, b.employee_number, b.first_name, b.surname\n                           FROM reception_handler.building_signin a\n                           LEFT JOIN human_resource.employees b ON b.employee_number = a.staff_id::character varying\n                           where signin_time > now()::date and signout_time IS NULL";
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                _lodash._.each(response.rows, function (val, key) {
                    if (val.signin_time != null) {
                        response.rows[key]['signin_time'] = _this5.timeConverter(val.signin_time);
                    }
                    if (val.signout_time != null) {
                        response.rows[key]['signout_time'] = _this5.timeConverter(val.signout_time);
                    }
                });
                return response;
            });
        }

        //All Staff Signed out

    }, {
        key: "staffSignedOut",
        value: function staffSignedOut(id) {
            var _this6 = this;

            var selectQuery = "SELECT  EXTRACT(EPOCH FROM a.signin_time) as signin_time , EXTRACT(EPOCH FROM a.signout_time) as signout_time, a.staff_id, b.employee_number, b.first_name, b.surname\n                           FROM reception_handler.building_signin a\n                           LEFT JOIN human_resource.employees b ON b.employee_number = a.staff_id::character varying\n                           where  signout_time > now()::date";
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                _lodash._.each(response.rows, function (val, key) {
                    if (val.signin_time != null) {
                        response.rows[key]['signin_time'] = _this6.timeConverter(val.signin_time);
                    }
                    if (val.signout_time != null) {
                        response.rows[key]['signout_time'] = _this6.timeConverter(val.signout_time);
                    }
                });
                return response;
            });
        }
    }, {
        key: "allPrintOut",
        value: function allPrintOut() {
            var _this7 = this;

            var data = new Date();
            var month = data.getMonth() + 1;
            var myDate = [data.getDate() < 10 ? '0' + data.getDate() : data.getDate(), month < 10 ? '0' + month : month, data.getFullYear()].join('-');

            var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE   settime > $1 and signout IS NULL  and id >392 ORDER BY contactname asc";
            var args = [myDate + ' 00:0:00'];

            return this._resource.query(selectQuery, args).then(function (response) {
                //All visitors data
                return response;
            }).then(function (visitorResponse) {

                //Adding all staff data
                var selectQuery = "SELECT staff.*, u.employee_number,u.first_name,u.surname FROM reception_handler.building_signin staff\n                                    LEFT JOIN human_resource.employees u ON staff.staff_id::character varying = u.employee_number\n                                    WHERE   staff.signin_time > now()::date and signout_time IS NULL ORDER BY u.first_name asc";
                var args = [];

                return _this7._resource.query(selectQuery, args).then(function (staffResponse) {
                    staffResponse.visitors = visitorResponse.rows;
                    return staffResponse;
                });
            });
        }
    }, {
        key: "allFiremarshall",
        value: function allFiremarshall() {
            var selectQuery = 'SELECT * from reception_handler.fire_marshall ORDER BY id DESC';

            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }

        //search queries

    }, {
        key: "searchAllSignIns",
        value: function searchAllSignIns(id) {

            var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE   id = $1 ";
            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "nfcActivity",
        value: function nfcActivity(id) {
            var _this8 = this;

            console.log("User ID going to sign in" + id);
            var selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 and signin_time > now()::date and signout_time IS NULL ORDER BY signin_time DESC LIMIT 1';

            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            }).then(function (result) {

                if (result.rowCount == 1) {
                    var updateQuery = "UPDATE reception_handler.building_signin SET signout_time = $1 WHERE id = $2 RETURNING id";

                    var _args5 = [_this8.getTime(""), result.rows[0].id];

                    return _this8._resource.query(updateQuery, _args5).then(function (response) {
                        return response;
                    });
                } else {
                    var insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, department_code) VALUES ( $1, $2 ) RETURNING id';
                    var _args6 = [id, 'P103'];

                    return _this8._resource.query(insertQuery, _args6).then(function (response) {
                        return response;
                    });
                }
            }).then(function (result) {
                var activity = result.command;
                var selectQuery = 'SELECT * from human_resource.employees where employee_number = $1';

                var args = [id];

                return _this8._resource.query(selectQuery, args).then(function (response) {
                    // console.log("NFC activity result" + JSON.stringify(response));
                    response.activity = activity;
                    return response;
                });
            });
        }
    }]);

    return VisitorStore;
}();