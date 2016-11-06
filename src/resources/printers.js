var Print = require('pliigo-cups-agent');
var PrintManager = new Print();

export default function  getPrinters () {
    return new Promise(function (resolve, reject) {
        try{
            var printersArray = PrintManager.getPrinters();
            resolve({printersArray});
        }catch (e){
            reject(e);
        }
    })
};
