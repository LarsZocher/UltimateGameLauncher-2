
var Registry = require('winreg');
var Config = require('../config/config');
var fs = require('fs');
var path = require('path');
var vdf = require('simple-vdf');
var userConfig = require("../config/users.js");
userConfig.setDefault("steam", []);
var gamesConfig = require("../config/games.js");
gamesConfig.setDefault("steam", {});
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var user_cache = {};
var apps_cache = {};
var appsUser_cache = {};
var store_cache = {};

var oldConfig = new Config("app_data.json");
if(oldConfig.exists()){
    userConfig.data.steam = oldConfig.data.users;
    userConfig.save();
    oldConfig.delete();
}


function getGames(){
    return new Promise(res=>{
        var u = 1;

        if(getUsers().length == 0){
            u = addUsersFromSteam();
        }

        Promise.all([u]).then(values=>{
            var ids = [];
            for (const user of getUsers()) {
                ids.push(user.steam64id);
            }
            getGamesFromUsers(ids).then(data=>{
                res(data);
            });
        });
    });
}

function getAppsById(ids, force = false){
    return new Promise(res=>{
        var toRequest = [];
        var inCache = [];
        if(!force){
            for(var id of ids){
                if(!(id in apps_cache)){
                    toRequest.push(id);
                }else
                    inCache.push(id);
            }
        }else{
            toRequest = ids;
        }

        if(toRequest.length == 0){
            var result = [];
            for(var id of ids){
                result.push(apps_cache[id]);
            }
            res(result);
            return;
        }

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var result = JSON.parse(this.responseText);
                for(var app of result){
                    apps_cache[app.appId] = app;
                }
                for(var id of inCache){
                    result.push(apps_cache[id]);
                }
                res(result);
            }
        };
        for (let i = 0; i < toRequest.length; i++) {
            toRequest[i] = "STEAM_"+toRequest[i];
            
        }
        xmlhttp.open("GET", "https://ugl.seemslegit.me/api/getGames?uniqueID=" + toRequest.join(","), true);
        xmlhttp.send();
    });
}

function getStoreInfo(appid){
    return new Promise(res=>{
        if(store_cache[appid]){
            res(store_cache[appid]);
            return;
        }
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var result = JSON.parse(this.responseText);
                store_cache[appid] = result;
                res(result);
            }
        };
        xmlhttp.open("GET", "https://store.steampowered.com/api/appdetails?appids=" + appid, true);
        xmlhttp.send();
    });
}

function getGamesFromUsers(users, includeFree = 1){
    return new Promise(res => {
        var cacheName = users.join()+""+includeFree;
        console.log(`[Steam] loading games from user ${users.join(",")}`);
        if(appsUser_cache[cacheName]){
            console.log(`[Steam] loaded ${appsUser_cache[cacheName].length} games from users ${users.join(",")} from cache`);
            res(appsUser_cache[cacheName]);
            return;
        }
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if(this.responseText == "null"){
                    res();
                    console.log(`[Steam] loaded 0 games from users ${users.join(",")}`);
                    return;
                }
                var result = JSON.parse(this.responseText);
                appsUser_cache[cacheName] = result;
                for (const app of result) {
                    apps_cache[app.appId] = app;
                }
                console.log(`[Steam] loaded ${result.length} games from users ${users.join(",")}`);
                res(result);
            }
        };
        xmlhttp.open("GET", "https://ugl.seemslegit.me/api/getGamesFromUsers?id=" + users.join(",")+"&includefree="+includeFree, true);
        xmlhttp.send();
    });
}

async function getSteamUserInfo(steamId){
    if(user_cache[steamId]){
        console.log("user from cache");
        return user_cache[steamId];
    }
    let p = new Promise((res, rej) => {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if(this.responseText == "null"){
                    res();
                    return;
                }
                var parser = new DOMParser();
                var xml = parser.parseFromString(this.responseText,"text/xml");
                user_cache[steamId] = xml;
                res(xml);
            }
        };
        xmlhttp.open("GET", "https://steamcommunity.com/profiles/"+steamId+"?xml=1", true);
        xmlhttp.send();
    });
    return p;
}

