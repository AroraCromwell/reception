/**
 * postgres
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DbConnect = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pg = require("pg");

var _pg2 = _interopRequireDefault(_pg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var types = _pg2.default.types;
types.setTypeParser(1114, function (stringValue) {
    return stringValue;
});

var DbConnect = exports.DbConnect = function () {
    function DbConnect(connectionString) {
        _classCallCheck(this, DbConnect);

        this._connectionString = connectionString;
    }

    /**
     * Create Connection
     * @returns {Promise}
     */


    _createClass(DbConnect, [{
        key: "createConnection",
        value: function createConnection() {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _pg2.default.connect(_this._connectionString, function (err, client) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(client);
                });
            });
        }
    }]);

    return DbConnect;
}();