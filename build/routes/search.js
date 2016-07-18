"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Search = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Search = exports.Search = function () {
    function Search(visitorService, logger, localStorage, io) {
        _classCallCheck(this, Search);

        this._visitorService = visitorService;
        this._logger = logger;
        this._localStorage = localStorage;
        this._io = io;
    }

    _createClass(Search, [{
        key: "searchAllSignIn",
        value: function searchAllSignIn() {
            var _this = this;

            return [function (req, res) {
                _this._visitorService.searchAllSignIns(req.params.id).then(function (result) {
                    var row = result.rows;
                    res.send({ success: 1, message: "completed", data: row });
                }).catch(function (err) {
                    _this._logger.error(err);
                    res.send({ success: 0, message: "Error!", data: JSON.stringify(err), retry: 1 });
                });
            }];
        }
    }]);

    return Search;
}();