"use strict";

import {_} from "lodash";
var base64 = require('node-base64-image');
var allTablets = "";

export class AutoCompleteRoutes {

    constructor(visitorService, logger, io, tabletCache) {
        this._visitorService = visitorService;
        this._logger = logger;
        this._io = io;
        this._tabletCache = tabletCache;
    }

    /**
    * @description Showing Add Auto Complete Ui
    * @description Need All Tablets locations to choose from for autoComplete location
    */
    autoCompleteAdd(){
        return [
            (req, res) => {
                allTablets = this._tabletCache.get( "allTabs" );
                res.render('autoCompleteAdd', {"data": allTablets});
            }
        ]
    }

    /**
    * @description Post AutoComplete Data
    * @param {object}  Data filled  by user
    * @description After adding the autoComplete to db , socket io will send this autoComplete word to the corresponding
    * tablet, chose by user.
    * @returns Redirect to /AutoComplete to show all the AutoCompletes after resolving the result using promise.
    */

    autoCompletePost(){
        return [
            (req, res) => {
                this._visitorService.autoCompletePost(req.body)
                    .then(result => {
                        // set up json data to emit which includes location Id and data
                        this._logger.info( ">>>Suggestion will be added on TabletID" + result.rows[0].tablet_id );
                        // check how to receive this data on android side
                        this._io.emit('AddSuggestion-'+result.rows[0].tablet_id, result.rows[0]);

                        if(req.body.another !== "undefined"){
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

    /**
     * @description Updating the AutoComplete Data for a specific tablet.
     * @param id of the tablet to be updated.
     * @param {object} data filled by user.
     * @return {*[]}Redirect to /AutoComplete to show all the AutoCompletes after resolving the result using promise.
     */
    updateAutoComplete(){
        return [
            (req, res) => {
                this._visitorService.updateAutoComplete(req.params.id, req.body)
                    .then(result => {
                        if(result.rows[0].location =='BRC'){
                            this._logger.info( ">>>Suggestion will be updated on TabletID" + result.rows[0].tablet_id);
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

    /**
     * @description Deleting AutoComplete Data for a specific tablet.
     * @param ID of the tablet to be deleted.
     * @return {*[]}Redirect to /AutoComplete to show all the AutoCompletes after resolving the result using promise.
     */
    deleteAutoComplete(){
        return [
            (req, res) => {
                this._visitorService.deleteAutoComplete(req.params.id)
                    .then(result => {
                        //Fire delete message, So Device will delete it from Android App
                        var myString = {"id":req.params.id,"type":req.body.type} ;

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

    /**
     * @description Show All AutoComplete Data.
     */

    autoComplete(){
        return [
            (req, res) => {
                if(this._localStorage.getItem('email')) {
                    this._visitorService.allTabletLocations()
                        .then(locations => {
                            this._visitorService.autoComplete()
                                .then(result => {
                                    result.locations = locations.rows;
                                    res.render('autoComplete', {data: result});
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

    /**
     * @description Don't know. Need to Find the usage . @ToDO
     */
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
}
