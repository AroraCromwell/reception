/**
 * Event Listener
 * Author Nitin Vaja
 */
"use strict";

import {EventEmitter} from "events";

export class EventListener extends EventEmitter {
    

     constructor(connection, logger) {
        super();

        this._connection = connection;
        this._logger = logger;
    }

    listen() {
        this._connection.on("notification", (msg) => {

            let notification = msg;

            this._logger.info(
                "New Notification Received -> Broadcasting on the correct channel now. --> " + notification.channel
            );

            this.emit(`${notification.channel}:connect`, JSON.stringify(msg));
        });

        this._connection.on("forceLogin", () => {
            console.log('an event occurred!');
        })

    }

    newChannel(channel) {

        return new Promise((resolve, reject) => {

            this.once(`${channel}:connect`, function (response) {
                resolve(response);
            });
        });
    }
}
