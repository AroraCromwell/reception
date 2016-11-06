"use strict";

import {_} from "lodash";
var allTablets;
export class FirstAidRoutes {

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
    getFirstAid (){
        return [
            (req,res) => {
                //We actually need all the tablets to be listed while adding suggestion.
                res.render('showFirstAid', {"data": allTablets});
            }
        ]
    }

    /**
     *
     * @return {*[]}
     */
    postFirstAid(){
        return [
            (req, res) => {
                this._visitorService.postFirstAid(req.body)
                    .then(() => {
                        if(req.body.another != undefined){
                            res.redirect("/firstAid");
                        }else {
                            res.redirect("/allFirstAid");
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
    updateFirstAid (){
        return [
            (req, res) => {
                console.log(req.params.id);
                this._visitorService.updateFirstAid(req.params.id, req.body)
                    .then(result => {
                        res.redirect("/allFirstAid");
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
    allFirstAid (){
        return [
            (req, res) => {
                this._visitorService.allFirstAid()
                    .then(result => {
                        let row = result.rows;
                        row.locations = allTablets;
                        res.render('allFirstAid', {data: row});
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
    deleteFirstAid (){
        return [
            (req, res) => {
                this._visitorService.deleteFirstAid(req.params.id)
                    .then(result => {
                        let row = result.rows;
                        res.render('allFirstAid', {data: row});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});
                    });
            }
        ];
    }
}
