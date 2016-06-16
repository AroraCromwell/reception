# Cromwell Message Sender

Polls the database periodically to send messages to a message queue

## Config

The config is managed by environment variables to enable simple deployments (read about
[Twelve Factor Apps](http://12factor.net) for reasons why this is a good thing).

The development config can be updated in the `.env` file. This is only for use during development and must not contain
any values to environments outside of development. This is included merely as a convenience, to enable a developer to
set up their local environment quickly. **IT MUST NOT BE USED IN ANY NON-DEVELOPMENT ENVIRONMENT**. On any deployed
environment, please run with appropriate environment variables.

> The package `dotenv` is a development dependency and only included during `npm run debug`

## To run in development mode

If you look in `package.json` there are plenty of npm scripts to run.  The ones you will be mostly be interested in
during development are:

 - **npm run debug**: Runs the server in debug mode. This autoreloads on changes to the source code
 - **npm test**: Runs all the linting and unit tests
 - **npm run watch:test**: Runs the unit tests, watching for changes
 - **npm run coverage**: Runs the coverage tests and produces a report (available to view in
    `./coverage/lcov-report/index.html`)

## To run in deployed mode

Build and run the project using the following commands:

    npm run build
    ENV_VAR_1=value1 ENV_VAR2=value2 npm start
