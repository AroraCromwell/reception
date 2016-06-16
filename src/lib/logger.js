"use strict";

/* Third-party modules */
var bunyan = require("bunyan");

export class Logger {

    constructor() {
        this._log = bunyan.createLogger({
                        name: "Merlin API Logger"
                    });
    }

    info(message) {
        this._log.info(message);
    }

    warn(message) {
        this._log.info(message);
    }

    error(message) {
        this._log.error(message);
    }

    fatal(message) {
        console.log(message);
        this._log.fatal(message);
    }
}
