/**
 * index
 */

"use strict";


/* Node modules */


/* Third-party modules */


/* Files */

import {_} from "lodash";
export class Visitors {

    constructor (visitorService, logger, localStorage, io ) {
        this._visitorService = visitorService;
        this._logger = logger;
        this._localStorage = localStorage;
        this._io = io;
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
                    this._visitorService.allSignIns()

                        .then(result => {
                                let row = result.rows;
                            res.render('all_visitors', {data: row});
                            // res.send({success : 1, message : "completed", row, retry: 0});

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

                console.log("Node service data" + req.body);
                this._visitorService.processRequest(req.body)

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
                    this._visitorService.allSignOutToday()

                        .then(result => {
                            let row = result.rows;
                            res.render('all_signed_out', {data: row});
                            //res.send({success : 1, message : "completed", data : {}, retry: 0});

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
                if( req.body.inputEmail == "admin@admin.com" && req.body.inputPassword == "1234"){
                        this._localStorage.setItem("email", req.body.inputEmail);
                        res.redirect("allVisitors");
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

                this._visitorService.getTermsRequest(id)
                .then(result => {

                    res.render(result, { title: 'my other page', layout: '' });
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
                    //res.render("allTerms",{"data": result.rows});
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

                this._visitorService.allTermsRequest()

                .then(result => {
                    res.render("allTerms",{"data": result.rows, helpers:{
                        checkStatus: function (status) {
                            if(status == 1){
                                return 'checked';
                            }

                        }
                    }});
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
                 res.render('addTerms');
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
                this._visitorService.processGraphData()
                .then(result => {
                    res.render('graph_data', {"data": result});
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
                res.render('autoComplete_add');
            }
        ]
    }

    autoCompletePost(){
        return [
            (req, res) => {
                this._visitorService.autoCompletePost(req.body)
                .then(result => {
                    if(result.rows[0].location =='BRC'){
                            this._io.emit('brcSuggestionAdd', result.rows[0]);
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

    updateAutoComplete(){
        return [
            (req, res) => {
                this._visitorService.updateAutoComplete(req.params.id, req.body)
                .then(result => {
                    if(result.rows[0].location =='BRC'){
                        this._io.emit('brcSuggestionUpdate', result.rows[0]);
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
                    this._io.emit('brcSuggestionDelete', myString);
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
                    this._visitorService.autoComplete()
                        .then(result => {
                            let row = result.rows;
                            res.render('auto_Complete', {data: row});
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
                this._visitorService.allStaff()
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
                        res.send({status: 'ok'});
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

    staffSignOut(){
        return [
            (req, res) => {

                this._visitorService.staffSignOut(req.params.id)
                    .then(result => {
                        res.send({success: 1, message: "Completed"});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }
}
