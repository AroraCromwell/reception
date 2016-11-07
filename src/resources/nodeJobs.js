
import nodeSchedule from "node-schedule";
import config from "../config.json";
var exec = require('child_process').exec;

module.exports = function (visitors, statusRoutes, logger) {
    nodeSchedule.scheduleJob(config.runTime, function () {
        console.log(">>> Going to Run Cron Jobs");
        visitors.allSignOut()
                .then(() => {
                    logger.info(">>> Cron Job Signed Out All");
                    return true;
                })
                .then(() => {
                    logger.info(">>> Cron Job is going to delete all VisitorImages and Pdf");

                    var cmd = "rm -Rf '" + config.visitorImagePath + "'   '" + config.pdfPath+ "'";
                    exec(cmd, function (error, stdout, stderr) {
                        console.log(stdout);

                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });
                })
            .then(() => {
                logger.info(">>> Cron Job going to clear the device status for the day.");

                statusRoutes.cleanStatus()
                    .then(() => {
                        logger.info("Status Clean");
                    })
            })
    });
};
