/**
 * order store
 */

"use strict";

/* Node modules */


/* Third-party modules */
import {_} from "lodash";


/* Files */


export const ORDER_QUOTE = 1;
export const ORDER_SUCCESS = 0;

export class OrderStore {

    constructor (resource, eventListener, logger) {
        this._resource = resource;
        this._eventListener = eventListener;
        this._logger = logger;
    }

    createOrder (data) {

        // Start transaction
        this._logger.info("Checking if order already exist in the Merlin (sophead) ");

        let selectQuery = `SELECT
                                *
                            FROM
                                public.sophead
                            WHERE
                                company = $1
                            AND
                                depot = $2
                            AND
                                ref= $3
                            limit 1`;
        let args = [
            data.customer["cust_company"],
            data.customer["cust_depot"],
            data.order["order_ref"]
        ];
        return this._resource.query(selectQuery, args)
            .then(response => {

                if (response.rowCount > 0) {
                    this._logger.error("Duplicate order! -> Order Ref: " + data.order["order_ref"]);
                    throw new Error("Duplicate Order");
                }

                this._logger.info("Checking if order exist in the API Table (so_headers) ");
                let selectQuery = `SELECT
                                        *
                                    FROM
                                        api.so_headers
                                    WHERE
                                        company = $1
                                    AND
                                        depot = $2
                                    AND
                                        order_ref = $3
                                    AND
                                        (result_message = 'OK' OR req_action = 'INSERT')
                                    LIMIT 1`;
                let args = [
                    data.customer["cust_company"],
                    data.customer["cust_depot"],
                    data.order["order_ref"]
                ];

                return this._resource.query(selectQuery, args);
            })
            .then(response => {

                if (response.rowCount > 0) {
                    this._logger.error("Duplicate order on API Table -> Order Ref:" + data.order["order_ref"]);
                    throw new Error("Duplicate Order");
                }

                this._logger.info("Checking if order if all items are available in stock");

                //// Start Transaction
                this._logger.info("Starting order transaction");
                return this._resource.startTransaction();
            })
            .then(() => {

                return this.checkOrderLinesStock(data.order);
            })
            .then((orderType) => {

                this._logger.info("Creating order -> Order Ref:" + data.order["order_ref"]);
                var insertQuery = `
                    INSERT into api.so_headers
                    (
                        req_action,
                        request_status,
                        company,
                        depot,
                        usernum,
                        customer_del_account,
                        customer_inv_account,
                        order_ref,
                        order_date,
                        order_currency,
                        carriage_charge,
                        printernum,
                        delv_name,
                        delv_add1,
                        delv_add2,
                        delv_city,
                        delv_county,
                        delv_country,
                        delv_postcode,
                        delv_instructions,
                        opt_print,
                        opt_override_printernum,
                        opt_if_customer_on_stop,
                        opt_if_customer_over_credit,
                        opt_override_bin_split,
                        opt_stq,
                        opt_line_company_override,
                        opt_line_depot_override,
                        opt_body_text,
                        opt_force_quotation,
                        payment_method
                    )
                    values
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11,
                        $12,
                        $13,
                        $14,
                        $15,
                        $16,
                        $17,
                        $18,
                        $19,
                        $20,
                        $21,
                        $22,
                        $23,
                        $24,
                        $25,
                        $26,
                        $27,
                        $28,
                        $29,
                        $30,
                        $31
                    )
                    RETURNING req_id`;

                var args = [
                    data.order["req_action"],
                    data.order["request_status"],
                    data.order["company"],
                    data.order["depot"],
                    data.order["usernum"],
                    data.customer["cust_account"],
                    data.customer["cust_account"],
                    data.order["order_ref"],
                    data.order["order_date"],
                    data.order["order_currency"],
                    data.order["carriage_charge"],
                    data.order["printernum"],
                    data.order["delv_name"],
                    data.order["delv_add1"],
                    data.order["delv_add2"],
                    data.order["delv_city"],
                    data.order["delv_county"],
                    data.order["delv_country"],
                    data.order["delv_postcode"],
                    data.order["delv_instructions"],
                    data.order["opt_print"],
                    data.order["opt_override_printernum"],
                    data.order["opt_if_customer_on_stop"],
                    data.order["opt_if_customer_over_credit"],
                    data.order["opt_override_bin_split"],
                    data.order["opt_stq"],
                    data.order["opt_line_company_override"],
                    data.order["opt_line_depot_override"],
                    data.order["opt_body_text"],
                    orderType,
                    data.order["payment_type"]
                ];

                return this._resource.query(insertQuery, args);

            })
            .then((result) => {

                this._logger.info("Creating order lines");
                let requestOrderId = result.rows[0]["req_id"];
                return this.createLines(data.order, requestOrderId).then(() => {
                    return requestOrderId;
                });
            })
            .then((requestOrderId) => {
                return this._resource.endTransaction().then(() => {
                    return requestOrderId;
                });
            })
            .then((requestOrderId) => {

                this._logger.info("Closing transaction");
                this._logger.info("Listening for Response on -> merlin_sales_order_creation_" + requestOrderId);

                let listenQuery = "LISTEN merlin_sales_order_creation_" + requestOrderId;
                return this._resource.query (listenQuery, []).then(() => {
                    return requestOrderId;
                });

            })
            .then((requestOrderId) => {

                return this._eventListener.newChannel ("merlin_sales_order_creation_" + requestOrderId)
                    .then((response) => {

                        this._logger.info("Notification received on merlin_sales_order_creation_" + requestOrderId);
                        var message = JSON.parse(response);
                        let customerData = JSON.parse(message.payload);
                        if (customerData.success === 1) {
                            return requestOrderId;
                        }
                        throw new Error(customerData.message);

                    });


            })
            .catch (err => {
                // Roll back transaction
                return this._resource.endTransaction()
                    .then(() => {
                        throw err;
                    });
            });
    }

