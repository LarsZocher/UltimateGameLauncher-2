
function getAppsById(cb, ids){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            cb(result);
        }
    };
    for (let i = 0; i < ids.length; i++) {
        ids[i] = "STEAM_"+ids[i];
        
    }
    xmlhttp.open("GET", "http://192.168.2.100/ugl/index.php/getGames?uniqueID=" + ids.join(","), true);
    xmlhttp.send();
}

function getAppsFromUser(cb, userId, onlyGames = true){
    console.log(`loading games from user ${userId}`);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            console.log(result);
            cb(result);
        }
    };
    xmlhttp.open("GET", "http://192.168.2.100/ugl/index.php/getGamesFromUser?id=" + userId, true);
    xmlhttp.send();
}

function openApp(appid, dev = false){
    var executablePath = "\"D:\\Program Files (x86)\\Steam\\Steam.exe\" -applaunch "+appid;
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

async function getCurrentUser(){
    var li = await isLoggedIn();
    if(li){
        return await getLastUser();
    }
    return "";
}


async function changeUser(user){
    var running = await isRunning();
    var cUser = await getCurrentUser();
    if(running && cUser!=user["name"]){
        var executablePath = "taskkill /F /IM steam.exe";
        const { exec } = require('child_process');
        exec(executablePath, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        });
        await timeout(1000);
    }

    console.log("Starting steam client - "+user["name"]);
    var executablePath = "\"D:\\Program Files (x86)\\Steam\\Steam.exe\" -login "+user["name"] + " " + user["pass"];
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