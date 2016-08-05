/**
 * postgres
 */

"use strict";
import pg from "pg";
var types = pg.types;
types.setTypeParser(1114, function(stringValue) {
    return stringValue;
});

export class DbConnect {

    constructor(connectionString) {
        this._connectionString = connectionString;
    }

    /**
     * Create Connection
     * @returns {Promise}
     */
    createConnection() {

        return new Promise((resolve, reject) => {
            pg.connect(this._connectionString, (err, client) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(client);
            });

        });
    }
}
