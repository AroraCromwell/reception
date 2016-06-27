/**
 * order store
 */

"use strict";

/* Node modules */

/* Third-party modules */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OrderStore = exports.ORDER_SUCCESS = exports.ORDER_QUOTE = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Files */

var ORDER_QUOTE = exports.ORDER_QUOTE = 1;
var ORDER_SUCCESS = exports.ORDER_SUCCESS = 0;

var OrderStore = exports.OrderStore = function () {
    function OrderStore(resource, eventListener, logger) {
        _classCallCheck(this, OrderStore);

        this._resource = resource;
        this._eventListener = eventListener;
        this._logger = logger;
    }

    _createClass(OrderStore, [{
        key: "createOrder",
        value: function createOrder(data) {
            var _this = this;

            // Start transaction
            this._logger.info("Checking if order already exist in the Merlin (sophead) ");

            var selectQuery = "SELECT\n                                *\n                            FROM\n                                public.sophead\n                            WHERE\n                                company = $1\n                            AND\n                                depot = $2\n                            AND\n                                ref= $3\n                            limit 1";
            var args = [data.customer["cust_company"], data.customer["cust_depot"], data.order["order_ref"]];
            return this._resource.query(selectQuery, args).then(function (response) {

                if (response.rowCount > 0) {
                    _this._logger.error("Duplicate order! -> Order Ref: " + data.order["order_ref"]);
                    throw new Error("Duplicate Order");
                }

                _this._logger.info("Checking if order exist in the API Table (so_headers) ");
                var selectQuery = "SELECT\n                                        *\n                                    FROM\n                                        api.so_headers\n                                    WHERE\n                                        company = $1\n                                    AND\n                                        depot = $2\n                                    AND\n                                        order_ref = $3\n                                    AND\n                                        (result_message = 'OK' OR req_action = 'INSERT')\n                                    LIMIT 1";
                var args = [data.customer["cust_company"], data.customer["cust_depot"], data.order["order_ref"]];

                return _this._resource.query(selectQuery, args);
            }).then(function (response) {

                if (response.rowCount > 0) {
                    _this._logger.error("Duplicate order on API Table -> Order Ref:" + data.order["order_ref"]);
                    throw new Error("Duplicate Order");
                }

                _this._logger.info("Checking if order if all items are available in stock");

                //// Start Transaction
                _this._logger.info("Starting order transaction");
                return _this._resource.startTransaction();
            }).then(function () {

                return _this.checkOrderLinesStock(data.order);
            }).then(function (orderType) {

                _this._logger.info("Creating order -> Order Ref:" + data.order["order_ref"]);
                var insertQuery = "\n                    INSERT into api.so_headers\n                    (\n                        req_action,\n                        request_status,\n                        company,\n                        depot,\n                        usernum,\n                        customer_del_account,\n                        customer_inv_account,\n                        order_ref,\n                        order_date,\n                        order_currency,\n                        carriage_charge,\n                        printernum,\n                        delv_name,\n                        delv_add1,\n                        delv_add2,\n                        delv_city,\n                        delv_county,\n                        delv_country,\n                        delv_postcode,\n                        delv_instructions,\n                        opt_print,\n                        opt_override_printernum,\n                        opt_if_customer_on_stop,\n                        opt_if_customer_over_credit,\n                        opt_override_bin_split,\n                        opt_stq,\n                        opt_line_company_override,\n                        opt_line_depot_override,\n                        opt_body_text,\n                        opt_force_quotation,\n                        payment_method\n                    )\n                    values\n                    (\n                        $1,\n                        $2,\n                        $3,\n                        $4,\n                        $5,\n                        $6,\n                        $7,\n                        $8,\n                        $9,\n                        $10,\n                        $11,\n                        $12,\n                        $13,\n                        $14,\n                        $15,\n                        $16,\n                        $17,\n                        $18,\n                        $19,\n                        $20,\n                        $21,\n                        $22,\n                        $23,\n                        $24,\n                        $25,\n                        $26,\n                        $27,\n                        $28,\n                        $29,\n                        $30,\n                        $31\n                    )\n                    RETURNING req_id";

                var args = [data.order["req_action"], data.order["request_status"], data.order["company"], data.order["depot"], data.order["usernum"], data.customer["cust_account"], data.customer["cust_account"], data.order["order_ref"], data.order["order_date"], data.order["order_currency"], data.order["carriage_charge"], data.order["printernum"], data.order["delv_name"], data.order["delv_add1"], data.order["delv_add2"], data.order["delv_city"], data.order["delv_county"], data.order["delv_country"], data.order["delv_postcode"], data.order["delv_instructions"], data.order["opt_print"], data.order["opt_override_printernum"], data.order["opt_if_customer_on_stop"], data.order["opt_if_customer_over_credit"], data.order["opt_override_bin_split"], data.order["opt_stq"], data.order["opt_line_company_override"], data.order["opt_line_depot_override"], data.order["opt_body_text"], orderType, data.order["payment_type"]];

                return _this._resource.query(insertQuery, args);
            }).then(function (result) {

                _this._logger.info("Creating order lines");
                var requestOrderId = result.rows[0]["req_id"];
                return _this.createLines(data.order, requestOrderId).then(function () {
                    return requestOrderId;
                });
            }).then(function (requestOrderId) {
                return _this._resource.endTransaction().then(function () {
                    return requestOrderId;
                });
            }).then(function (requestOrderId) {

                _this._logger.info("Closing transaction");
                _this._logger.info("Listening for Response on -> merlin_sales_order_creation_" + requestOrderId);

                var listenQuery = "LISTEN merlin_sales_order_creation_" + requestOrderId;
                return _this._resource.query(listenQuery, []).then(function () {
                    return requestOrderId;
                });
            }).then(function (requestOrderId) {

                return _this._eventListener.newChannel("merlin_sales_order_creation_" + requestOrderId).then(function (response) {

                    _this._logger.info("Notification received on merlin_sales_order_creation_" + requestOrderId);
                    var message = JSON.parse(response);
                    var customerData = JSON.parse(message.payload);
                    if (customerData.success === 1) {
                        return requestOrderId;
                    }
                    throw new Error(customerData.message);
                });
            }).catch(function (err) {
                // Roll back transaction
                return _this._resource.endTransaction().then(function () {
                    throw err;
                });
            });
        }
    }, {
        key: "createLines",
        value: function createLines(order, requestOrderId) {
            var _this2 = this;

            var promises = [];
            _lodash._.times(_lodash._.size(order["order_lines"]), function (count) {

                var query = new Promise(function (resolve) {

                    var insertQuery = "\n                    INSERT into api.so_lines\n                    (\n                        req_id,\n                        line_no,\n                        product_code,\n                        qty_to_order,\n                        override_price\n                    )\n                    values\n                    (\n                        $1,\n                        $2,\n                        $3,\n                        $4,\n                        $5\n                    )";

                    var args = [requestOrderId, count, order["order_lines"][count]["product_code"], order["order_lines"][count]["qty_to_order"], order["order_lines"][count]["override_price"]];
                    return _this2._resource.query(insertQuery, args).then(function () {
                        resolve();
                    });
                });
                promises.push(query);
            });

            return Promise.all(promises);
        }
    }, {
        key: "checkOrderLinesStock",
        value: function checkOrderLinesStock(order) {
            var _this3 = this;

            /*
             Default to a successful order - if one product line is
             unavailable, it changes whole order to a quote
             */
            var orderType = ORDER_SUCCESS;

            var promises = [];

            _lodash._.times(_lodash._.size(order["order_lines"]), function (count) {

                var query = new Promise(function (resolve) {

                    var stockQuery = "\n                    WITH\n                        __blank_record as ( values (0) )\n                    SELECT\n                        coalesce((case when (stock.qty_hand - stock.qty_aloc) < 0\n                    THEN\n                        0\n                    ELSE\n                        (stock.qty_hand - stock.qty_aloc) end), 0)::integer as free_stock\n                    FROM\n                        __blank_record\n                    LEFT JOIN\n                        public.stock on company = 81\n                    AND\n                        depot = '0081'\n                    AND\n                        part = $1\n                    LIMIT\n                    1\n                ";

                    /* Get the list of product codes */
                    var productCode = [order["order_lines"][count]["product_code"]];

                    /* Run the query */
                    return _this3._resource.query(stockQuery, productCode).then(function (response) {

                        var freeStock = response.rows[0]["free_stock"];
                        var orderQty = order["order_lines"][count]["qty_to_order"];

                        /* If not enough stock to fulfill, change whole order to a quote */
                        if (freeStock < orderQty) {
                            orderType = ORDER_QUOTE;
                        }
                        resolve(orderType);
                    });
                });

                promises.push(query);
            });

            return Promise.all(promises).then(function (result) {

                /* Return the final order status */
                return _lodash._.last(result);
            });
        }
    }]);

    return OrderStore;
}();