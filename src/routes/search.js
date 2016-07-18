import {_} from "lodash";
export class Search {

    constructor(visitorService, logger, localStorage, io) {
        this._visitorService = visitorService;
        this._logger = logger;
        this._localStorage = localStorage;
        this._io = io;
    }


    searchAllSignIn () {
        return [
            (req, res) => {
                    this._visitorService.searchAllSignIns(req.params.id)
                    .then(result => {
                            let row = result.rows;
                            res.send({success : 1, message : "completed", data: row});

                        })
                        .catch(err => {
                            this._logger.error(err);
                            res.send({success: 0, message: "Error!", data: JSON.stringify(err), retry: 1});

                        });
            }
        ];
    }

}