function getUsers(){
    return userConfig.data.steam;
}

function addUser(user){
    if(user == null)
        return;
    if(user.name && user.steam64id){
        userConfig.data.steam.push(user);
        userConfig.save();
        console.log("[Steam] User "+user.name+" added");
    }else
        console.error("[Steam] Failed to add user");
}

async function start(appid, user = null, cb = null){
    console.log("[Steam] Opening app "+appid+" with user '"+user+"'");
    var cu = await getCurrentUser();
    if(user!=null && cu != user){
        await changeUser(user, false);
    }
    var executablePath = "\""+await getSteamExe()+"\" -applaunch "+appid;
    const { exec } = require('child_process');
    exec(executablePath, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
    setTimeout(()=>{
        if(cb!=null)
            cb();
    }, 1000);
}

function addUsersFromSteam(){
    return new Promise(res=>{
        getSteamPath().then(steamPath=>{
            var config = path.join(steamPath, "config/loginusers.vdf");
            console.log("[Steam] Adding users known from steam in: "+config);
            if(fs.existsSync(config)){
                let rawdata = fs.readFileSync(config, "utf8");
                var data = vdf.parse(rawdata);
                for (const user in data.users) {
                    addUser({
                        name: data.users[user].AccountName,
                        steam64id: user
                    });
                }
                res();
                return;
            }
        });
    });
}

function getUserOfGame(appid){
    return new Promise(res=>{
        if(appid!=null){
            if(gamesConfig.data.steam[appid]){
                for (const user of getUsers()) {
                    if(user.name == gamesConfig.data.steam[appid]){
                        res(user);
                    }
                }
            }else{
                getGames().then(apps=>{
                    for (const app of apps) {
                        if(app.appId == appid){
                            for (const user of getUsers()) {
                                if(user.steam64id == Object.keys(app.playtime)[0]){
                                    res(user);
                                }
                            }
                        }
                    }
                    res();
                });
            }
        }
    });
}

function setUserOfGame(appid, username){
    if(appid!=null && username !=null){
        gamesConfig.data.steam[appid] = username;
        gamesConfig.save();
    }
}

async function getLibraryInfo(appid){
    return new Promise(res => {
        var data = {};
        var img = new Promise(re=>{
            image('https://steamcdn-a.akamaihd.net/steam/apps/'+appid+'/library_hero.jpg?t=1568744817', {
                success : function () {
                    data.heroImage = "https://steamcdn-a.akamaihd.net/steam/apps/"+appid+"/library_hero.jpg?t=1568744817";
                    re();
                },
                failure : function () {
                    getStoreInfo(appid).then(info=>{
                        if(info[appid].success){
                            data.heroImage = info[appid].data.screenshots[0].path_full;
                            re();
                        }else{
                            data.heroImage = "https://steamcdn-a.akamaihd.net/steam/apps/"+appid+"/header.jpg?t=1568744817";
                            re();
                        }
                    });
                },
            });
        });
        var appInfo = new Promise(re => {
            if(apps_cache[appid]){
                re();
            }else{
                getAppsById(appid).then(re());
            }
        });
        Promise.all([getUserOfGame(appid), appInfo, img]).then(values =>{
            data.user = values[0].name;
            data.info = apps_cache[appid];
            if(apps_cache[appid].playtime && apps_cache[appid].playtime[values[0].steam64id])
                data.playtime = apps_cache[appid].playtime[values[0].steam64id];
            res(data);
        });
    });
}

function getShortcutOptions(appid){
    return new Promise(res=>{
        var data = {};
        getAppsById([appid]).then(info=>{
            data.img = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/"+appid+"/"+info[0].clientIcon+".ico";
            data.name = info[0].displayName;
            res(data);
        });
    });
}

async function isRunning(){
    var executablePath = "tasklist";
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    const { stdout, stderr } = await exec(executablePath);
    return stdout.includes("Steam.exe");
}

async function isLoggedIn(){
    var regKey = new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Valve\\Steam\\ActiveProcess'
    });

    let p = new Promise((res, rej) => {
        regKey.values((err, items) => {
            for (var i=0; i<items.length; i++){
                if(items[i].name == "ActiveUser"){
                    res(items[i].value != 0x0);
                }
            }
        });
    });
    return await p;
}


