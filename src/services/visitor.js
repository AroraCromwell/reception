
"use strict";
var fs = require("fs");
var pdf = require("html-pdf");
var exec = require('child_process').exec;
import config from "../config.json";
import {_} from "lodash";
var dateFormat = require('dateformat');

export class VisitorService {

    constructor (visitorStore, templateManager, dataCleaner, logger) {
        this._visitorStore = visitorStore;
       // this._emitter = emitter;
        this._templateManager  = templateManager;
        this._dataCleaner = dataCleaner;
        this._logger = logger;
    }

    processRequest (data) {

        this._logger.info("New Customer!");
        this._logger.info(JSON.stringify(data));
        this._logger.info("Saving Data");

                return this._visitorStore.saveCustomer(data)
                    .then((res) => {
                        return res;
                    })
                    .then(result => {
                        //render the template
                        let visitorId = result.id;
                        var html = this._templateManager.render('crom_visitor', result);

                        var options = { format: 'A5', orientation: 'landscape'};

                        pdf.create(html, options).toFile('./pdf/' + visitorId + '.pdf', function(err, pdfRes) {
                            if (err) return console.log(err);

                            //var cmd ="lp -o landscape -o scaling=97  -d" + config.printer.set + " "+ pdfRes.filename;

                            var cmd = '"C:\\Program Files (x86)\\Foxit Software\\Foxit Reader\\FoxitReader.exe" /t "C:\\reception-handler\\build\\pdf\\'+ visitorId +'.pdf" "BrotherHL-3150CDWseries" “IP_10.100.16.193"';

                            exec(cmd, function(error, stdout, stderr) {
                                // command output is in stdout
                                console.log(stdout);

                                if (error !== null) {
                                    console.log('exec error: ' + error);
                                }
                                //process.exit();
                            });
                        })

                        return visitorId;
                    })
                    .catch(err => {
                        this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                        throw new Error(err);
                    });
    }

