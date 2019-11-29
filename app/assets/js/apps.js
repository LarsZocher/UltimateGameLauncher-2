var app_data = {};

function app_loadData(){
    const {app} = require('electron').remote;
    const fs = require('fs');
    const path = require('path');
    var config = path.join(app.getPath("userData"), 'app_data.json');
    console.log("loading config from: "+config);
    if(fs.existsSync(config)){
        let rawdata = fs.readFileSync(config);
        app_data = JSON.parse(rawdata);
        if(!app_data.apps) {
            app_data["apps"] = {};
        }
    }
}

function app_saveData(){
    const {app} = require('electron').remote;
    const fs = require('fs');
    const path = require('path');
    var config = path.join(app.getPath("userData"), 'app_data.json');
    fs.writeFileSync(config, JSON.stringify(app_data, null, 2));
}

function isDefined(object){
    return (typeof object !== 'undefined');
}

function app_getUsers(){
    if(!isDefined(app_data["users"])){
        app_data["users"] = [];
        app_saveData();
        return [];
    }
    if(app_data["users"].length == 1 && app_data["users"][0].name == "null" && app_data["users"][0].steam64id == "null")
        return [];
    return app_data["users"];
}

function app_userHasSG(user){
    if(!app_userHasSecret(user))
        return false;
    if(!issetval(user.auth, "password"))
        return false;
    if(!issetval(user.auth, "deviceid"))
        return false;
    if(!issetval(user.auth, "identity_secret"))
        return false;
    return true;
}

function app_userHasSecret(user){
    if(!issetval(user, "auth"))
        return false;
    if(!issetval(user.auth, "shared_secret"))
        return false;
    return true;
}

function issetval(obj, value){
    return (isDefined(obj[value]) && obj[value]!="null");
}

function isset(obj){
    return (isDefined(obj) && obj!="null");
}


function encrypt(string, secret){
    return CryptoJS.AES.encrypt(string, secret).toString();
}

function decrypt(string, secret){
    return CryptoJS.AES.decrypt(string, secret).toString(CryptoJS.enc.Utf8);
}