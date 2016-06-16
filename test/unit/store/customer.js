/**
 * postgres
 */
"use strict";

/* Node modules */


/* Third-party modules */


/* Files */
import {expect, proxyquire, sinon} from "../../helpers/configure";
import {CustomerStore} from "../../../src/stores/customer";
import {EventListener} from "../../../src/services/eventListener";

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
    " \"cust_country_code\": \"GB\"," +
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


describe("Customer test", function () {

    describe("Methods", function () {

        describe("#constructor", function () {

            it("should set the resource for the customer store", function () {

                let resource = {
                };

                let eventListener = {
                };

                let logger = {
                };

                let obj = new CustomerStore(resource, eventListener, logger);
                expect(obj._resource).to.be.equal(resource);
                expect(obj._eventListener).to.be.equal(eventListener);
                expect(obj._logger).to.be.equal(logger);

            });
        });
    });

    describe("#saveCustomer", function () {

        it("should return success and create a new customer", function () {

            var queries = sinon.stub();
            queries.onCall(0).resolves(
                {
                    rowCount : 0
                }
            );
            queries.onCall(1).resolves(
                {
                    response : {
                        rowCount : 0
                    }
                }
            );
            queries.onCall(2).resolves(
                {

                    rows : [{
                        "cm_request_id" : "1234556"
                    }]

                }
            );

            queries.onCall(3).resolves(
                {
                    "response" : 1
                }
            );


            let resource = {
                "query" : queries
            };

            let logger = {
                info: sinon.stub()
            };

            let payload = JSON.stringify({success: 1});

            let eventListener = new EventListener();
            let newChannelStub = sinon.stub(eventListener, "newChannel")
                .resolves(JSON.stringify({
                    payload
                }));


            let clonedCleanedData = JSON.parse(cleanedData);
            let obj = new CustomerStore(resource, eventListener,logger);
            return obj.saveCustomer(clonedCleanedData.customer)
                .then((result) => {

                    expect(newChannelStub).to.be.calledOnce
                        .calledWith("merlin_customer_creation_1234556");

                    expect(result).to.be.equal("1234556");

                    expect(resource.query).to.be.callCount(4);

                });
        });

        it("should find a customer in merlin table and should do an update", function () {

            var queries = sinon.stub();
            queries.onCall(0).resolves(
                {
                    rowCount : 1,
                    rows : [{
                        test : "test"
                    }]
                }
            );
            queries.onCall(1).resolves(
                {

                    rows : [{
                        "cm_request_id" : "1234556"
                    }]

                }
            );

            queries.onCall(2).resolves(
                {
                    "response" : 1
                }
            );

            let resource = {
                "query" : queries
            };

            let logger = {
                info: sinon.stub()
            };

            let payload = JSON.stringify({success: 1});

            let eventListener = new EventListener();
            let newChannelStub = sinon.stub(eventListener, "newChannel")
                .resolves(JSON.stringify({
                    payload
                }));

            let clonedCleanedData = JSON.parse(cleanedData);
            let obj = new CustomerStore(resource, eventListener,logger);
            return obj.saveCustomer(clonedCleanedData.customer)
                .then((result) => {

                    expect(newChannelStub).to.be.calledOnce
                        .calledWith("merlin_customer_creation_1234556");

                    expect(result).to.be.equal("1234556");
                    expect(resource.query).to.be.callCount(3);

                });
        });

        it("should find a customer in merlin table and data is same so no update is required", function () {

            var queries = sinon.stub();
            queries.onCall(0).resolves(
                {
                    rowCount : 1,
                    rows: [{
                        "name": "Colin Cow",
                        "add1": "The New Farm",
                        "add2": "Landington",
                        "city": "Fieldshire",
                        "county": "string",
                        "country": "United Kingdom",
                        "country_code": "GB",
                        "postcode": "PR3 3TP",
                        "email": "ccc@gmail.com",
                        "telephone": "078765411"
                    }]
                }
            );
            queries.onCall(1).resolves(
                {

                    rows : [{
                        "cm_request_id" : "1234556"
                    }]

                }
            );

            queries.onCall(2).resolves(
                {
                    "response" : 1
                }
            );

            let resource = {
                "query" : queries
            };

            let logger = {
                info: sinon.stub()
            };

            let payload = JSON.stringify({success: 1});

            let eventListener = new EventListener();
            let newChannelStub = sinon.stub(eventListener, "newChannel")
                .resolves(JSON.stringify({
                    payload
                }));

            let clonedCleanedData = JSON.parse(cleanedData);
            let obj = new CustomerStore(resource, eventListener,logger);
            return obj.saveCustomer(clonedCleanedData.customer)
                .then(() => {
                    throw new Error("Failed");
                })
                .catch(err => {

                    expect(newChannelStub).to.be.callCount(0);
                    expect(err).to.be.instanceOf(Error);
                    expect(resource.query).to.be.callCount(1);
                    expect(logger.info).to.be.callCount(4);
                });
        });


        it("should find a record in API table but no update is required", function () {

            var queries = sinon.stub();
            queries.onCall(0).resolves(
                {
                    rowCount : 0
                }
            );
            queries.onCall(1).resolves(
                {
                    rowCount : 1,
                    rows: [{
                        "cust_name": "Colin Cow",
                        "cust_add1": "The New Farm",
                        "cust_add2": "Landington",
                        "cust_city": "Fieldshire",
                        "cust_county": "string",
                        "cust_country": "United Kingdom",
                        "cust_country_code": "GB",
                        "cust_postcode": "PR3 3TP",
                        "cust_email": "ccc@gmail.com",
                        "cust_telephone": "078765411"
                    }]

                }
            );

            queries.onCall(2).resolves(
                {
                    "response" : 1
                }
            );

            let resource = {
                "query" : queries
            };

            let logger = {
                info: sinon.stub()
            };

            let payload = JSON.stringify({success: 1});

            let eventListener = new EventListener();
            let newChannelStub = sinon.stub(eventListener, "newChannel")
                .resolves(JSON.stringify({
                    payload
                }));

            let clonedCleanedData = JSON.parse(cleanedData);
            let obj = new CustomerStore(resource, eventListener,logger);
            return obj.saveCustomer(clonedCleanedData.customer)
                .then(() => {
                    throw new Error("Failed");
                })
                .catch(err => {

                    expect(newChannelStub).to.be.callCount(0);
                    expect(err).to.be.instanceOf(Error);
                    expect(resource.query).to.be.callCount(2);
                    expect(logger.info).to.be.callCount(5);
                });
        });

        it("should find a customer one API table and change the status to update", function () {

            var queries = sinon.stub();
            queries.onCall(0).resolves(
                {
                    rowCount : 0
                }
            );
            queries.onCall(1).resolves(
                {
                    rowCount : 1,
                    rows : [{
                        test : "test"
                    }]
                }
            );
            queries.onCall(2).resolves(
                {

                    rows : [{
                        "cm_request_id" : "1234556"
                    }]

                }
            );
            queries.onCall(3).resolves(
                {
                    "response" : 1
                }
            );

            let resource = {
                "query" : queries
            };

            let logger = {
                info: sinon.stub()
            };

            let payload = JSON.stringify({success: 1});

            let eventListener = new EventListener();
            let newChannelStub = sinon.stub(eventListener, "newChannel")
                .resolves(JSON.stringify({
                    payload
                }));

            let clonedCleanedData = JSON.parse(cleanedData);
            let obj = new CustomerStore(resource, eventListener,logger);
            return obj.saveCustomer(clonedCleanedData.customer)
                .then((result) => {

                    expect(newChannelStub).to.be.calledOnce
                        .calledWith("merlin_customer_creation_1234556");
                    expect(result).to.be.equal("1234556");
                    expect(resource.query).to.be.callCount(4);
                });
        });
    });
});
