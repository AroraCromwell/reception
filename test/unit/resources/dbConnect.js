/**
 * postgres
 */
"use strict";

/* Node modules */


/* Third-party modules */


/* Files */
import {expect, proxyquire, sinon} from "../../helpers/configure";


describe("dbConnect test", function () {

    beforeEach(function () {

        this.pg = {
            connect: sinon.stub()
        };

        this.DbConnect = proxyquire("../../src/resources/dbConnect", {
            pg: this.pg
        }).DbConnect;

    });

    describe("Methods", function () {

        describe("#constructor", function () {

            it("should set the connection string to the class", function () {

                let obj = new this.DbConnect("hello");
                expect(obj._connectionString).to.be.equal("hello");
            });
        });
    });

    describe("#createConnection", function () {

        beforeEach(function () {
            this.obj = new this.DbConnect("connectionString");
        });

        it("should fail to connect, return rejected promise and not disconnect", function () {

            this.pg.connect.yields(new Error("failed to connect"));
            return this.obj.createConnection()
                .then(() => {
                    throw new Error("fail");
                })
                .catch(err => {
                    expect(err).to.be.instanceof(Error);
                    expect(err.message).to.be.equal("failed to connect");
                    expect(this.pg.connect).to.be.calledOnce
                        .calledWith("connectionString");
                });
        });

        it("should create connection and return connection back", function () {

            let client = {
                query : "data"
            };

            this.pg.connect.yields(null, client);
            return this.obj.createConnection()
                .then((result) => {
                    expect(result.query).to.be.equal("data");
                    expect(this.pg.connect).to.be.calledOnce
                        .calledWith("connectionString");
                });
        });
    });
});
