/**
 * Created by aroras on 22/05/2016.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TemplateManager = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _path = require('path');

var _frontMatter = require('front-matter');

var _frontMatter2 = _interopRequireDefault(_frontMatter);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _htmlMinifier = require('html-minifier');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = (0, _path.join)(__dirname, '..', 'templates');
var symTemplates = Symbol('templates');

var TemplateManager = exports.TemplateManager = function () {
    /**
     * Initializes by loading the handlebar templates from the `templates` folder.
     */
    function TemplateManager() {
        _classCallCheck(this, TemplateManager);

        var templates = this[symTemplates] = [];

        (0, _fs.readdirSync)(path).filter(function (file) {
            return file.match(/\.hbs$/);
        }).forEach(function (file) {
            var data = (0, _fs.readFileSync)((0, _path.join)(path, file), 'utf8');
            var template = (0, _frontMatter2.default)(data);

            template.render = _handlebars2.default.compile(template.body);

            if (!template.attributes.name) {
                template.attributes.name = (0, _path.basename)(file, '.hbs');
            }

            templates.push(template);
        });
    }

    /**
     * Renders the email
     * @param {String} name the `name` of the email template
     * @param {{}} data the `data` with which to render the body.
     * @returns {{from: String, subject: String, body: String}}
     */


    _createClass(TemplateManager, [{
        key: 'render',
        value: function render(name, data) {
            var template = this[symTemplates].find(function (t) {
                return t.attributes.name === name;
            });

            if (!template) {
                throw new Error('missing \'' + name + '\' template definition');
            }

            var attributes = template.attributes;
            var html = template.render(data);

            return (0, _htmlMinifier.minify)(html);
        }
    }]);

    return TemplateManager;
}();