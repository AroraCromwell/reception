/**
 * postgres
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Postgres = function () {
    function Postgres(connection) {
        _classCallCheck(this, Postgres);

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


    _createClass(Postgres, [{
        key: "query",
        value: function query(_query, args) {
            var _this = this;

            return new Promise(function (resolve, reject) {

                _this._connection.query(_query, args, function (err, result) {

                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        }
    }, {
        key: "startTransaction",
        value: function startTransaction() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                return _this2._connection.query("BEGIN", function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
        }
    }, {
        key: "endTransaction",
        value: function endTransaction() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3._connection.query("COMMIT", function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
        }
    }]);

    return Postgres;
}();

exports.Postgres = Postgres;