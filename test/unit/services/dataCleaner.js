/**
 * postgres
 */
"use strict";

/* Node modules */


/* Third-party modules */
import {_} from "lodash";

/* Files */
import {expect, proxyquire, sinon} from "../../helpers/configure";

let data = "{" +
    " \"requestGuid\": \"9824cfd1-37a2-bf6c-354e-33ca90b6b9b6\"," +
    " \"customer\":{ \"cm_action\": \"insert\"," +
    " \"cm_status\": \"ready\"," +
    " \"company\": \"401\"," +
    " \"depot\": \"0401\"," +
    " \"cust_company\": \"401\"," +
    " \"cust_depot\": \"0401\"," +
    " \"cust_account\": \"SUN656358\"," +
    " \"cust_name\": \"Colin Cow\"," +
    " \"cust_add1\": \"The New Farm\"," +
    " \"cust_add2\": \"Landington\"," +
    " \"cust_city\": \"Fieldshire\"," +
    " \"cust_county\": \"string\"," +
    " \"cust_country\": \"United Kingdom\"," +
    " \"cust_country_code\": \"UK\"," +
    " \"cust_postcode\": \"PR3 3TP\"," +
    " \"cust_email\": \"ccc@gmail.com\"," +
    " \"cust_currency_code\": \"GBP\"," +
    " \"cust_telephone\": \"078765411\"," +
    " \"cust_delivery_code\": \"2 \"}," +
    " \"order\":{ \"req_action\": \"insert\"," +
    " \"request_status\": \"1\"," +
    " \"company\": \"401\"," +
    " \"depot\": \"0401\"," +
    " \"usernum\": \"10036\"," +
    " \"customer_del_account\": \"\"," +
    " \"customer_inv_account\": \"\"," +
    " \"order_ref\": \"3585687 SUN B2C\"," +
    " \"order_date\": \"2015-12-01\"," +
    " \"order_currency\": \"GBP\"," +
    " \"carriage_charge\": \"12.99\"," +
    " \"printernum\": \"52\"," +
    " \"delv_name\": \"Nitin Vaja\"," +
    " \"delv_add1\": \"The New Farm\"," +
    " \"delv_add2\": \"Landington\"," +
    " \"delv_city\": \"Fieldshire\"," +
    " \"delv_county\": \"string\"," +
    " \"delv_country\": \"United Kingdom\"," +
    " \"delv_postcode\": \"PR3 3TP\"," +
    " \"delv_instructions\": \"\"," +
    " \"opt_print\": \"1\"," +
    " \"opt_override_printernum\": \"52\"," +
    " \"opt_if_customer_on_stop\": \"1\"," +
    " \"opt_if_customer_over_credit\": \"2\"," +
    " \"opt_override_bin_split\": \"1\"," +
    " \"opt_stq\": \"1\"," +
    " \"opt_line_company_override\": \"81\"," +
    " \"opt_line_depot_override\": \"0081\"," +
    " \"opt_body_text\": \"\"," +
    " \"order_lines\":[{ \"product\":3," +
    " \"qty_to_order\":1," +
    " \"product_code\": \"SNR6816601D \"," +
    " \"override_price\":12.99}," +
    "{ \"product\":3," +
    " \"product_code\": \"OFI8040190K      \"," +
    " \"qty_to_order\":1," +
    " \"override_price\":16.06}]}" +
    "}";

let cleanedData = "{" +
    " \"customer\":{ \"cm_action\": \"insert\"," +
    " \"cm_status\": \"ready\"," +
    " \"company\": \"401\"," +
    " \"depot\": \"0401\"," +
    " \"cust_company\": \"401\"," +
    " \"cust_depot\": \"0401\"," +
    " \"cust_account\": \"SUN656358\"," +
    " \"cust_name\": \"Colin Cow\"," +
    " \"cust_add1\": \"The New Farm\"," +
    " \"cust_add2\": \"Landington\"," +
    " \"cust_city\": \"Fieldshire\"," +
    " \"cust_county\": \"string\"," +
    " \"cust_country\": \"United Kingdom\"," +
    " \"cust_country_code\": \"UK\"," +
    " \"cust_postcode\": \"PR3 3TP\"," +
    " \"cust_email\": \"ccc@gmail.com\"," +
    " \"cust_currency_code\": \"GBP\"," +
    " \"cust_telephone\": \"078765411\"," +
    " \"cust_delivery_code\": \"2\"}," +
    " \"order\":{ \"req_action\": \"insert\"," +
    " \"request_status\": \"1\"," +
    " \"company\": \"401\"," +
    " \"depot\": \"0401\"," +
    " \"usernum\": \"10036\"," +
    " \"customer_del_account\": \"\"," +
    " \"customer_inv_account\": \"\"," +
    " \"order_ref\": \"3585687 SUN B2C\"," +
    " \"order_date\": \"2015-12-01\"," +
    " \"order_currency\": \"GBP\"," +
    " \"carriage_charge\": \"12.99\"," +
    " \"printernum\": \"52\"," +
    " \"delv_name\": \"Nitin Vaja\"," +
    " \"delv_add1\": \"The New Farm\"," +
    " \"delv_add2\": \"Landington\"," +
    " \"delv_city\": \"Fieldshire\"," +
    " \"delv_county\": \"string\"," +
    " \"delv_country\": \"United Kingdom\"," +
    " \"delv_postcode\": \"PR3 3TP\"," +
    " \"delv_instructions\": \"\"," +
    " \"opt_print\": \"1\"," +
    " \"opt_override_printernum\": \"52\"," +
    " \"opt_if_customer_on_stop\": \"1\"," +
    " \"opt_if_customer_over_credit\": \"2\"," +
    " \"opt_override_bin_split\": \"1\"," +
    " \"opt_stq\": \"1\"," +
    " \"opt_line_company_override\": \"81\"," +
    " \"opt_line_depot_override\": \"0081\"," +
    " \"opt_body_text\": \"\"," +
    " \"order_lines\":[{ \"product\":\"3\"," +
    " \"qty_to_order\": \"1\"," +
    " \"product_code\": \"SNR6816601D\"," +
    " \"override_price\":\"12.99\"}," +
    "{ \"product\":\"3\"," +
    " \"product_code\": \"OFI8040190K\"," +
    " \"qty_to_order\":\"1\"," +
    " \"override_price\":\"16.06\"}]}" +
    "}";

