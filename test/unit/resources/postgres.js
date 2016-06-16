/**
 * postgres
 */

"use strict";


/* Node modules */


/* Third-party modules */


/* Files */
import {expect, proxyquire, sinon} from "../../helpers/configure";


describe("Postgres resource test", function () {

    beforeEach(function () {

        this.pg = {
            connect: sinon.stub()
        };

        this.postgres = proxyquire("../../src/resources/postgres", {

        }).Postgres;

    });

    describe("Methods", function () {

        describe("#constructor", function () {

            it("should set the connection string to the class", function () {

                let connection = {
                    "test" : "test"
                };
                let obj = new this.postgres(connection);
                expect(obj._connection).to.be.equal(connection);
            });
        });

        describe("#query", function () {

            it("should fail to connect, return rejected promise", function () {

                let connection = {
                    query : sinon.stub().yields(new Error("Query error"))
                };
                this.obj = new this.postgres(connection);

                return this.obj.query("query", "args")
                    .then(() => {
                        throw new Error("fail");
                    })
                    .catch((err) => {

                        expect(err).to.be.instanceof(Error);
                        expect(err.message).to.be.equal("Query error");
                        expect(connection.query).to.be.calledOnce
                            .calledWith("query", "args");
                    });
            });

            it("should connect and return the data", function () {

                let connection = {
                    query : sinon.stub().yields(null, "Data")
                };
                this.obj = new this.postgres(connection);

                return this.obj.query("query1", "args1")
                    .then((result) => {
                        expect(result).to.be.equal("Data");
                        expect(connection.query).to.be.calledOnce
                            .calledWith("query1", "args1");

                    });
            });
        });

        describe("#startTransaction", function () {

            it("should create transaction and return a promise", function () {

                let connection = {
                    query : sinon.stub().yields(null, "Data")
                };
                this.obj = new this.postgres(connection);

                return this.obj.startTransaction()
                    .then(() => {
                        expect(connection.query).to.be.calledOnce
                            .calledWith("BEGIN");
                    });
            });

            it("should return error when transaction cannot be started", function () {

                let connection = {
                    query : sinon.stub().yields(new Error("Query Error"))
                };
                this.obj = new this.postgres(connection);

                return this.obj.startTransaction()
                    .then(result => {
                        throw new Error("Fail");
                    })
                    .catch(() => {
                        expect(connection.query).to.be.calledOnce
                            .calledWith("BEGIN");
                    });
            });
        });

        describe("#endTransaction", function () {

            it("should end transaction and return a promise", function () {

                let connection = {
                    query : sinon.stub().yields(null, "Data")
                };
                this.obj = new this.postgres(connection);

                return this.obj.endTransaction()
                    .then(() => {
                        expect(connection.query).to.be.calledOnce
                            .calledWith("COMMIT");
                    });
            });

            it("should return error when transaction cannot be ended", function () {

                let connection = {
                    query : sinon.stub().yields(new Error("Query Error"))
                };
                this.obj = new this.postgres(connection);

                return this.obj.endTransaction()
                    .then(() => {
                        throw new Error("Fail");
                    })
                    .catch(() => {
                        expect(connection.query).to.be.calledOnce
                            .calledWith("COMMIT");
                    });
            });

        });
    });
});
