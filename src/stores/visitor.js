/**
 * customerRequest
 */

"use strict";

/* Third-party modules */
import {_} from "lodash";
var fs = require("fs");
var fileName = '../config.json';
var file = require(fileName);
var dateFormat = require('dateformat');
var base64 = require('node-base64-image');

export class VisitorStore {

    constructor(resource, logger, io) {
        this._resource = resource;
        this._logger = logger;
        this._io = io;
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

    saveCustomer(customer) {
        // if(customer.paramImagePath != ''){
        var unix = Math.round(+new Date()/1000);
        var imageName = customer.paramAccountName +'_'+ unix;
        var options = {filename: './public/images/' + imageName};
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

    allSignOut() {

        let time = this.getTime();
        let updateQuery = " UPDATE reception_handler.cromwell_recp SET signout= $1 WHERE signout IS NULL";
        let args = [
            time
        ];

        return this._resource.query(updateQuery, args)
            .then(response => {
                return response;
            });
    }

    allSignOutToday() {
        let time = this.getTime();
        let selectQuery = " SELECT * FROM  reception_handler.cromwell_recp  WHERE signout > $1 ORDER BY id DESC";
        let args = [
            time
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }

    getAllSignIns(){

        var data = new Date();
        var month = data.getMonth()+1;
        var myDate = [data.getDate() < 10 ? '0' + data.getDate() : data.getDate(), month <10 ? '0' + month : month ,data.getFullYear()].join('-');


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

                //file.terms.version = id;

                // fs.writeFile('./src/config.json', JSON.stringify(file, null, 2), function (err) {
                //     if (err) return console.log(err);
                //     console.log(JSON.stringify(file));
                //     console.log('writing to ' + fileName);
                // });

                return response;
            })
    }

    saveStatus(status) {
        let insertQuery = `
                    INSERT INTO
                    reception_handler.app_status (
                        location,
                        status
                    )
                    VALUES (
                        $1,
                        $2
                    )
                    RETURNING id
                `;

        let args = [
            'brc',
            status
        ];
        return this._resource.query(insertQuery, args)
            .then(response => {
                return response;
            })
    }

    cleanStatus(){

        let deleteQuery = 'DELETE from reception_handler.app_status where settime < now()::date';
        let args = [
        ];

        return this._resource.query(deleteQuery, args)
            .then(response => {
                return response;
            });
    }


    processGraphData() {
        let selectQuery = "SELECT EXTRACT(EPOCH FROM settime),status FROM reception_handler.app_status  where settime > now()::date ORDER BY id DESC ;";
        let args = [
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }

    currentStatus() {
        let selectQuery = 'SELECT EXTRACT(EPOCH FROM settime),status FROM reception_handler.app_status  where settime > now()::date ORDER BY id DESC;';
        let args = [
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }

    getTime(from="midnight"){
        var data = new Date();
        var month = data.getMonth()+1;
        var myDate = [data.getFullYear(), month <10 ? '0' + month : month ,data.getDate() < 10 ? '0' + data.getDate() : data.getDate()].join('-');
        var myTime = "";
        if(from == "midnight"){
            myTime = "00:00:00";
        }else{
            myTime = data.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        }

        var setTime = myDate + " " + myTime;
        return setTime;
    }

    getTimeforsettime(from="midnight"){
        var data = new Date();
        var month = data.getMonth()+1;
        var myDate = [data.getDate() < 10 ? '0' + data.getDate() : data.getDate(), month <10 ? '0' + month : month ,data.getFullYear()].join('-');
        var myTime = "";
        if(from == "midnight"){
            myTime = "00:00:00";
        }else{
            myTime = data.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        }

        var setTime = myDate + " " + myTime;
        return setTime;
    }

    timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var time = dateFormat(a, "yyyy-mm-dd HH:MM:ss");
        return time;
    }

    autoCompletePost(data) {

        let insertQuery = 'INSERT INTO reception_handler.autoComplete (location, type, suggestion) VALUES ( $1, $2, $3 ) RETURNING id';
        let args = [
            data.location,
            data.type,
            data.suggestion
        ];

        return this._resource.query(insertQuery, args)
            .then(response => {
                return response;
            })
    }

    autoCompleteId(id) {
        let selectQuery = 'SELECT * FROM reception_handler.autoComplete WHERE id = $1 ';
        let args = [
            id
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }
    autoComplete() {
        let selectQuery = 'SELECT * FROM reception_handler.autoComplete ORDER BY location DESC;';
        let args = [
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }

    updateAutoComplete(id, data) {
        let selectQuery = 'UPDATE reception_handler.autoComplete SET  type = $1, location= $2, suggestion = $3  WHERE id = $4 ';
        let args = [
            data.type,
            data.location,
            data.suggestion,
            id
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }

    deleteAutoComplete(id) {
        let selectQuery = 'DELETE from reception_handler.autoComplete WHERE id = $1 ';
        let args = [
            id
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }
    allStaff() {


        let selectQuery = `select * from reception_handler.buildings b
                           inner join reception_handler.building_departments bd using(building_id)
                           inner join human_resource.employees e on bd.department_id = e.department_id
                           where b.building_name = $1
                           and b.building_active is true
                           and bd.active is true`;

        let args = [
            'BRC'
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            })
            .then(result => {

                var result = result;
                let staffSelectQuery = `select EXTRACT(EPOCH FROM signin_time) as signin_time, EXTRACT(EPOCH FROM signout_time) as signout_time, staff_id, id 
                from reception_handler.building_signin 
                where id in
                        (
                            SELECT max(id)
                              FROM reception_handler.building_signin
                              where signin_time > now()::date OR 
                              signout_time > now()::date
                              group by
                              staff_id
                      )
                    `;
                let args = [

                ];

                return this._resource.query(staffSelectQuery, args)
                    .then(staffResponse => {
                        _.forEach(result.rows, (value, key) => {

                            result.rows[key]['signinTime'] = '';
                            result.rows[key]['signoutTime'] = '';
                            result.rows[key]['lastActivity'] = 'Never';
                            result.rows[key]['status'] = 'Outside of Building';
                            result.rows[key]['primaryId'] = 0;

                            _.forEach(staffResponse.rows, ( staffValue,staffKey ) => {
                                if(staffValue.staff_id == value.employee_number){

                                    console.log("ID matched" + staffValue.staff_id);

                                    if(staffValue.signin_time != null){
                                        result.rows[key]['status'] = 'Inside Building';
                                        result.rows[key]['lastActivity'] = 'Signed In';
                                        result.rows[key]['signinTime'] = this.timeConverter(staffValue.signin_time);
                                    }

                                    if(staffValue.signout_time != null){
                                        result.rows[key]['status'] = 'Outside of Building';
                                        result.rows[key]['lastActivity'] = 'Signed Out';
                                        result.rows[key]['signoutTime'] = this.timeConverter(staffValue.signout_time);
                                    }
                                    result.rows[key]['primaryId'] = staffValue.id;
                                }
                            })

                        });
                        return result;
                    })
            })
    }

    customizer(objValue, srcValue) {
            return objValue.concat(srcValue);
    }

    staffData(id) {
        let selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 and signin_time > now()::date ORDER BY signin_time DESC LIMIT 1';

        let args = [
            id
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }


    staffSignIn(id) {

        console.log("User ID going to sign in" + id);
        let selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 and signin_time > now()::date and signout_time IS NULL ORDER BY signin_time DESC LIMIT 1';

        let args = [
            id
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            })
            .then( result => {
                if(result.rowCount == 1){
                    let updateQuery = "UPDATE reception_handler.building_signin SET signout_time = $1 WHERE id = $2";

                    let args = [
                        this.getTime(""),
                        result.rows[0].id
                    ];

                    return this._resource.query(updateQuery, args)
                        .then(response => {
                            return response;
                        })
                        .then( updateResult => {
                            let insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, department_code) VALUES ( $1, $2 )';
                            let args = [
                                id,
                                'P103'
                            ];

                            return this._resource.query(insertQuery, args)
                                .then(response => {
                                    console.log("emitting new event");
                                   this._io.emit("forceLogin");
                                    return response;
                                });
                        })
                }else {
                    let insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, department_code) VALUES ( $1, $2 )';
                    let args = [
                        id,
                        'P103'
                    ];

                    return this._resource.query(insertQuery, args)
                        .then(response => {
                            return response;
                    });
                }
            })
    }


    addFiremarshall (data){

        let insertQuery = 'INSERT INTO reception_handler.fire_marshall (name, email_adds, location) VALUES ( $1, $2, $3 ) RETURNING id';
        let args = [
            data.marshall_name,
            data.marshall_email,
            data.location
        ];

        return this._resource.query(insertQuery, args)
            .then(response => {
                return response;
            });
    }

    updateFiremarshall (id, data){

        let insertQuery = 'UPDATE reception_handler.fire_marshall SET name = $1, email_adds = $2, location = $3 WHERE id= $4';
        let args = [
            data.name,
            data.email_adds,
            data.location,
            id
        ];

        return this._resource.query(insertQuery, args)
            .then(response => {
                return response;
            });
    }

    deleteFiremarshall (id){

        let insertQuery = 'DELETE FROM reception_handler.fire_marshall  WHERE id= $1';
        let args = [
            id
        ];

        return this._resource.query(insertQuery, args)
            .then(response => {
                return response;
            });
    }

    fireMarshallMail () {

        let selectQuery = `SELECT * FROM reception_handler.fire_marshall`;
        let args = [
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            })

    }

    staffSignOut(id) {
        let selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 and signin_time > now()::date  and signout_time IS NULL ORDER BY signin_time DESC LIMIT 1';

        let args = [
            id
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            })
            .then( result => {
                if(result.rowCount == 1){
                    let updateQuery = "UPDATE reception_handler.building_signin SET signout_time = $1 WHERE id = $2";

                    let args = [
                        this.getTime(""),
                        result.rows[0].id
                    ];

                    return this._resource.query(updateQuery, args)
                        .then(response => {
                            return response;
                        })
                }else{
                    let insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, signin_time, department_code, signout_time ) VALUES ( $1, $2 , $3, $4)';
                    let args = [
                        id,
                        null,
                        'P103',
                        this.getTime("")
                    ];

                    return this._resource.query(insertQuery, args)
                        .then(response => {
                            return response;
                        });
                }

                //throw new Error("Sorry! I am unable to find you was Signed In today, Can you please Sign In first");
            })

        }

