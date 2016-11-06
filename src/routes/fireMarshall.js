"use strict";

import {_} from "lodash";
var allTablets;

export class FireMarshallRoutes {

    constructor(visitorService, logger, io, tabletCache) {
        this._visitorService = visitorService;
        this._logger = logger;
        this._io = io;
        this._tabletCache = tabletCache;
    }

    /**
     *
     * @return {*[]}
     */

    showFireMarshall (){
        return [
            (req,res) => {
                //We actually need all the tablets to be listed while adding suggestion.
                allTablets = this._tabletCache.get( "allTabs" );
                res.render('showFireMarshall', {"data": allTablets});
            }
        ]
    }

    /**
     *
     * @return {*[]}
     */

    addFireMarshall (){
        return [
            (req, res) => {
                this._visitorService.addFireMarshall(req.body)
                    .then(result => {
                        if(req.body.another != undefined){
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

    /**
     *
     * @return {*[]}
     */

    updateFireMarshall (){
        return [
            (req, res) => {
                this._visitorService.updateFireMarshall(req.params.id, req.body)
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

    /**
     *
     *
     * @return {*[]}
     */
    allFireMarshall (){
        return [
            (req, res) => {
                this._visitorService.allFireMarshall()
                    .then(result => {
                        let row = result.rows;
                        res.render('allFireMarshall', {data: row});
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
    deleteFireMarshall (){
        return [
            (req, res) => {
                this._visitorService.deleteFireMarshall(req.params.id)
                    .then(result => {
                        let row = result.rows;
                        res.render('allFireMarshall', {data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }
}
