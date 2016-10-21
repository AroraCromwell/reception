/**
 * index
 */

"use strict";


/* Node modules */


/* Third-party modules */


/* Files */

import {_} from "lodash";
var base64 = require('node-base64-image');
var thumb = require('node-thumbnail').thumb;
var Print = require('pliigo-cups-agent');
var PrintManager = new Print();
var exec = require('child_process').exec;

export class Visitors {

    constructor (visitorService, logger, localStorage, io, sendMail ) {
        this._visitorService = visitorService;
        this._logger = logger;
        this._localStorage = localStorage;
        this._io = io;
        this._sendMail = sendMail;
    }

    get () {
        return [
            (req, res) => {

                this._visitorService.processGetRequest(req.params.id)
                    .then(result => {
                        let row = result.rows;
                        res.send({success : 1, message : "completed", data : {row}, retry: 0});

                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});

                    });
            }
        ];
    }

    allSignIns () {
        return [
            (req, res) => {
                if(this._localStorage.getItem('email')) {
                    if(typeof(req.query.tabId) == 'undefined' || req.query.tabId ==0){
                        let err = "Tablet Id cannot be null or 0";
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : (err)});
                        return;
                    }

                    this._visitorService.allTabletLocations()
                        .then(locations => {
                              this._visitorService.allSignIns(req.query.tabId)
                                .then(result => {
                                    result.locations = locations.rows;
                                    res.render('all_visitors', {data: result});
                            })
                        })
                        .catch(err => {
                            this._logger.error(err);
                            res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                        });
                }else {
                    res.redirect("/");
                }
            }
        ];
    }

    post () {
        return [
            (req, res) => {
                this._logger.info("Visitor for Tab Id" + req.query.tabId);

                if(typeof(req.query.tabId) == 'undefined' || req.query.tabId ==0){
                    let err = "Tablet Id cannot be null or 0";
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : (err)});
                    return;
                }

                this._visitorService.processRequest(req.query.tabId, req.body)
                    .then(result => {
                        res.send({success : 1, message : "completed", id : result, retry: 0});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

     allSignOut() {
        return this._visitorService.allSignOut()
        .then(result => {
            return {success : 1, message : "completed", data : {}, retry: 0};
        })
        .catch(err => {
            this._logger.error(err);
            return err;
        });
    }

    allSignOutToday() {
        return [
            (req, res) => {
                if(this._localStorage.getItem('email')) {

                    if(typeof(req.query.tabId) == 'undefined' || req.query.tabId ==0){
                        let err = "Tablet Id cannot be null or 0";
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : (err)});
                        return;
                    }

                    this._visitorService.allTabletLocations()
                        .then(locations => {
                            this._visitorService.allSignOutToday()
                                .then(result => {
                                    result.locations = locations.rows;
                                    res.render('all_signed_out', {data: result});
                                })
                        })
                        .catch(err => {
                            this._logger.error(err);
                            res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});

                        });
                }else{
                    res.redirect('/');
                }
            }
        ];
    }

    put () {
        return [
            (req, res) => {

                if(req.params.id == 0){
                    console.log("No value given");
                    res.send({success : 0, message : "Error", data : "", retry: 1});
                }
                else {
                    this._visitorService.processPutRequest(req.params.id, req.body)
                        .then(result => {
                            res.send({success: 1, message: "completed", data: {}, retry: 0});
                        })
                        .catch(err => {
                            this._logger.error(err);
                            res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                        });
                }
            }
        ];
    }

    loginView(){
        var error = "";
        return[
            (req, res) => {
                if(this._localStorage.getItem("email")){
                    this._localStorage.removeItem("email");
                }

                if(this._localStorage.getItem("error")) {
                    error = this._localStorage.getItem("error");

                    res.render("admin_login",{data:error});
                    this._localStorage.removeItem("error");
                }else{
                    res.render("admin_login",{data:""});
                }


            }
        ]
    }
    adminLogin(){

        return [
            (req, res) => {
                if( req.body.inputEmail == "admin@admin.com" && req.body.inputPassword == "Lewis@3524"){
                        this._localStorage.setItem("email", req.body.inputEmail);
                        res.redirect("allVisitors?tabId=1");
                }else{
                    this._localStorage.setItem("error", "Please Check Username and Password");
                    res.redirect("/");
                }
            }
        ]
    }
    getTerms(){
        return [
            (req,res) => {
                var id = req.params.id;
                this._visitorService.allTabletLocations()
                    .then(locations => {
                        this._visitorService.getTermsRequest(id)
                            .then(result => {
                                result.locations = locations.rows;
                                res.render(result, {title: 'my other page', layout: ''});
                            })
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                    });
            }
        ]
    }


    postTerms(){
        return [
            (req,res) => {
                this._visitorService.postTermsRequest(req.body)
                .then(result => {
                    res.redirect('allTerms');
                })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                });
            }
        ]
    }

    updateTerms() {
        return [
            (req,res) => {
                this._visitorService.updateTermsRequest(req.params.id)
                .then(result => {
                    res.send({success : 1, message : "Success!", data : " ", retry: 0});
                })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                });
            }
        ]
    }

    allTerms(){
        return [
            (req,res) => {
                this._visitorService.allTabletLocations()
                    .then(locations => {
                        this._visitorService.allTermsRequest()
                            .then(result => {
                                result.lcoations = locations.rows;
                                res.render("allTerms", {
                                    "data": result, helpers: {
                                        checkStatus: function (status) {
                                            if (status == 1) {
                                                return 'checked';
                                            }
                                        }
                                    }
                                });
                            })
                    })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                });
            }
        ]
    }

    templateTerms(){
        return [
            (req,res) => {
                this._visitorService.allTabletLocations()
                    .then(locations => {
                        res.render('addTerms', {data: locations.rows});
                    })
            }
        ]
    }
    test(){
        return [
            (req,res) => {
                res.render('crom_visitor');
            }
        ]
    }

    status () {
        return [
            (req, res) => {
                this._visitorService.processStatus(req.body)
                .then(result => {
                    res.send({success : 1, message : "completed", data : {}, retry: 0});
                })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                });
            }
        ];
    }

    cleanStatus() {
        return this._visitorService.cleanStatus()
            .then(result => {
                return {success : 1, message : "completed", data : {}, retry: 0};
            })
            .catch(err => {
                this._logger.error(err);
                return err;
            });
    }

    deviceStatus (data) {
        console.log("device status");
        this._visitorService.processStatus(data)
            .then(result => {
                //res.send({success : 1, message : "completed", data : {}, retry: 0});
            })
            .catch(err => {
                this._logger.error(err);
                //res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
            });
    }

    graph(){
        return [
            (req, res) => {
                 this._visitorService.allTabletLocations()
                    .then(locations => {
                        this._visitorService.processGraphData()
                        .then(result => {
                            result.locations = locations.rows;
                            res.render('graph_data', {"data": result});
                        })
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                    });
            }
        ]
    }


    currentStatus(){
        return [
            (req, res) => {
                this._visitorService.currentStatus()
                    .then(result => {
                        res.send({success : 1, message : "completed", data : {result} });
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                    });
            }
        ]
    }

    autoCompleteAdd(){
        return [
            (req, res) => {
                //res.render('autoComplete_add');
                //We actually need all the tablets to be listed while adding suggestion.
                this._visitorService.allTabletLocations()
                    .then(result => {
                        res.render('autoComplete_add', {"data": result.rows});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                    });
            }
        ]
    }

    allTabletLocations() {
        return [
            (req, res) => {
                //res.render('autoComplete_add');
                //We actually need all the tablets to be listed while adding suggestion.
                this._visitorService.allTabletLocations()
                    .then(result => {
                        res.send(result.rows);
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                    });
            }
        ]
    }

    autoCompletePost(){
        return [
            (req, res) => {

                this._visitorService.autoCompletePost(req.body)
                .then(result => {
                    // set up json data to emit which includes location Id and data
                    // check how to receive this data on android side
                    this._io.emit('AddSuggestion-'+result.rows[0].tablet_id, result.rows[0]);

                    if(req.body.another != "undefined"){
                        res.redirect("/autoCompleteAdd/?type=" + req.body.type);
                    }else {
                        res.redirect("/autoComplete");
                    }

                })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                });
            }
        ]
    }

    updateAutoComplete(){
        return [
            (req, res) => {
                this._visitorService.updateAutoComplete(req.params.id, req.body)
                .then(result => {
                    if(result.rows[0].location =='BRC'){
                        console.log( "Suggestion will be updated on TabletID" + result.rows[0].tablet_id );
                        this._io.emit( "UpdateSuggestion-"+result.rows[0].tablet_id, result.rows[0]);
                    }
                    res.redirect("/autoComplete");
                })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                });
            }
        ]
    }

    deleteAutoComplete(){
        return [
            (req, res) => {
                this._visitorService.deleteAutoComplete(req.params.id)
                .then(result => {
                    //Fire delete message, So Device will delete it from Android App
                    var myString = {"id":req.params.id,"type":req.body.type} ;
                    //this._io.emit('brcSuggestionDelete', myString);
                    this._io.emit('DeleteSuggestion-'+result.rows[0].tablet_id, myString);
                    res.send({success : 1, message : "completed", data : {result} });
                })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                });
            }
        ]
    }

    autoComplete(){
        return [
            (req, res) => {
                if(this._localStorage.getItem('email')) {
                    this._visitorService.allTabletLocations()
                        .then(locations => {
                            this._visitorService.autoComplete()
                                .then(result => {
                                    result.locations = locations.rows;
                                    res.render('auto_Complete', {data: result});
                                })
                        })
                        .catch(err => {
                            this._logger.error(err);
                            res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});

                        });
                }else {
                    res.redirect("/");
                }
            }
        ];
    }

    autoCompleteId(){
        return [
            (req, res) => {
                this._visitorService.autoCompleteId(req.params.id)
                    .then(result => {
                        let row = result.rows;
                        res.render('auto_Complete', {data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                });
            }
        ];
    }

    // Staff information

    allStaff(){
        return [
            (req, res) => {
                this._logger.info("Staff for Tab Id" + req.query.tabId);
                this._visitorService.allStaff(req.query.tabId)
                    .then(result => {
                        let row = result.rows;
                        res.send({status: 'ok', count: '20' , count_total: result.rowCount, data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    staffData(){
        return [
            (req, res) => {
                this._visitorService.staffData(req.params.id)
                    .then(result => {
                        let row = result.rows;
                        res.send({status: 'ok', count: '20' , count_total: result.rowCount, data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    staffSignIn(){
        return [
            (req, res) => {

                this._visitorService.staffSignIn(req.params.id)
                    .then(result => {
                        res.send({success: 1, message: "completed"});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                });
            }
        ];
    }

    staffSignedIn(){
        return [
            (req, res) => {

                this._visitorService.staffSignedIn(req.params.id)
                    .then(result => {
                        let row = result.rows;
                        res.render('all_staffsignedin', {data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    staffSignedOut(){
        return [
            (req, res) => {

                this._visitorService.allTabletLocations()
                    .then(locations => {
                        this._visitorService.staffSignedOut(req.params.id)
                            .then(result => {
                                result.locations = locations.rows;
                                //console.log(locations.rows);
                                //result.locations = JSON.parse(req.locations);
                                res.render('all_staffsignedout', {data: result});
                            })
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    staffSignOut(){
        return [
            (req, res) => {

                this._visitorService.staffSignOut(req.params.id)
                    .then(result => {
                        res.send({success: 1, message: "completed", data: JSON.stringify(result.rows)});
                    })
                    .catch(err => {
                        this._logger.error(err.message);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err.message), retry: 1});
                    });
            }
        ];
    }

    captureStaffImage() {
        return [
            (req, res) => {
                console.log("this is staff id" + req.body.paramStaffId);
                console.log("this is staff image path" + req.body.paramLocalImagePath);

                var dir = "./public/images/staff/";

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }

                var imageName = req.body.paramStaffId ;
                var options = {filename: dir + imageName};
                var imageData = new Buffer(req.body.paramImagePath, 'base64');

                base64.base64decoder(imageData, options, function (err, saved) {
                    if (err) {
                        console.log(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    }
                    console.log(saved);
                    res.send({success: 1, message: "Completed"});
                });
            }
        ]
    }

    allPrintOut(){
        return [
            (req, res) => {

                var id = req.params.id == null ? 1 : req.params.id;

                this._visitorService.allPrintOut(id)
                    .then(result => {
                        return result;
                    })
                    .then(response => {
                        var combineData = response;
                        console.log(combineData.rows);
                        this._visitorService.fireMarshallMail()
                            .then( res => {

                                var emailReceiver = [];
                                _.each(res.rows , function (value, key) {
                                    emailReceiver.push(value.email_adds);
                                });


                                var emailR = emailReceiver.toString();

                                var mailOptions = {
                                    from: "IT Services<aroras@cromwell.co.uk>", // sender address
                                    to: emailR, // list of receivers
                                    subject: "Fire: Cromwell Reception", // Subject line
                                    text: "There is fire in the building. Please find attached list of all Staff and Visitors in the building.",
                                    attachments: [
                                        {   // utf-8 string as an attachment
                                            filename: "staff.pdf",
                                            content: "C:\\reception-handler\\build\\pdf\\allStaff.pdf"
                                        },
                                        {
                                            filename: "visitors.pdf",
                                            content: "C:\\reception-handler\\build\\pdf\\allVisitors.pdf"
                                        }
                                    ]
                                };

                                console.log("Sending Email ");
                                //this._sendMail.mail(mailOptions);
                            })

                        if(id == 1 ){
                            res.render('allPrintOut', {data: combineData});
                        }else {
                            res.render('allVisitorsPrintOutWithPrint', {data: combineData});
                        }
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    showFiremarshall (){
        return [
            (req,res) => {
                res.render('show_firemarshall');
            }
        ]
    }


    addFiremarshall (){
        return [
            (req, res) => {
                this._visitorService.addFiremarshall(req.body)
                    .then(result => {

                        if(req.body.another != "undefined"){
                            res.redirect("/fireMarshall");
                        }else {
                            res.redirect("/allFireMarshall");
                        }

                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    updateFiremarshall (){
        return [
            (req, res) => {
                this._visitorService.updateFiremarshall(req.params.id, req.body)
                    .then(result => {
                        res.redirect("/allFireMarshall");
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    allFireMarshall (){
        return [
            (req, res) => {
                this._visitorService.allFireMarshall()
                    .then(result => {
                        let row = result.rows;
                        //res.render("/allVisitorsPrintOut", {data: row});
                        res.render('all_firemarshall', {data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    deleteFireMarshall (){
        return [
            (req, res) => {
                this._visitorService.deleteFireMarshall(req.params.id)
                    .then(result => {
                        let row = result.rows;
                        res.render('all_firemarshall', {data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }


    //NFC SignIn And SignOut
    nfcActivity(){
        return [
            (req, res) => {

                this._visitorService.nfcActivity(req.params.id)
                .then(result => {
                    var status = result.activity == "UPDATE" ? "sign_out" : "sign_in" ;
                    res.send({message: "Success", activity: status, name: result.rows[0].first_name + " " + result.rows[0].surname});
                })
                .catch(err => {
                    this._logger.error(err);
                    res.send({ message: "Error", data: JSON.stringify(err)});
                });
            }
        ];
    }


    //Functionality for Tablets
    addTablet(){
        return [
            (req, res) => {
                this.getAllPrinters()
                    .then(printerResult => {
                        this._visitorService.addTablet()
                            .then(result => {
                                result.allPrinters = printerResult.printersArray;
                                res.render('add_tablet', {data: result});
                            })
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({ message: "Error", data: JSON.stringify(err)});
                    });
            }
        ]
    }

    tabletPost(){
        return [
            (req, res) => {
                this._visitorService.tabletPost(req.body)
                    .then(result => {
                        if(req.body.another != "undefined"){
                            res.redirect("/addTablet/?location=" + req.body.location);
                        }else {
                            res.redirect("/allTablet");
                        }

                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                    });
            }
        ]
    }


    allTablet(){
        return [
            (req, res) => {
                this._visitorService.allTablet()
                    .then(result => {
                        let row = result.rows;
                        res.render('all_tablet', {data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }

    fetchDataForTablet(){
        return [
            (req, res) => {
                this._visitorService.addTablet()
                    .then(result => {

                        var allOptions = '';
                        var allDept = '';
                        _.each(result.locations, function(value) {
                               allOptions  += '<option value="' + value.location_id +'_'+ value.location_name +'">'+ value.location_name + '</option>';
                            });
                        _.each(result.departments, function(val) {
                            allDept  += '<input type="checkbox" name="department" ' +
                                        'id="' + val.department_id + '" value="' + val.department_id +'_' + val.department +'_'+ val.id +'" >'  + val.department + '<br>';
                        });
                        result.options  = allOptions;
                        result.depts  = allDept;
                        res.send({message: "success", data: result});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({ message: "Error", data: JSON.stringify(err)});
                    });
            }
        ]
    }

    updateTablet(){
        return [
            (req, res) => {
                this._visitorService.updateTablet(req.params.id, req.body)
                    .then(result => {
                        res.redirect("/allTablet");
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                    });
            }
        ]
    }

    deleteTabletDept(){
        return [
            (req, res) => {
                this._visitorService.deleteTabletDept(req.params.id)
                    .then(result => {
                        res.send({success : 1, message : "completed", data : {result} });
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                    });
            }
        ]
    }


    getPrinters(){
        return [
            (req, res) => {
                var printersArray = PrintManager.getPrinters();
                var  finalArray = [];
                _.each(printersArray, function(value, key) {
                    console.log(value.name);
                    finalArray[key] = value.name;
                });
                res.send({success : 1, message : "completed", data : {finalArray} });
            }
        ];
    }

    getAllPrinters(){
        return new Promise(function (resolve, reject) {
            try{
                var printersArray = PrintManager.getPrinters();
                resolve({printersArray});
            }catch (e){
                reject(e);
            }
        })
    }
}
