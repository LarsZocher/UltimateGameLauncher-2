var apps_cache = {};

function getAppsById(cb, ids, force = false){
    var toRequest = [];
    var inCache = [];
    if(!force){
        for(id of ids){
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
        for(id of ids){
            result.push(apps_cache[id]);
        }
        cb(result);
        return;
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            for(app of result){
                apps_cache[app.appId] = app;
            }
            for(id of inCache){
                result.push(apps_cache[id]);
            }
            cb(result);
        }
    };
    for (let i = 0; i < toRequest.length; i++) {
        toRequest[i] = "STEAM_"+toRequest[i];
        
    }
    xmlhttp.open("GET", "http://192.168.2.100/ugl/index.php/getGames?uniqueID=" + toRequest.join(","), true);
    xmlhttp.send();
}

function getAppsFromUser(cb, userId, onlyGames = true){
    console.log(`[Steam] loading games from user ${userId}`);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if(this.responseText == "null"){
                cb([]); 
                console.log(`[Steam] loaded 0 games from user ${userId}! Is the profile private?`);
                return;
            }
            var result = JSON.parse(this.responseText);
            console.log(`[Steam] loaded ${result.length} games from user ${userId}`);
            cb(result);
        }
    };
    xmlhttp.open("GET", "http://192.168.2.100/ugl/index.php/getGamesFromUser?id=" + userId, true);
    xmlhttp.send();
}

async function openApp(appid, user = null){
    console.log("[Steam] Opening app "+appid+" with user '"+user+"'");
    var cu = await getCurrentUser();
    console.log("[Steam] "+cu+" "+ user + " - " + (cu!=user))
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
}

async function isRunning(){
    var executablePath = "tasklist";
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    const { stdout, stderr } = await exec(executablePath);
    return stdout.includes("Steam.exe");
}

async function isLoggedIn(){
    var Registry = require('winreg')
,   regKey = new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Valve\\Steam\\ActiveProcess'
    })

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
    var Registry = require('winreg')
,   regKey = new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Valve\\Steam'
    })

    let p = new Promise((res, rej) => {
        regKey.values(function (err, items) {
            for (var i=0; i<items.length; i++){
                if(items[i].name == "AutoLoginUser"){
                    res(items[i].value);
                }
            }
        });
    });
    return await p;
}

async function getSteamPath(){
    var Registry = require('winreg')
,   regKey = new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Valve\\Steam'
    })

    let p = new Promise((res, rej) => {
        regKey.values(function (err, items) {
            for (var i=0; i<items.length; i++){
                if(items[i].name == "SteamPath"){
                    res(items[i].value);
                }
            }
        });
    });
    return await p;
}

async function getSteamExe(){
    var Registry = require('winreg')
,   regKey = new Registry({
      hive: Registry.HKCU,
      key:  '\\Software\\Valve\\Steam'
    })

    let p = new Promise((res, rej) => {
        regKey.values(function (err, items) {
            for (var i=0; i<items.length; i++){
                if(items[i].name == "SteamExe"){
                    res(items[i].value);
                }
            }
        });
    });
    return await p;
}

async function getCurrentUser(){
    var li = await isLoggedIn();
    console.log("[Steam] Logged in: "+li)
    if(li){
        return await getLastUser();
    }
    return "";
}


async function changeUser(name, openSteam = true){
    console.log("[Steam] Changing user to: "+name);
    var running = await isRunning();
    if(running){
        closeSteam();
        await timeout(1000);
    }
    var Registry = require('winreg')
    ,   regKey = new Registry({
        hive: Registry.HKCU,
        key:  '\\Software\\Valve\\Steam'
    });
    let p = new Promise((res, rej) => {
        regKey.set('AutoLoginUser', Registry.REG_SZ, name, function() {
            if(openSteam){
                openSteam();
            }
            res();
        });
    });
    await p;
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
    await p;
}