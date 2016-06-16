"use strict";

/* Third-party modules */
import {_} from "lodash";

export class DataCleaner {

    constructor() {

    }

    cleanData(data) {

        return new Promise(function (resolve, reject) {

            let customer = data.customer;
            let order = data.order;

            let orderLines = data.order["order_lines"];
            delete data.order["order_lines"];

            let cleanData = {
                customer: {},
                order: {}
            };

            let errorLog = [];

            let customerRequiredField = [
                "cm_status",
                "company",
                "depot",
                "cust_company",
                "cust_depot",
                "cm_action",
                "cust_account",
                "cust_name",
                "cust_add1",
                "cust_city",
                "cust_country",
                "cust_postcode",
                "cust_email"
            ];

            _.forIn (customer, function (value, key) {

                if (customerRequiredField.indexOf(key) >= 0 && _.trim(value) === "")
                {
                    errorLog.push(key + " is required!");
                }
                else
                {
                    cleanData.customer[key] = _.trim(value);
                }
            });

            _.forIn (customerRequiredField, function (key) {
                if (!customer[key]) {
                    errorLog.push(key + " is required!");
                }
            });

            let orderRequiredField = [
                "req_action",
                "request_status",
                "company",
                "depot",
                "usernum",
                "order_ref",
                "order_date",
                "order_currency",
                "carriage_charge",
                "printernum",
                "delv_name",
                "delv_add1",
                "delv_city",
                "delv_country",
                "delv_postcode"
            ];

            let orderItemsRequiredField = [
                "qty_to_order",
                "product_code",
                "override_price"
             ];

            _.forIn (order, function (value, key) {

                if (orderRequiredField.indexOf(key) >= 0 && _.trim(value) === "")
                {
                    errorLog.push(key + " is required!");
                }
                else
                {
                    cleanData.order[key] = _.trim(value);
                }
            });

            _.forIn (orderRequiredField, function (key) {
                if (!order[key]) {
                    errorLog.push(key + " is required!");
                }
            });

            let cleanedOrderLines = [];
            _.forIn (orderLines, function (lines) {
                let tempOrderLines = {};

                _.forIn(lines, function (value, key) {
                    if (orderItemsRequiredField.indexOf(key) >= 0 && _.trim(value) === "")
                    {
                        errorLog.push(key + " is required!");
                    }
                    else
                    {
                        tempOrderLines[key] = _.trim(value);
                    }
                });

                _.forIn (orderItemsRequiredField, function (key) {
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
}
