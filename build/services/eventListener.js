/**
 * Event Listener
 * Author Nitin Vaja
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EventListener = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("events");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventListener = exports.EventListener = function (_EventEmitter) {
    _inherits(EventListener, _EventEmitter);

    function EventListener(connection, logger) {
        _classCallCheck(this, EventListener);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EventListener).call(this));

        _this._connection = connection;
        _this._logger = logger;
        return _this;
    }

    _createClass(EventListener, [{
        key: "listen",
        value: function listen() {
            var _this2 = this;

            this._connection.on("notification", function (msg) {

                var notification = msg;

                _this2._logger.info("New Notification Received -> Broadcasting on the correct channel now. --> " + notification.channel);

                _this2.emit(notification.channel + ":connect", JSON.stringify(msg));
            });
        }
    }, {
        key: "newChannel",
        value: function newChannel(channel) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {

                _this3.once(channel + ":connect", function (response) {
                    resolve(response);
                });
            });
        }
    }]);

    return EventListener;
}(_events.EventEmitter);