/**
 * customerRequest
 */

"use strict";

/* Third-party modules */
import {_} from "lodash";
var fs = require("fs");
var fileName = '../config.json';
var file = require(fileName);

var base64 = require('node-base64-image');

export class VisitorStore {

    constructor(resource, logger) {
        this._resource = resource;
        this._logger = logger;
    }

    saveCustomer(customer) {
       // if(customer.paramImagePath != ''){
            var unix = Math.round(+new Date()/1000);
            var imageName = customer.paramAccountName +'_'+ unix;
            var options = {filename: './images/' + imageName};
            //var options = {filename: './src/reception_handler/images/' + imageName};
            var imageData = new Buffer(customer.paramImagePath, 'base64');

            base64.base64decoder(imageData, options, function (err, saved) {
                if (err) { console.log(err); }
                console.log(saved);
            });
        //}

        let insertQuery = `
                    INSERT INTO
                    reception_handler.cromwell_recp (
                        type,
                        accountid,
                        accountname,
                        contactid,
                        contactname,
                        employeeid,
                        employeename,
                        vehiclereg,
                        settime,
                        reclogid,
                        logid,
                        pendingid,
                        imagepath
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11,
                        $12,
                        $13
                    )
                    RETURNING id
                `;

        let args = [
            customer.paramType,
            customer.paramAccountId,
            customer.paramAccountName,
            customer.paramContactId,
            customer.paramContactName,
            customer.paramEmployeeId,
            customer.paramEmployeeName,
            customer.paramvehicleReg,
            customer.paramTime,
            customer.paramRecLogId,
            customer.paramLogId,
            customer.paramPendingId,
            imageName +'.jpg'
        ];
        return this._resource.query(insertQuery, args)
            .then(response => {
                return response;
            })
            .then(res => {

                let selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE id = $1 LIMIT 1";
                let args = [
                    res.rows[0]["id"]
                ];

                return this._resource.query(selectQuery, args)
                    .then(data => {
                        return data.rows[0];
                    })
            });
    }

    getCustomer(id) {

        let selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE id = $1 LIMIT 1";
        let args = [
            id
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
               return response;
            });
    }

    updateCustomer(id, customer) {

        console.log(id);
        console.log(customer.signout);


        let updateQuery = `
                    UPDATE
                    reception_handler.cromwell_recp SET 
                        signout = $1
                       WHERE logid = $2 
                `;

        let args = [
            customer.signout,
            id
        ];
        return this._resource.query(updateQuery, args)
            .then(response => {
                return response;
            });
    }

    checkIfUpdateRequired(merlinCustomerData, customerData, fieldsToCheck) {

        let updateRequired = false;
        _.forEach(fieldsToCheck, (value, key) => {

            if (!customerData[key]) {
                customerData[key] = "";
            }

            if (customerData[key] !== merlinCustomerData[value]) {
                updateRequired = true;
            }

        });

        return updateRequired;
    }

    allSignOut() {
        var chk = new Date();
        var month = chk.getMonth()+1;
        var myDate = [chk.getFullYear(), month <10 ? '0' + month : month , chk.getDate()].join('-');
        var myTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

        let updateQuery = " UPDATE reception_handler.cromwell_recp SET signout= $1 WHERE signout IS NULL";
        let args = [
            myDate + ' ' + myTime
        ];

        return this._resource.query(updateQuery, args)
            .then(response => {
                return response;
            });
    }

    allSignOutToday() {

        var chk = new Date();
        var month = chk.getMonth()+1;
        var myDate = [chk.getFullYear(), month <10 ? '0' + month : month , chk.getDate() ].join('-');
        //var myTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

        let selectQuery = " SELECT * FROM  reception_handler.cromwell_recp  WHERE signout > $1 ORDER BY id DESC";
        let args = [
            myDate + ' 00:00:00'
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                    return response;
            });
    }

    getAllSignIns(){
        var chk = new Date();
        var month = chk.getMonth()+1;

        var myDate = [chk.getDate(), month <10 ? '0' + month : month , chk.getFullYear()].join('-');
        //var myTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");


        let selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE   settime > $1 and signout IS NULL ";
        let args = [
            myDate + " 00:00:00"
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }

    getTermsRequest(id) {
        var selectQuery ="";
        var args = "";

        if(id != null){
             selectQuery = "SELECT * FROM reception_handler.terms WHERE status = $1 and id = $2";
             args = [
                1,
                id
            ];
        }else{
             selectQuery = "SELECT * FROM reception_handler.terms WHERE status = $1";
             args = [
                1
            ];
        }



        return this._resource.query(selectQuery, args)
            .then(response => {

                //console.log(response);
                //process.exit();
                return response;
            });
    }

    postTermsRequest(data) {

        let insertQuery = 'INSERT INTO reception_handler.terms (terms_file) VALUES ( $1 ) RETURNING id';
        let args = [
            data.terms_data
        ];

        return this._resource.query(insertQuery, args)
            .then(response => {
                return response;
            });
    }

    allTermsRequest() {
        let selectQuery = 'SELECT * FROM reception_handler.terms';
        let args = [
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }

    updateTermsRequest(id) {

        let updateQuery = 'UPDATE reception_handler.terms SET status = CASE WHEN (id = $1) THEN $2 ELSE $3 END';

        let args = [
            id,
            1,
            0
        ];

        return this._resource.query(updateQuery, args)
            .then(response => {

                file.terms.version = id;

                fs.writeFile('./src/config.json', JSON.stringify(file, null, 2), function (err) {
                    if (err) return console.log(err);
                    console.log(JSON.stringify(file));
                    console.log('writing to ' + fileName);
                });

                return response;
            })
    }

    saveStatus(data) {

        var chk = new Date();
        var month = chk.getMonth()+1;
        var myDate = [chk.getDate(), month <10 ? '0' + month : month , chk.getFullYear()].join('-');
        var myTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

        let insertQuery = `
                    INSERT INTO
                    reception_handler.app_status (
                        status,
                        settime
                    )
                    VALUES (
                        $1,
                        $2
                    )
                    RETURNING id
                `;

        let args = [
            data.appStatus,
            myDate + ' ' + myTime
        ];
        return this._resource.query(insertQuery, args)
            .then(response => {
                return response;
            })
    }
}
