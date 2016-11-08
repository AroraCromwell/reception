"use strict";

import {_} from "lodash";
var base64 = require("node-base64-image");
var thumb = require("node-thumbnail").thumb;
import config from "../config.json";
var Cryptr = require("cryptr"),
    cryptr = new Cryptr("Cr0mwellTools");

var allTablets = "";

export class Visitors {

    constructor (visitorService, logger, io, tabletCache ) {
        this._visitorService = visitorService;
        this._logger = logger;
        this._io = io;
        allTablets = tabletCache.get( "allTabs" );
    }

    /**
     *
     * @return {*[]}
     */
    getVisitors() {
        return [
            (req, res) => {
                this._visitorService.getVisitors(req.params.id)
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

    /**
     *
     * @return {*[]}
     */
    allVisitorsSignIn() {
        return [
            (req, res) => {
                if(typeof(req.query.tabId) === "undefined" || req.query.tabId === 0){
                    let err = "Tablet Id cannot be null or 0";
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : (err)});
                    return;
                }
                this._visitorService.allVisitorsSignIn(req.query.tabId)
                    .then(result => {
                        result.locations = allTablets;
                        res.render("all_visitors", {data: result});
                    })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                });
            }
        ];
    }

    /**
     *
     * @return {*[]}
     */
    postVisitor () {
        return [
            (req, res) => {
                this._logger.info("Visitor for Tab Id" + req.query.tabId);

                if(typeof(req.query.tabId) === "undefined" || req.query.tabId === 0){
                    let err = "Tablet Id cannot be null or 0";
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : (err)});
                    return;
                }

                this._visitorService.postVisitor(req.query.tabId, req.body)
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

    /**
     *
     * @return {Promise.<T>|Promise}
     */

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

    /**
     *
     * @return {*[]}
     */
    allVisitorsSignOut() {
        return [
            (req, res) => {
                if(typeof(req.query.tabId) === "undefined" || req.query.tabId === 0){
                    let err = "Tablet Id cannot be null or 0";
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : (err)});
                    return;
                }

                this._visitorService.allVisitorsSignOut()
                    .then(result => {
                        result.locations = allTablets;
                        res.render("all_signed_out", {data: result});
                    })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                });

            }
        ];
    }

    /**
     *
     * @return {*[]}
     */
    updateVisitor () {
        return [
            (req, res) => {

                if(req.params.id === 0){
                    console.log("No value given");
                    res.send({success : 0, message : "Error", data : "", retry: 1});
                }
                else {
                    this._visitorService.updateVisitor(req.params.id, req.body)
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


    getTerms(){
        return [
            (req,res) => {
                var id = req.params.id;
                this._visitorService.allTabletLocations()
                    .then(locations => {
                        this._visitorService.getTermsRequest(id)
                            .then(result => {
                                result.locations = locations.rows;
                                res.render(result, {title: "my other page", layout:""});
                            });
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }


    postTerms(){
        return [
            (req,res) => {
                this._visitorService.postTermsRequest(req.body)
                .then(result => {
                    res.redirect("allTerms");
                })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                });
            }
        ];
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
        ];
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
                                            if (status === 1) {
                                                return "checked";
                                            }
                                        }
                                    }
                                });
                            });
                    })
                .catch(err => {
                    this._logger.error(err);
                    res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                });
            }
        ];
    }

    templateTerms(){
        return [
            (req,res) => {
                this._visitorService.allTabletLocations()
                    .then(locations => {
                        res.render("addTerms", {data: locations.rows});
                    });
            }
        ];
    }


    nfcWrite() {
        return [
            (req, res) => {
                var textToWrite = cryptr.encrypt(req.params.id);
                console.log(">>>This is the text to write " + textToWrite);
                res.send({message: "Success", data: textToWrite});
            }
        ];
    }
}
