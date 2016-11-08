"use strict";

import {_} from "lodash";
var base64 = require("node-base64-image");
var allTablets;
export class LoginRoutes {

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
    loginView(){
        return[
            (req, res) => {
                // If  session is there, then destroy it.
                req.session.destroy();

                this._visitorService.allTabletLocations()
                    .then(result => {
                        this._tabletCache.set("allTabs", result.rows,function( err, success ){
                            if( !err && success ){
                                console.log( "TabletCache Created " + success);
                            }
                        });
                    });
                res.render("admin_login",{data:""});
            }
        ];
    }

    /**
     *
     * @return {*[]}
     */
    adminLogin(){
        return [
            (req, res) => {
                //noinspection JSValidateTypes
                if( req.body.inputEmail === "admin@admin.com" && req.body.inputPassword === "Lewis@3524"){
                    //noinspection JSUnresolvedVariable
                    req.session.key = true;
                    res.redirect("/allVisitors?tabId=1");
                }else{
                    res.redirect("/");
                }
            }
        ];
    }
}
