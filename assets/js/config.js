var data = {};
var name = "config.json";

const {app} = require('electron').remote;
const fs = require('fs');
const path = require('path');

function loadData(){
    var config = path.join(app.getPath("userData"), name);
    console.log("loading config from: "+config);
    if(fs.existsSync(config)){
        let rawdata = fs.readFileSync(config);
        data = JSON.parse(rawdata);
    }
}

function saveData(){
    var config = path.join(app.getPath("userData"), name);
    fs.writeFileSync(config, JSON.stringify(data, null, 2));
}

function set(path, obj){
    var parts = path.split(".");
    var currentPath = data;
    for (var i = 0; i<parts.length; i++) {
        var part = parts[i];
        if(!isset(currentPath[part])){
            currentPath[part] = {};
        }
        if(i==parts.length-1)
            currentPath[part] = obj;
        currentPath = currentPath[part];
    }
}

function setDefault(path, obj){
    var parts = path.split(".");
    var currentPath = data;
    for (var i = 0; i<parts.length; i++) {
        var part = parts[i];
        if(!isset(currentPath[part])){
            currentPath[part] = {};
        }
        if(i==parts.length-1){
            if(!isset(currentPath[part]))
                currentPath[part] = obj;
        }
        currentPath = currentPath[part];
    }
}

function issetval(obj, value){
    return (isDefined(obj[value]) && obj[value]!="null");
}

function isset(obj){
    return (isDefined(obj) && obj!="null");
}

function isDefined(object){
    return (typeof object !== 'undefined');
}

loadData();

module.exports = {
    loadData,
    saveData,
    set,
    setDefault,
    name,
    data
};