    staffSignedIn(id) {

        let selectQuery = `SELECT  EXTRACT(EPOCH FROM a.signin_time) as signin_time , EXTRACT(EPOCH FROM a.signout_time) as signout_time, a.staff_id, b.employee_number, b.first_name, b.surname
                           FROM reception_handler.building_signin a
                           LEFT JOIN human_resource.employees b ON b.employee_number = a.staff_id::character varying
                           where signin_time > now()::date and signout_time IS NULL`;
        let args = [
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                _.each(response.rows , (val, key) => {
                    if(val.signin_time != null) {
                        response.rows[key]['signin_time'] = this.timeConverter(val.signin_time);
                    }
                    if(val.signout_time != null){
                        response.rows[key]['signout_time'] = this.timeConverter(val.signout_time);
                    }
                })
                return response;
            });
    }

    //All Staff Signed out
    staffSignedOut(id) {

        let selectQuery = `SELECT  EXTRACT(EPOCH FROM a.signin_time) as signin_time , EXTRACT(EPOCH FROM a.signout_time) as signout_time, a.staff_id, b.employee_number, b.first_name, b.surname
                           FROM reception_handler.building_signin a
                           LEFT JOIN human_resource.employees b ON b.employee_number = a.staff_id::character varying
                           where  signout_time > now()::date`;
        let args = [
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                _.each(response.rows , (val, key) => {
                    if(val.signin_time != null) {
                        response.rows[key]['signin_time'] = this.timeConverter(val.signin_time);
                    }
                    if(val.signout_time != null){
                        response.rows[key]['signout_time'] = this.timeConverter(val.signout_time);
                    }
                })
                return response;
            });
    }

    allPrintOut(){
        var data = new Date();
        var month = data.getMonth()+1;
        var myDate = [data.getDate() < 10 ? '0' + data.getDate() : data.getDate(), month <10 ? '0' + month : month ,data.getFullYear()].join('-');

        let selectQuery = `SELECT * FROM reception_handler.cromwell_recp WHERE   settime > $1 and signout IS NULL  and id >392 ORDER BY contactname asc`;
        let args = [
            myDate + ' 00:0:00'
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                //All visitors data
                return response;
            })
            .then( visitorResponse => {

                //Adding all staff data
                let selectQuery = `SELECT staff.*, u.employee_number,u.first_name,u.surname FROM reception_handler.building_signin staff
                                    LEFT JOIN human_resource.employees u ON staff.staff_id::character varying = u.employee_number
                                    WHERE   staff.signin_time > now()::date and signout_time IS NULL ORDER BY u.first_name asc`;
                let args = [
                ];

                return this._resource.query(selectQuery, args)
                    .then(staffResponse => {
                        staffResponse.visitors = visitorResponse.rows;
                        return staffResponse;
                    });
            })


    }

    allFiremarshall() {
        let selectQuery = 'SELECT * from reception_handler.fire_marshall ORDER BY id DESC';

        let args = [
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }



    //search queries

    searchAllSignIns(id){

        let selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE   id = $1 ";
        let args = [
            id
        ];

        return this._resource.query(selectQuery, args)
            .then(response => {
                return response;
            });
    }

    nfcActivity (id){

        console.log("User ID going to sign in" + id);
        let selectQuery = 'SELECT * from reception_handler.building_signin WHERE staff_id=$1 and signin_time > now()::date and signout_time IS NULL ORDER BY signin_time DESC LIMIT 1';

        let args = [
            id
        ];

        return this._resource.query(selectQuery, args)
        .then(response => {
            return response;
        })
        .then( result => {

            if(result.rowCount == 1){
                let updateQuery = "UPDATE reception_handler.building_signin SET signout_time = $1 WHERE id = $2 RETURNING id";

                let args = [
                    this.getTime(""),
                    result.rows[0].id
                ];

                return this._resource.query(updateQuery, args)
                .then(response => {
                    return response;
                })

            }else {
                let insertQuery = 'INSERT INTO reception_handler.building_signin (staff_id, department_code) VALUES ( $1, $2 ) RETURNING id';
                let args = [
                    id,
                    'P103'
                ];

                return this._resource.query(insertQuery, args)
                .then(response => {
                    return response;
                });
            }
        })
        .then(result => {
            var activity = result.command;
            let selectQuery = 'SELECT * from human_resource.employees where employee_number = $1';

            let args = [
                id
            ];

            return this._resource.query(selectQuery, args)
                .then(response => {
                   // console.log("NFC activity result" + JSON.stringify(response));
                    response.activity = activity;
                    return response;
                })
        })

    }
}