    processGetRequest (id) {

        this._logger.info("Existing Customer!");
        this._logger.info("Getting Data");

        return this._visitorStore.getCustomer(id)
            .then((data) => {
                return data;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    allSignIns () {

        this._logger.info("Getting All Visitors!");
        this._logger.info("Getting Data");
        return this._visitorStore.getAllSignIns()
            .then((data) => {
                return data;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    processPutRequest (id, data) {

        this._logger.info("Existing Customer!");
        this._logger.info("Signing out");

        return this._visitorStore.updateCustomer(id, data)
            .then((data) => {
                return data;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    allSignOut(){

        this._logger.info("Signing Out All Visitors!");

        return this._visitorStore.allSignOut()
            .then(() => {
                return true;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    allSignOutToday(){

        this._logger.info("All Signed Out Today!");

        return this._visitorStore.allSignOutToday()
            .then((result) => {

                _.each(result.rows , function (value, key) {
                     value.signout = dateFormat(value.signout, "dd-mm-yyyy HH:MM:ss");
                });

                return result;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    getTermsRequest(id) {
        return this._visitorStore.getTermsRequest(id)
            .then((result) => {
                let row = result.rows;

                if(row[0].id != config.terms.version) {
                    fs = require('fs');
                    fs.writeFile('./src/templates/terms_' + row[0].id + '.hbs', row[0].terms_file, function (err) {
                        if (err)
                            return console.log(err);
                        console.log('Terms file created');
                    });
                }

                return 'terms_' + row[0].id ;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }


    postTermsRequest(data) {
        return this._visitorStore.postTermsRequest(data)
            .then((result) => {
                let row = result.rows;
                if(row[0].id != config.terms.version) {
                    fs = require('fs');
                    fs.writeFile('./src/templates/terms_' + row[0].id + '.hbs', row[0].terms_file, function (err) {
                        if (err)
                            return console.log(err);
                        console.log('Terms file created');
                    });
                }

                return 'terms_' + row[0].id ;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    allTermsRequest(){
        this._logger.info(" Getting All Terms!");

        return this._visitorStore.allTermsRequest()
            .then((result) => {
                return result;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    updateTermsRequest(id){
        this._logger.info(" Updating Term!");

        return this._visitorStore.updateTermsRequest(id)
            .then((result) => {
                return result;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    processStatus (data) {
        //this._logger.info(JSON.stringify(data));
        return this._visitorStore.saveStatus(data)
            .then((res) => {
                return res;
            })
            .catch(err => {
                this._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    cleanStatus () {
        //this._logger.info(JSON.stringify(data));
        return this._visitorStore.cleanStatus()
            .then((res) => {
                return res;
            })
            .catch(err => {
                this._logger.error("Problem while cleaning status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    processGraphData() {

        this._logger.info("getting graph data!");

        return this._visitorStore.processGraphData()
            .then((result) => {

                var setData = [];

                _.forEach(result.rows, (value, key) => {
                    let setkey = this.timeConverter(value.date_part);
                    let setVal = value.status;
                    setData.push(JSON.stringify({setkey, setVal}));
                });

                return setData;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    currentStatus() {
        this._logger.info("Current Device Status!");

        return this._visitorStore.currentStatus()
            .then((data) => {

                var setData = [];
                _.forEach(data.rows, (value, key) => {

                    let setkey = this.timeConverter(value.date_part);
                    let setVal = value.status;
                    setData.push(JSON.stringify({setkey, setVal}));
                });
                return setData;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }


    timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var time = dateFormat(a, "yyyy-mm-dd HH:MM:ss");
        return time;
    }

    // Auto Complete functionality

    autoComplete() {
        return this._visitorStore.autoComplete()
            .then((res) => {
                _.forEach(res.rows, (value, key) => {
                    if(value.type == 'visitor_name'){
                        value.type = "Visitor Name";
                    }
                });
                return res;
            })
            .catch(err => {
                this._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    autoCompletePost(data) {
        //this._logger.info(JSON.stringify(data));
        return this._visitorStore.autoCompletePost(data)
            .then((res) => {
                return res;
            })
            .then((result) => {
                return this._visitorStore.autoCompleteId(result.rows[0].id);
            })
            .catch(err => {
                this._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    updateAutoComplete(id, data){
        return this._visitorStore.updateAutoComplete(id, data)
            .then((res) => {
                return res;
            })
            .then((result) => {
                return this._visitorStore.autoCompleteId(id);
            })
            .catch(err => {
                this._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    deleteAutoComplete(id){
        return this._visitorStore.deleteAutoComplete(id)
            .then((res) => {
                return res;
            })
            .catch(err => {
                this._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }


    //Staff information

    allStaff(){
        return this._visitorStore.allStaff()
            .then((res) => {
                return res;
            })
            .catch(err => {
                this._logger.error("Problem while inserting status: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    staffData(id){
        return this._visitorStore.staffData(id)
            .then((res) => {
                return res;
            })
    }

    staffSignIn(id){
        return this._visitorStore.staffSignIn(id)
            .then((res) => {
                return res;
            })
            .catch(err => {
                this._logger.error("Problem while Staff Sign In: -> " + JSON.stringify(err));
                throw new Error(err);
        });
    }

    staffSignOut(id){
        return this._visitorStore.staffSignOut(id)
            .then((res) => {
                return res;
            })
    }

    // All staff signed In
    staffSignedIn(id){
        return this._visitorStore.staffSignedIn(id)
            .then((res) => {
                return res;
            })
            .catch(err => {
                this._logger.error("Problem while Staff Sign In: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    // All Visitors print out
    allVisitorsPrintOut(id){
        return this._visitorStore.allVisitorsPrintOut()
            .then((res) => {
                return res;
            })
            .then(result => {
                if(id == 1) {

                    //render the template
                    var html = this._templateManager.render('allVisitorsPrintOut', {data: result.rows});

                    var options = {format: 'A5', orientation: 'landscape'};

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
                    })
                }

                return result;
            })
            .catch(err => {
                this._logger.error("Problem while Printing Visitors: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }


    addFiremarshall (data) {
        return this._visitorStore.addFiremarshall(data)
            .then((res) => {
                return res;
            })
    }

    updateFiremarshall (id, data) {
        return this._visitorStore.updateFiremarshall(id, data)
            .then((res) => {
                return res;
            })
    }

    allFireMarshall () {
        return this._visitorStore.allFiremarshall()
            .then((res) => {
                return res;
            })
    }

    deleteFireMarshall (id) {
        return this._visitorStore.deleteFiremarshall(id)
            .then((res) => {
                return res;
            })
    }

    fireMarshallMail () {
        return this._visitorStore.fireMarshallMail()
            .then((res) => {
                return res;
            })
    }


    //Search

    searchAllSignIns (id) {

        this._logger.info("Getting All Visitors!");
        this._logger.info("Getting Data");
        return this._visitorStore.searchAllSignIns(id)
            .then((data) => {
                return data;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }

    //NFC Activity
    nfcActivity (id) {
        return this._visitorStore.nfcActivity(id)
            .then((res) => {
                return res;
            })
            .catch(err => {
                this._logger.error("Cannot create customer see error for more info: -> " + JSON.stringify(err));
                throw new Error(err);
            });
    }
}
