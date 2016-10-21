/**
 * Created by aroras on 12/10/2016.
 */

var request = require('request');

module.exports = {
    authentication: function (req, res, next) {
        if (req.method === 'GET') {
            console.log('This is a GET request');
            request("http://localhost:7000/allTabletLocations", function(err, request_res, body) {
                req.my_data = request_res.body;
                next();
            });
        }
    }
};
