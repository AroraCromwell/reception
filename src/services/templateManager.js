/**
 * Created by aroras on 22/05/2016.
 */
"use strict";

import { readdirSync, readFileSync } from "fs";
import { join, basename }            from "path";
import fm                            from "front-matter";
import hbs                           from "handlebars";
import { minify }                    from "html-minifier";

const path         = join(__dirname, "..", "templates");
const symTemplates = Symbol("templates");

export  class TemplateManager {
    /**
     * Initializes by loading the handlebar templates from the `templates` folder.
     */
    constructor() {
        let templates = this[symTemplates] = [];

        readdirSync(path)
            .filter((file) => {
                return file.match(/\.hbs$/);
            })
            .forEach((file) => {
                let data = readFileSync(join(path, file), "utf8");
                let template = fm(data);

                template.render = hbs.compile(template.body);

                if (!template.attributes.name) {
                    template.attributes.name = basename(file, ".hbs");
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
    render(name, data) {
        let template = this[symTemplates].find((t) => {
            return t.attributes.name === name;
        });

        if (!template) {
            throw new Error(`missing "${name}" template definition`);
        }

        let attributes = template.attributes;
        let html       = template.render(data);

        return  minify(html);
    }
}

