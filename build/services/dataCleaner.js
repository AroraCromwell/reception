"use strict";

/* Third-party modules */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataCleaner = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataCleaner = exports.DataCleaner = function () {
    function DataCleaner() {
        _classCallCheck(this, DataCleaner);
    }

    _createClass(DataCleaner, [{
        key: "cleanData",
        value: function cleanData(data) {

            return new Promise(function (resolve, reject) {

                var customer = data.customer;
                var order = data.order;

                var orderLines = data.order["order_lines"];
                delete data.order["order_lines"];

                var cleanData = {
                    customer: {},
                    order: {}
                };

                var errorLog = [];

                var customerRequiredField = ["cm_status", "company", "depot", "cust_company", "cust_depot", "cm_action", "cust_account", "cust_name", "cust_add1", "cust_city", "cust_country", "cust_postcode", "cust_email"];

                _lodash._.forIn(customer, function (value, key) {

                    if (customerRequiredField.indexOf(key) >= 0 && _lodash._.trim(value) === "") {
                        errorLog.push(key + " is required!");
                    } else {
                        cleanData.customer[key] = _lodash._.trim(value);
                    }
                });

                _lodash._.forIn(customerRequiredField, function (key) {
                    if (!customer[key]) {
                        errorLog.push(key + " is required!");
                    }
                });

                var orderRequiredField = ["req_action", "request_status", "company", "depot", "usernum", "order_ref", "order_date", "order_currency", "carriage_charge", "printernum", "delv_name", "delv_add1", "delv_city", "delv_country", "delv_postcode"];

                var orderItemsRequiredField = ["qty_to_order", "product_code", "override_price"];

                _lodash._.forIn(order, function (value, key) {

                    if (orderRequiredField.indexOf(key) >= 0 && _lodash._.trim(value) === "") {
                        errorLog.push(key + " is required!");
                    } else {
                        cleanData.order[key] = _lodash._.trim(value);
                    }
                });

                _lodash._.forIn(orderRequiredField, function (key) {
                    if (!order[key]) {
                        errorLog.push(key + " is required!");
                    }
                });

                var cleanedOrderLines = [];
                _lodash._.forIn(orderLines, function (lines) {
                    var tempOrderLines = {};

                    _lodash._.forIn(lines, function (value, key) {
                        if (orderItemsRequiredField.indexOf(key) >= 0 && _lodash._.trim(value) === "") {
                            errorLog.push(key + " is required!");
                        } else {
                            tempOrderLines[key] = _lodash._.trim(value);
                        }
                    });

                    _lodash._.forIn(orderItemsRequiredField, function (key) {
                        if (!lines[key]) {
                            errorLog.push(key + " is required!");
                        }
                    });

                    cleanedOrderLines.push(tempOrderLines);
                });

                cleanData.order["order_lines"] = cleanedOrderLines;

                if (errorLog.length > 0) {
                    return reject(errorLog);
                }

                return resolve(cleanData);
            });
        }
    }]);

    return DataCleaner;
}();