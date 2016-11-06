"use strict";

import {_} from "lodash";
var allTablets;
export class StatusRoutes {

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
    graph(){
        return [
            (req, res) => {
                    this._visitorService.processGraphData()
                        .then(result => {
                            result.locations = allTablets;
                            res.render('graph_data', {"data": result});
                        })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err), retry: 1});
                    });
            }
        ]
    }

    /**
     *
     * @return {*[]}
     */
    status () {
        return [
            (req, res) => {
                this._visitorService.processStatus(req.body)
                    .then(() => {
                        res.send({success : 1, message : "completed", data : {}, retry: 0});
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
    cleanStatus() {
        return this._visitorService.cleanStatus()
            .then(() => {
                return {success : 1, message : "completed", data : {}, retry: 0};
            })
            .catch(err => {
                this._logger.error(err);
                return err;
            });
    }

    /**
     *
     * @param data
     */
    deviceStatus (data) {
        console.log("device status");
        this._visitorService.processStatus(data)
            .then(result => {
            })
            .catch(err => {
                this._logger.error(err);
            });
    }

    /**
     *
     * @return {*[]}
     */
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
}
