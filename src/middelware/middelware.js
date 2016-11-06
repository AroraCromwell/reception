/**
 * Created by aroras on 12/10/2016.
 */

var request = require('request');

module.exports = function(loginRoutes){
    return function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            const regex = /^\/api\//g;
            const  str = req.url;
            let m;
            if((m = regex.exec(str)) !== null){
                console.log("This is  an API Request");
            }else{
                if(req.session.key) {
                    console.log("This is Admin Session Data " + req.session.key);
                }else{
                    const adminRegex = /^\/adminLogin/g;
                    let lMatch;
                    if((lMatch = adminRegex.exec(str)) !== null){
                        console.log("Admin login Post request");
                    }else{
                        req.session.destroy();
                        console.log("Show Login Page");
                        req.app.get("/", loginRoutes.loginView());
                    }
                }
                next();
            }
        }
};
