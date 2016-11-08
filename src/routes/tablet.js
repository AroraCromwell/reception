"use strict";

import {_} from "lodash";
import getPrinters from "../resources/printers";
var base64 = require("node-base64-image");
var allTablets = "";

export class TabletRoutes {

    constructor(visitorService, logger, io, tabletCache) {
        this._visitorService = visitorService;
        this._logger = logger;
        this._io = io;
        allTablets = tabletCache.get( "allTabs" );
    }

    /**
     *
     * @return {*[]}
     */
    addTablet(){
        return [
            (req, res) => {
                getPrinters()
                    .then(printerResult => {
                        this._visitorService.addTablet()
                            .then(result => {
                                result.allPrinters = printerResult.printersArray;
                                res.render("add_tablet", {data: result});
                            });
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({ message: "Error", data: JSON.stringify(err)});
                    });
            }
        ];
    }

    /**
     *
     * @return {*[]}
     */
    tabletPost(){
        return [
            (req, res) => {
                this._visitorService.tabletPost(req.body)
                    .then(() => {
                        if(req.body.another !== undefined){
                            res.redirect("/addTablet/?location=" + req.body.location);
                        }else {
                            res.redirect("/allTablet");
                        }

                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : err.toString() });
                    });
            }
        ];
    }

    /**
     *
     * @return {*[]}
     */
    allTablet(){
        return [
            (req, res) => {
                this._visitorService.allTablet()
                    .then(result => {
                        let row = result.rows;
                        res.render("all_tablet", {data: row});
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
    fetchDataForTablet(){
        return [
            (req, res) => {
                this._visitorService.addTablet()
                    .then(result => {

                        var allOptions ="";
                        var allDept ="";
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
        ];
    }

    /**
     *
     * @return {*[]}
     */
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
        ];
    }

    /**
     *
     * @return {*[]}
     */
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
        ];
    }

    /**
     *
     * @return {*[]}
     */
    allTabletLocations() {
        return [
            (req, res) => {
                //We actually need all the tablets to be listed while adding suggestion.
                this._visitorService.allTabletLocations()
                    .then(result => {
                        this._tabletCache.set("allTabs", result.rows,function( err, success ){
                            if( !err && success ){
                                console.log( success );
                            }
                        });
                        res.send(result.rows);
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                    });
            }
        ];
    }
}