    createLines(order, requestOrderId) {

        let promises = [];
        _.times(_.size(order["order_lines"]), (count) => {

            let query = new Promise(resolve => {

                let insertQuery = `
                    INSERT into api.so_lines
                    (
                        req_id,
                        line_no,
                        product_code,
                        qty_to_order,
                        override_price
                    )
                    values
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )`;

                let args = [
                    requestOrderId,
                    count,
                    order["order_lines"][count]["product_code"],
                    order["order_lines"][count]["qty_to_order"],
                    order["order_lines"][count]["override_price"]
                ];
                return this._resource.query(insertQuery, args)
                    .then(() => {
                        resolve();
                    });
            });
            promises.push(query);
        });

        return Promise.all(promises);
    }

    checkOrderLinesStock(order) {

        /*
         Default to a successful order - if one product line is
         unavailable, it changes whole order to a quote
         */
        let orderType = ORDER_SUCCESS;

        let promises = [];

        _.times(_.size(order["order_lines"]), (count) => {

            let query = new Promise(resolve => {

                var stockQuery = `
                    WITH
                        __blank_record as ( values (0) )
                    SELECT
                        coalesce((case when (stock.qty_hand - stock.qty_aloc) < 0
                    THEN
                        0
                    ELSE
                        (stock.qty_hand - stock.qty_aloc) end), 0)::integer as free_stock
                    FROM
                        __blank_record
                    LEFT JOIN
                        public.stock on company = 81
                    AND
                        depot = '0081'
                    AND
                        part = $1
                    LIMIT
                    1
                `;

                /* Get the list of product codes */
                let productCode = [
                    order["order_lines"][count]["product_code"]
                ];

                /* Run the query */
                return this._resource.query(stockQuery, productCode)
                    .then(response => {

                        let freeStock = response.rows[0]["free_stock"];
                        let orderQty = order["order_lines"][count]["qty_to_order"];

                        /* If not enough stock to fulfill, change whole order to a quote */
                        if (freeStock < orderQty) {
                            orderType = ORDER_QUOTE;
                        }
                        resolve(orderType);

                    });
            });

            promises.push(query);

        });

        return Promise.all(promises)
            .then(result => {

                /* Return the final order status */
                return _.last(result);

            });

    }
}
