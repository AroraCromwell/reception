/**
 * configure
 *
 * This getss required by Mocha and
 * configures various test harnesses
 */


"use strict";


/* Node modules */


/* Third-party modules */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {noCallThru} from "proxyquire";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import "sinon-as-promised";


/* Files */


chai.use(sinonChai);
chai.use(chaiAsPromised);

let expect = chai.expect;
let proxyquire = noCallThru();

export {expect, proxyquire, sinon};
