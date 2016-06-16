/**
 * postgres
 */
"use strict";

/* Node modules */


/* Third-party modules */


/* Files */
import {expect, proxyquire, sinon} from "../../helpers/configure";


describe("Event Listener", function () {

    beforeEach(function () {

        this.eventListener = proxyquire("../../src/services/eventListener", {

        }).EventListener;

    });

    describe("Methods", function () {

        describe("#constructor", function () {

            it("Should set the connection, emitter and logger", function () {

                let connection = {
                };

                let logger = {
                };

                let emitter = {
                };

                let obj = new this.eventListener(connection, logger);
                expect(obj._connection).to.be.equal(connection);
                //expect(obj._emitter).to.be.equal(emitter);
                expect(obj._logger).to.be.equal(logger);

            });
        });
    });

    describe("newChannel", function () {

        //it.skip("should create a new listner on a specific channels", function (done) {
        //    let connection = {
        //    };
        //
        //    let logger = {
        //    };
        //
        //    let emitter = {
        //        addListener: sinon.stub().yields("done")
        //    };
        //
        //    let obj = new this.eventListener(connection, emitter, logger);
        //
        //    obj.on("event_name", () => {
        //        /* Do test */
        //        done();
        //    });
        //
        //    /* Call the promise */
        //    obj.newChannel("new_channel");
        //
        //});

        it("should create a new listner on a specific channel", function (done) {
            let connection = {
            };

            let logger = {
            };

            let obj = new this.eventListener(connection, logger);

            let onSpy = sinon.spy(obj, "on");

            obj.newChannel("new_channel")
                .then(result => {
                    expect(onSpy).to.be.calledOnce
                        .calledWith("new_channel:connect");
                    expect(result).to.be.equal("done");

                    done();

                });

            obj.emit("new_channel:connect", "done");

        });
    });

});
