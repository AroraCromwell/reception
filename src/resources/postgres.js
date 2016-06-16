/**
 * postgres
 */

"use strict";

export class Postgres {

    constructor (connection) {
        this._connection = connection;
    }

    /**
     * Query
     *
     * Sends the query to Postgres, returning
     * the result
     *
     * @param {string} query
     * @param {*} args
     * @returns {Promise}
     */
    query (query, args) {

        return new Promise((resolve, reject) => {

            this._connection.query(query, args, (err, result) => {

                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });

        });
    }

    startTransaction () {
        return new Promise((resolve, reject) => {
            return this._connection.query("BEGIN", function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    endTransaction () {
        return new Promise((resolve, reject) => {
            this._connection.query("COMMIT", function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}