describe("Data Cleaner Test", function () {

    beforeEach(function () {

        this.dataCleaner = proxyquire("../../src/services/dataCleaner", {}).DataCleaner;

    });

    describe("#cleanData", function () {

        it("should clean the data and return a clean object", function () {

            this.obj = new this.dataCleaner();
            return this.obj.cleanData(JSON.parse(data)).then((result) => {
                expect(result).to.be.eql(JSON.parse(cleanedData));
            });
        });

        it("should return error customer address 1 line is missing", function () {
            let clonedata = _.cloneDeep(JSON.parse(data), true);
            delete clonedata.customer["cust_add1"];

            this.obj = new this.dataCleaner();
            return this.obj.cleanData(clonedata)
                .then(() => {
                    throw new Error("Fail");
                })
                .catch((err) => {
                    let array = [];
                    array.push("cust_add1 is required!");
                    expect(err).to.be.eql(array);
                });
        });

        it("should return error delv_add1 line is missing", function () {

            let clonedata = _.cloneDeep(JSON.parse(data), true);
            delete clonedata.order["delv_add1"];

            this.obj = new this.dataCleaner();
            return this.obj.cleanData(clonedata)
                .then(() => {
                    throw new Error("Fail");
                })
                .catch((err) => {
                    let array = [];
                    array.push("delv_add1 is required!");
                    expect(err).to.be.eql(array);
                });
        });

        it("should return error qty_to_order line is missing", function () {

            let clonedata = _.cloneDeep(JSON.parse(data), true);
            delete clonedata.order["order_lines"][0]["qty_to_order"];

            this.obj = new this.dataCleaner();
            return this.obj.cleanData(clonedata)
                .then(() => {
                    throw new Error("Fail");
                })
                .catch((err) => {
                    let array = [];
                    array.push("qty_to_order is required!");
                    expect(err).to.be.eql(array);
                });
        });

        //it("should return error if required field is there but is empty in customer", function () {
        //
        //    let clonedata = _.cloneDeep(JSON.parse(data), true);
        //    clonedata.customer["cust_add1"] = "";
        //
        //    this.obj = new this.dataCleaner();
        //    return this.obj.cleanData(clonedata)
        //        .then(() => {
        //            throw new Error("Fail");
        //        })
        //        .catch((err) => {
        //            let array = [];
        //            array.push("cust_add1 is required!");
        //            expect(err).to.be.eql(array);
        //        });
        //});
        //
        //it("should return error if required field is there but is empty in order", function () {
        //
        //    let clonedata = _.cloneDeep(JSON.parse(data), true);
        //    clonedata.order["delv_add1"] = "";
        //
        //    this.obj = new this.dataCleaner();
        //    return this.obj.cleanData(clonedata)
        //        .then(() => {
        //            throw new Error("Fail");
        //        })
        //        .catch((err) => {
        //            let array = [];
        //            array.push("delv_add1 is required!");
        //            expect(err).to.be.eql(array);
        //        });
        //});
        //
        //it("should return error if required field is there but is empty in order", function () {
        //
        //    let clonedata = _.cloneDeep(JSON.parse(data), true);
        //    clonedata.order["order_lines"][0]["qty_to_order"] = "";
        //
        //    this.obj = new this.dataCleaner();
        //    return this.obj.cleanData(clonedata)
        //        .then(() => {
        //            throw new Error("Fail");
        //        })
        //        .catch((err) => {
        //            let array = [];
        //            array.push("qty_to_order is required!");
        //            expect(err).to.be.eql(array);
        //        });
        //});
    });
});
