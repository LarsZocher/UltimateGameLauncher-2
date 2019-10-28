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
        app_data["users"][0] = {};
        app_data["users"][0]["name"] = "null";
        app_data["users"][0]["steam64id"] = "null";
        app_data["users"][0]["auth"] = {};
        app_data["users"][0]["auth"]["password"] = "null";
        app_data["users"][0]["auth"]["shared_secret"] = "null";
        app_data["users"][0]["auth"]["deviceid"] = "null";
        app_data["users"][0]["auth"]["identity_secret"] = "null";
        app_saveData();
        return [];
    }
    if(app_data["users"].length == 1 && app_data["users"][0].name == "null" && app_data["users"][0].steam64id == "null")
        return [];
    return app_data["users"];
}

function app_userHasSG(user){
    if(!isset(user, "auth"))
        return false;
    if(!isset(user.auth, "password"))
        return false;
    if(!isset(user.auth, "shared_secret"))
        return false;
    if(!isset(user.auth, "deviceid"))
        return false;
    if(!isset(user.auth, "identity_secret"))
        return false;
    return true;
}

function isset(obj, value){
    return obj[value] && obj[value]!="null";
}


function encrypt(string, secret){
    console.log(CryptoJS.AES.encrypt(string, secret).toString());
}

function decrypt(string, secret){
    return CryptoJS.AES.decrypt(string, secret).toString(CryptoJS.enc.Utf8);
}