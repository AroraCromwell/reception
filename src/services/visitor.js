
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
                var d = new Date();
                d.setHours(0,0,0,0);
                var dtimeStamp  =  Math.floor(d / 1000);
                console.log("check this dtiemstamp "+ +dtimeStamp);

                var setData = [];
                var midnightStatus = 0;
                _.forEach(result.rows, (value, key) => {

                    let setkey = this.timeConverter(value.date_part);
                    let setVal = 1 ;

                    if(key > 0 ){
                        // check if the  last entry was 5 minutes prior, then add those values for
                        // whatever the time entries are not there till this entry

                        if((result.rows[key-1].date_part) + 310 < value.date_part) {

                            for (var j = 0; j < 300; j++) {
                                if(value.date_part > result.rows[key-1].date_part){
                                    let setkey = this.timeConverter(result.rows[key-1].date_part);
                                    let setVal = 0 ;
                                    setData.push(JSON.stringify({setkey, setVal}));
                                    result.rows[key-1].date_part = result.rows[key-1].date_part + 310;
                                } else{
                                    setVal = 0 ;
                                    console.log("inside break");
                                    break;
                                }
                            }
                         }

                        // check if the  very last entry is 5 minutes prior than current timestamp,
                        // if not then add those values for
                        // whatever the time entries are not there till current timestamp
                        var veryLastKey = result.rows.length - 1;

                        //console.log("LAt key" + veryLastKey);
                        //console.log("last key result " + result.rows[veryLastKey].date_part);

                        var currtimeStamp  =  Math.floor(new Date() / 1000);
                        if( key == veryLastKey && (result.rows[veryLastKey].date_part) + 310 < currtimeStamp) {

                            for (var j = 0; j < 300; j++) {
                                if(currtimeStamp > result.rows[veryLastKey].date_part){
                                    let setkey = this.timeConverter(result.rows[veryLastKey].date_part);
                                    let setVal = 0 ;
                                    setData.push(JSON.stringify({setkey, setVal}));
                                    result.rows[veryLastKey].date_part = result.rows[veryLastKey].date_part + 310;
                                } else{
                                    //setVal = 0 ;
                                    console.log("inside  post break");
                                    break;
                                }
                            }
                        }

                    }else{
                        for (var j = 0; j < 300; j++) {
                            if(value.date_part > dtimeStamp){
                                let setkey = this.timeConverter(dtimeStamp);
                                let setVal = 0 ;
                                setData.push(JSON.stringify({setkey, setVal}));
                                dtimeStamp = dtimeStamp + 310;
                            } else{
                                console.log("inside zero break");
                                break;
                            }
                        }
                    }
                    setData.push(JSON.stringify({setkey, setVal}));
                });

                if(midnightStatus == 0){
                    let setkey = this.timeConverter(dtimeStamp);
                    let setVal = 0 ;
                    setData.push(JSON.stringify({setkey, setVal}));
                }
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
                var currtimeStamp  =  Math.floor(new Date() / 1000);



                _.forEach(data.rows, (value, key) => {
                    let setKey = "";
                    let setVal = 1 ;
                    if(key > 0 ){
                        setKey = this.timeConverter(value.date_part);
                        if((data.rows[key-1].date_part) - 310 > value.date_part) {
                            setVal = 0 ;
                        }
                    }
                    else {

                        if(currtimeStamp - 310 > value.date_part) {
                            setVal = 0 ;

                            // As service is not up from last 1 minute , it means it is down for now as well,
                            // so show status down for now as well
                            setKey = this.timeConverter(currtimeStamp);
                            setData.push({setKey, setVal});
                        }
                        setKey = this.timeConverter(value.date_part);
                    }


                    setData.push(JSON.stringify({setKey, setVal}));
                });

                console.log(setData);
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

}