async function getLastUser(){
    var regKey = new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Valve\\Steam'
    });

    let p = new Promise((res, rej) => {
        regKey.values(function (err, items) {
            for (var i=0; i<items.length; i++){
                if(items[i].name == "AutoLoginUser"){
                    res(items[i].value);
                }
            }
        });
    });
    return p;
}

async function getSteamPath(){
    var regKey = new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Valve\\Steam'
    });

    let p = new Promise((res, rej) => {
        regKey.values(function (err, items) {
            for (var i=0; i<items.length; i++){
                if(items[i].name == "SteamPath"){
                    res(items[i].value);
                }
            }
        });
    });
    return p;
}

async function getSteamExe(){
    var regKey = new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Valve\\Steam'
    });

    let p = new Promise((res, rej) => {
        regKey.values(function (err, items) {
            for (var i=0; i<items.length; i++){
                if(items[i].name == "SteamExe"){
                    res(items[i].value);
                }
            }
        });
    });
    return p;
}

async function getCurrentUser(){
    var li = await isLoggedIn();
    console.log("[Steam] Logged in: "+li)
    if(li){
        return await getLastUser();
    }
    return "";
}

async function changeUser(name, oSteam = true){
    console.log("[Steam] Changing user to: "+name);
    var running = await isRunning();
    if(running){
        closeSteam();
        await timeout(1500);
    }
    var regKey = new Registry({
        hive: Registry.HKCU,
        key:  '\\Software\\Valve\\Steam'
    });
    let p = new Promise((res, rej) => {
        regKey.set('AutoLoginUser', Registry.REG_SZ, name, function() {
            if(oSteam){
                openSteam();
            }
            res();
        });
    });
    return p;
}

function closeSteam() {
    console.log("[Steam] Stopping steam");
    var executablePath = "taskkill /F /IM steam.exe";
    const { exec } = require('child_process');
    exec(executablePath, (error, stdout, stderr) => {
        
    });
}

async function openSteam() {
    console.log("[Steam] Starting steam");
    var executablePath = '"'+await getSteamExe()+'"';
    const { exec } = require('child_process');
    exec(executablePath, (error, stdout, stderr) => {
        
    });
}

async function timeout(time){
    let p = new Promise((res, rej) => {
        setTimeout(()=>{
            res();
        }, time);
    });
    return p;
}

function hasUserSG(user){
    if(!hasUserSecret(user))
        return false;
    if(!issetval(user.auth, "password"))
        return false;
    if(!issetval(user.auth, "deviceid"))
        return false;
    if(!issetval(user.auth, "identity_secret"))
        return false;
    return true;
}

function hasUserSecret(user){
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

function isDefined(object){
    return (typeof object !== 'undefined');
}

module.exports = {
    getGames,
    getUsers,
    addUser,
    start,
    isRunning,
    isLoggedIn,
    getLastUser,
    getSteamPath,
    getSteamExe,
    getCurrentUser,
    changeUser,
    closeSteam,
    openSteam,
    getSteamUserInfo,
    getAppsById,
    getUserOfGame,
    setUserOfGame,
    getLibraryInfo,
    userConfig,
    gamesConfig,
    hasUserSecret,
    hasUserSG,
    addUsersFromSteam,
    getStoreInfo,
    getShortcutOptions
};