"use strict";

export  class AutoComplete{

    constructor (visitorStore, templateManager, logger, tabletCache) {
        this._visitorStore = visitorStore;
        this._templateManager  = templateManager;
        this._logger = logger;
        this._tabletCache = tabletCache;
    }

    // Add new AutoComplete
    autoCompleteAdd(){
        return [
            (req, res) => {
                //We actually need all the tablets to be listed while adding suggestion.
                this._visitorService.allTabletLocations()
                    .then(result => {
                        res.render("autoComplete_add", {"data": result.rows});
                    })
                    .catch(err => {
                        this._logger.error(err);
                        res.send({success : 0, message : "Error!", data : JSON.stringify(err) });
                    });
            }
        ];
    }
}
