
"use strict";
var fs = require("fs");
var pdf = require("html-pdf");
var exec = require('child_process').exec;
import config from "../config.json";
import {_} from "lodash";

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

                        var options = { format: 'A5', orientation: 'landscape', base: "file://"+ config.imagePath,type: "png,jpeg"};

                        pdf.create(html, options).toFile('./pdf/' + visitorId + '.pdf', function(err, pdfRes) {
                            if (err) return console.log(err);

                            //var cmd ="lp -o landscape -o scaling=97  -d" + config.printer.set + " "+ pdfRes.filename;

                            var cmd = '"C:\\Program Files (x86)\\Foxit Software\\Foxit Reader\\FoxitReader.exe" /t "C:\\reception-handler\\build\\pdf\\"' + pdfRes.filename +  '"BrotherHL-3150CDWseries" “IP_10.100.16.193"';

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

    processGraphData() {

        this._logger.info("getting graph data!");

        return this._visitorStore.processGraphData()
            .then((data) => {
                return data;
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
                        if((data.rows[key-1].date_part) - 70 > value.date_part) {
                            setVal = 0 ;
                        }
                    }
                    else {
                        setKey = this.timeConverter(currtimeStamp);
                        if(currtimeStamp - 70 > value.date_part) {
                            setVal = 0 ;
                        }
                    }


                    setData.push({setKey, setVal});
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
        var hour = a.getHours();
        if(hour < 10) {
            hour = '0' + hour;
        }

        var min = a.getMinutes();
        if(min < 10) {
            min = '0' + min;
        }

        var sec = a.getSeconds();
        if(sec < 10) {
            sec = '0' + sec;
        }

        var time =  hour + '.' + min ;
        return time;
    }
}
