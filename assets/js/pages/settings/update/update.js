import React from 'react';
import ReactDOM from 'react-dom';
import Switch from '../../../containers/Switch';

var config = require("../../../config");

function init(){
    ReactDOM.render(<Switch checked={config.data.settings.update.updatesOnStartup} id="updates-o-s"/>, document.getElementById('updates-o-s-c'));
    ReactDOM.render(<Switch checked={config.data.settings.update.checkForUpdates} id="check-f-u"/>, document.getElementById('check-f-u-c'));

    $("#updates-o-s").click(function(){
        config.set("settings.update.updatesOnStartup", $(this).prop('checked'));
        config.saveData();
    });
    $("#check-f-u").click(function(){
        config.set("settings.update.checkForUpdates", $(this).prop('checked'));
        config.saveData();
    });
}

module.exports = {
    init
}


