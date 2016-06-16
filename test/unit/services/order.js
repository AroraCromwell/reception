/**
 * postgres
 */
"use strict";

/* Node modules */


/* Third-party modules */


/* Files */
import {expect, proxyquire, sinon} from "../../helpers/configure";


describe("Order test", function () {

    beforeEach(function () {

        this.order = proxyquire("../../src/services/order", {

        }).OrderService;

    });

    describe("Methods", function () {

        describe("#constructor", function () {

            it("should set the store to the class", function () {

                let customerStore = {
                };

                let orderStore = {
                };

                let dataCleaner = {
                };

                let logger = {
                };

                let obj = new this.order(customerStore, orderStore, dataCleaner, logger);
                expect(obj._customerStore).to.be.equal(customerStore);
                expect(obj._orderStore).to.be.equal(orderStore);
                expect(obj._dataCleaner).to.be.equal(dataCleaner);
                expect(obj._logger).to.be.equal(logger);
            });
        });
    });

    describe("#processRequest", function () {

        it("Should create a customer and order", function () {

            let dataCleaner = {
                cleanData : sinon.stub().resolves({"customer" : "test", "order" : {"order_ref" : "123456"}})
            };

            let customerStore = {
                saveCustomer : sinon.stub().resolves({})
            };

            let orderStore = {
                createOrder : sinon.stub().resolves({})
            };

            let logger = {
                info: sinon.stub(),
                error : sinon.stub()
            };

            let obj = new this.order(customerStore, orderStore, dataCleaner, logger);
            return obj.processRequest({"customer" : "test ", "order" : {"order_ref" : "123456"}})
                .then(result => {

                    expect(dataCleaner.cleanData).to.be.calledOnce
                        .calledWith({"customer" : "test ", "order" : {"order_ref" : "123456"}});
                    expect(customerStore.saveCustomer).to.be.calledOnce
                        .calledWith("test");
                    expect(orderStore.createOrder).to.be.calledOnce
                        .calledWith({"customer" : "test", "order" : {"order_ref" : "123456"}});
                });
        });

        it("Should receive update is not required error", function () {

            let dataCleaner = {
                cleanData : sinon.stub().resolves({"customer" : "test", "order" : {"order_ref" : "123456"}})
            };

            let err = new Error("Update is not required!");
            err.code = 101; // Made up error code.

            let customerStore = {
                saveCustomer : sinon.stub().rejects(err)
            };

            let orderStore = {
                createOrder : sinon.stub().resolves({})
            };

            let logger = {
                info: sinon.stub(),
                error : sinon.stub()
            };

            let obj = new this.order(customerStore, orderStore, dataCleaner, logger);
            return obj.processRequest({"customer" : "test ", "order" : {"order_ref" : "123456"}})
                .then(result => {

                    expect(dataCleaner.cleanData).to.be.calledOnce
                        .calledWith({"customer" : "test ", "order" : {"order_ref" : "123456"}});
                    expect(customerStore.saveCustomer).to.be.calledOnce
                        .calledWith("test");
                    expect(orderStore.createOrder).to.be.calledOnce
                        .calledWith({"customer" : "test", "order" : {"order_ref" : "123456"}});
                    expect(logger.info).to.be.callCount(5);
                });
        });

        it("Should failed to create customer", function () {

            let dataCleaner = {
                cleanData : sinon.stub().resolves({"customer" : "test", "order" : {"order_ref" : "123456"}})
            };

            let err = new Error("Update is not required!");

            let customerStore = {
                saveCustomer : sinon.stub().rejects(err)
            };

            let orderStore = {
                createOrder : sinon.stub().resolves({})
            };

            let logger = {
                info: sinon.stub(),
                error : sinon.stub()
            };

            let obj = new this.order(customerStore, orderStore, dataCleaner, logger);
            return obj.processRequest({"customer" : "test ", "order" : {"order_ref" : "123456"}})
                .then(() => {
                    throw new Error("Failed");
                })
                .catch((err) => {
                    expect(err).to.be.instanceof(Error);
                    expect(dataCleaner.cleanData).to.be.calledOnce
                        .calledWith({"customer" : "test ", "order" : {"order_ref" : "123456"}});
                    expect(customerStore.saveCustomer).to.be.calledOnce
                        .calledWith("test");
                    expect(orderStore.createOrder).to.be.callCount(0);
                    expect(logger.info).to.be.callCount(3);
                    expect(logger.error).to.be.callCount(1);
                });

        });

        it("Should create a customer but fails on the order", function () {

            let dataCleaner = {
                cleanData : sinon.stub().resolves({"customer" : "test", "order" : {"order_ref" : "123456"}})
            };

            let customerStore = {
                saveCustomer : sinon.stub().resolves({})
            };

            let orderStore = {
                createOrder : sinon.stub().rejects(new Error("Duplicate Order"))
            };

            let logger = {
                info: sinon.stub(),
                error : sinon.stub()
            };

            let obj = new this.order(customerStore, orderStore, dataCleaner, logger);
            return obj.processRequest({"customer" : "test ", "order" : {"order_ref" : "123456"}})
                .then(() => {
                    throw new Error("failed");
                })
                .catch((err) => {
                    expect(err).to.be.instanceof(Error);
                    expect(err.message).to.be.equal("Duplicate Order");
                    expect(dataCleaner.cleanData).to.be.calledOnce
                        .calledWith({"customer" : "test ", "order" : {"order_ref" : "123456"}});
                    expect(customerStore.saveCustomer).to.be.calledOnce
                        .calledWith("test");
                    expect(orderStore.createOrder).to.be.calledOnce
                        .calledWith({"customer" : "test", "order" : {"order_ref" : "123456"}});
                });
        });

        it("Should fail to validate data", function () {

            let dataCleaner = {
                cleanData : sinon.stub().rejects(new Error("Missing Data"))
            };

            let customerStore = {
                saveCustomer : sinon.stub().resolves({})
            };

            let orderStore = {
                createOrder : sinon.stub().rejects(new Error("Duplicate Order"))
            };

            let logger = {
                info: sinon.stub(),
                error : sinon.stub()
            };

            let obj = new this.order(customerStore, orderStore, dataCleaner, logger);
            return obj.processRequest({"customer" : "test ", "order" : {"order_ref" : "123456"}})
                .then(() => {
                    throw new Error("fail");
                })
                .catch((err) => {
                    expect(err).to.be.instanceof(Error);
                    expect(err.message).to.be.equal("Missing Data");
                    expect(dataCleaner.cleanData).to.be.calledOnce
                        .calledWith({"customer" : "test ", "order" : {"order_ref" : "123456"}});
                });
        });
    });
});
