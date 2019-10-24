var app_data = {};

function app_loadData(){
    const fs = require('fs');
    if(fs.existsSync('app_data.json')){
        let rawdata = fs.readFileSync('app_data.json');
        app_data = JSON.parse(rawdata);
    }
}

function app_saveData(){
    const fs = require('fs');
    fs.writeFileSync('app_data.json', JSON.stringify(app_data, null, 2));
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



function encrypt(string, secret){
    console.log(CryptoJS.AES.encrypt(string, secret).toString());
}

function decrypt(string, secret){
    return CryptoJS.AES.decrypt(string, secret).toString(CryptoJS.enc.Utf8);
}