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

var base64 = require('node-base64-image');

var VisitorStore = exports.VisitorStore = function () {
    function VisitorStore(resource, logger) {
        _classCallCheck(this, VisitorStore);

        this._resource = resource;
        this._logger = logger;
    }

    _createClass(VisitorStore, [{
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
        key: "getCustomer",
        value: function getCustomer(id) {

            var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE id = $1 LIMIT 1";
            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
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
        key: "autoCompletePost",
        value: function autoCompletePost(data) {

            console.log(data);
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
            /*let selectQuery = `SELECT a.id, a.staff_id, a.firstname, a.surname,  a.email, a.job_title_code, b.department_code, b.department_name, c.post_title
                               FROM active_directory.users a
                               INNER JOIN active_directory.departments b ON b.department_code::text = 'P103'
                               LEFT JOIN active_directory.job_posts c ON a.job_title_code::text = c.post_no::text  LIMIT 3;`; */

            var selectQuery = "select * from active_directory.users u\n                            INNER JOIN active_directory.departments d ON d.department_code::text = replace(split_part(u.job_title_code::text, '-'::text, 1), 'H'::text, 'P'::text) \n                            LEFT JOIN active_directory.job_posts jp ON u.job_title_code::text = jp.post_no::text\n                            WHERE d.department_code IN (select department_code from reception_handler.building_users where building_name = $1)\n                            and date_left is null";
            var args = ['BRC'];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "staffSignIn",
        value: function staffSignIn(id) {
            var insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, department_code) VALUES ( $1, $2 )';
            var args = [id, 'P103'];

            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "staffSignOut",
        value: function staffSignOut(id) {
            var _this2 = this;

            var selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 ORDER BY signin_time DESC LIMIT 1';

            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            }).then(function (result) {
                var updateQuery = "UPDATE reception_handler.building_signin SET signout_time = $1 WHERE id = $2";

                var args = [_this2.getTime(""), result.rows[0].id];

                return _this2._resource.query(updateQuery, args).then(function (response) {
                    return response;
                });
            });
        }
    }, {
        key: "staffSignedIn",
        value: function staffSignedIn(id) {

            var selectQuery = "SELECT a.signin_time, a.signout_time, b.id, b.staff_id, b.firstname, b.surname,  b.email, b.job_title_code\n                           FROM reception_handler.building_signin a\n                           LEFT JOIN active_directory.users b ON b.staff_id = a.staff_id";
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
    }]);

    return VisitorStore;
}();